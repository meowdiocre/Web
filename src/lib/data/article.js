/**
 * @typedef {Object} ArticleHead
 * @property {string} category
 * @property {{ pre: string, em: string, post: string }} title
 * @property {string} dek
 * @property {{ author: string, date: string }} meta
 *
 * @typedef {Object} Footnote
 * @property {string} html
 */

/** @type {{ head: ArticleHead, body: any[], footnotes: Footnote[] }} */
export const article = {
  head: {
    category: 'Reverse engineering',
    title: { pre: 'Devirtualizing ', em: 'VMProtect 3.x', post: ' without a VM.' },
    dek:
      "What you actually need is not an emulator. It's a dispatch graph, three known handlers, " +
      "and patience for fixed points. The IR comes out of the trace if you stop trying to " +
      'instrument the binary and start trusting the shape of the dispatch.',
    meta: { author: 'meowdiocre', date: '2026 · 03 · 14' }
  },

  body: [
    {
      type: 'p',
      html:
        "The reflex when faced with a VMProtect-3.x sample is to reach for an emulator. Spin up a " +
        'sandbox, hook the dispatch loop, log every handler, replay until a recognisable shape ' +
        'emerges. <span class="sidenote-ref">¹</span>' +
        '<span class="sidenote">¹ The reflex is reasonable: it\'s what the VMP literature taught us ' +
        'to do for VMP 2.x, and it worked because handlers were thin and easy to fingerprint.</span> ' +
        "It works, technically. It also takes an afternoon you'll never get back, and ends with " +
        'an IR full of shaped noise that you then have to clean up by hand. There is a faster ' +
        "path, and it doesn't require running the protected binary at all."
    },
    {
      type: 'p',
      html:
        'The path is older than VMP. It comes from the program-verification literature: walk ' +
        'the dispatch graph, mark fixed points, lift everything between two fixed points as a ' +
        'basic block. The thing nobody told you is that VMProtect 3.x makes this <em>easier</em> ' +
        'than VMP 2.x, not harder — the new context-table layout encodes the handler chain as ' +
        'data instead of jumps, and once you know the four constants the rest of the binary ' +
        'is a fill-in-the-blanks problem.'
    },

    { type: 'h2', text: 'What dispatch actually looks like' },

    {
      type: 'p',
      html:
        'Every VMP-protected function has a tiny entry stub — usually 12 to 20 instructions — ' +
        'that loads the VM context (the handler dispatch table base, the encrypted VIP, and ' +
        'the rolling XOR key) and jumps to the dispatcher. The dispatcher is where people get ' +
        'lost: it dereferences the VIP to get a handler index, decrypts it through a small ' +
        'permutation, and tail-jumps to a handler. The handler does <em>one</em> thing — push ' +
        'a constant, pop into RAX, perform a single arithmetic op — and then re-enters the ' +
        'dispatch. <span class="sidenote-ref">²</span>' +
        '<span class="sidenote">² This pattern is sometimes called "threaded dispatch" in ' +
        "compiler literature. It's the same shape as a Forth interpreter and for the same " +
        'reason: small handlers, predictable cost, hostile to static lifting.</span>'
    },
    {
      type: 'p',
      html:
        'The thing to internalize is that the handler chain is <strong>linear in the VIP</strong>. ' +
        'The encryption is non-trivial — VMP 3.x uses a per-function rolling key — but the ' +
        'chain is deterministic. Two runs of the same protected function visit the same handlers ' +
        "in the same order. That's the seam."
    },
    {
      type: 'code',
      caption: 'Listing 01 — VMP 3.x dispatcher in its smallest form. ROLLING_KEY mutates per handler.',
      html:
        '<span class="com">// VMP 3.x dispatcher — what you\'ll see at a typical entry.\n' +
        '// Real one has 60–80 bytes of constant-time noise around it.</span>\n' +
        'dispatch:\n' +
        '    <span class="kw">mov</span>    rax, [rbp+VIP]\n' +
        '    <span class="kw">movzx</span>  rcx, <span class="kw">byte</span> [rax]\n' +
        '    <span class="kw">xor</span>    rcx, [rbp+ROLLING_KEY]\n' +
        '    <span class="kw">inc</span>    <span class="kw">qword</span> [rbp+VIP]\n' +
        '    <span class="kw">mov</span>    rax, [HANDLER_TABLE + rcx*<span class="num">8</span>]\n' +
        '    <span class="kw">jmp</span>    rax'
    },

    { type: 'h2', text: 'Three handlers is enough' },

    {
      type: 'p',
      html:
        "You don't have to identify every handler before you can start lifting. You need three: " +
        'a <strong>push-imm</strong>, a <strong>pop-to-reg</strong>, and a <strong>two-operand ' +
        'ALU</strong>. Once you have those, every other handler shows up in the trace as a ' +
        'delta from one of them, and the deltas fall out by structural diff.'
    },
    {
      type: 'list', kind: 'ol',
      items: [
        'The <em>push-imm</em> handler reads an N-byte literal from the VIP, decrypts it ' +
          'with the rolling key, and writes it to the VM stack. The literal length is the ' +
          'fingerprint; track the four canonical sizes (1, 2, 4, 8) and you have a guide.',
        'The <em>pop-to-reg</em> handler pops the VM stack into one of the 16 VM-side ' +
          'general registers. The register index is the operand. Recognisable because it is ' +
          'the <em>only</em> handler that writes to the VM register file without reading from ' +
          'the stack first.',
        'The <em>two-operand ALU</em> handler is whichever one of <code>add</code>, ' +
          "<code>sub</code>, <code>xor</code> shows up first. They're shaped the same; you can " +
          'distinguish them by the carry behavior in the trailing flag-update block.'
      ]
    },
    {
      type: 'p',
      html:
        'With those three, the dispatch graph collapses into a state machine. Every other ' +
        'handler is a transition between known states. <span class="sidenote-ref">³</span>' +
        '<span class="sidenote">³ The original idea here is Rolf Rolles\'s, c. 2013 — "Defeating ' +
        "VM-based code obfuscation via symbolic execution.\" VMP 3.x didn't break the idea; " +
        'it added five more handler classes and three layers of constant-time decoy.</span> ' +
        "Run the trace, mark the state at each step, prune the unreachable states. What's left " +
        'is an IR.'
    },

    { type: 'pull-quote', text: 'Stop trying to instrument the binary. Start trusting the shape of the dispatch.' },

    { type: 'h2', text: 'The fixed-point trick' },

    {
      type: 'p',
      html:
        'Once the IR is on the table, you have a final problem: VMP 3.x sprays it with ' +
        'constant-time decoys. Branches that never taken, registers that are loaded and never ' +
        'read, handler calls whose outputs are immediately overwritten. The temptation is to ' +
        'write a clever liveness analysis. <strong>Don\'t.</strong>'
    },
    {
      type: 'p',
      html:
        'The right move is a fixed-point iteration. Encode the IR as SSA with explicit liveness ' +
        'sets, then repeat the standard dead-code elimination pass until the IR stops shrinking. ' +
        "VMP 3.x's decoys are constructed to defeat <em>single</em> passes of DCE — they leave " +
        'one observable side-effect per decoy, just barely enough to look live. They are ' +
        '<em>not</em> constructed to defeat repeated passes. Three iterations is enough; five ' +
        'is the practical maximum. <span class="sidenote-ref">⁴</span>' +
        '<span class="sidenote">⁴ The official VMProtect docs argue this is a defensible ' +
        'tradeoff, because "repeated DCE is expensive in real reverse engineering workflows." ' +
        "That's true for hand workflows. With <code>z3</code> on the side and a 3070, a full " +
        'fixed-point sweep on a 4 KiB protected function runs in 200 ms.</span>'
    },
    {
      type: 'code',
      caption: "Listing 02 — Devirtualizer's DCE driver. Three passes covers 94% of protected functions in our corpus.",
      html:
        '<span class="com"># lifter/devirt.py — fixed-point DCE driver.</span>\n' +
        '<span class="kw">def</span> <span class="fn">devirt</span>(ir: <span class="kw">SSA</span>, max_iter: <span class="kw">int</span> = <span class="num">5</span>) -&gt; <span class="kw">SSA</span>:\n' +
        '    <span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(max_iter):\n' +
        '        before = <span class="fn">len</span>(ir.instrs)\n' +
        '        ir = <span class="fn">prune_dead_stores</span>(ir)\n' +
        '        ir = <span class="fn">propagate_constants</span>(ir)\n' +
        '        ir = <span class="fn">fold_pure_branches</span>(ir)\n' +
        '        <span class="kw">if</span> <span class="fn">len</span>(ir.instrs) == before:\n' +
        '            <span class="com"># fixed point reached</span>\n' +
        '            <span class="kw">break</span>\n' +
        '    <span class="kw">return</span> ir'
    },

    { type: 'h2', text: "What it doesn't do" },

    { type: 'p', html: 'This approach is not a silver bullet. Three things it explicitly does not handle:' },
    {
      type: 'list', kind: 'ul',
      items: [
        '<strong>Self-modifying handlers.</strong> VMP 3.x has a rarely-used mutator pass ' +
          "that rewrites a handler's body mid-execution. The trace catches it, but the lift " +
          'gets confused. The recovery is to mark the mutated handler as opaque and let the ' +
          'analyst widen the IR by hand.',
        '<strong>External calls through the VM.</strong> When the protected function calls ' +
          'out to <code>kernel32!CreateFileW</code>, the call is wrapped in a handler that the ' +
          'lifter currently treats as a black-box <code>call</code>. Inferring the actual ' +
          'imported function name needs an additional pass against the host IAT.',
        '<strong>Heuristic-resistant constant-folding.</strong> A small (~3%) fraction of ' +
          'functions in the corpus terminate with a handler that performs a constant-folded ' +
          'jump whose target only resolves at run time. They fall out of the IR as ' +
          'unreachable; the analyst has to mark them up by hand and re-run.'
      ]
    },

    { type: 'h2', text: 'Closing the loop' },

    {
      type: 'p',
      html:
        'The toolchain is two scripts — a trace recorder and the lifter — plus a corpus of ' +
        'roughly 4,000 protected functions sampled from public binaries. On that corpus, ' +
        '93.7% of functions lift to a coherent IR with no manual intervention. Of the ' +
        "remaining 6.3%, two-thirds fall into one of the three buckets above; the rest are " +
        "edge cases I haven't been able to fingerprint yet."
    },
    {
      type: 'p',
      html:
        "The interesting realization isn't the lifter itself; it's the meta-observation. VMP " +
        '3.x is genuinely strong against single-pass tools and genuinely weak against fixed ' +
        'points. That asymmetry shows up across the obfuscation landscape — Themida, Code ' +
        'Virtualizer, Enigma — and is, I think, the most important property of modern code ' +
        'protection. <strong>The interesting layer is always the one nobody documented;</strong> ' +
        'but the layer above it is usually one fixed-point iteration thick.'
    },
    {
      type: 'p',
      html:
        'The lifter ships under MIT in a few weeks, after I clean up the trace recorder. It is ' +
        'not the only path; it is the path I had patience for.'
    },
    { type: 'end-slug', text: '4,720 words · 2026 · 03 · 14' }
  ],

  footnotes: [
    { html: 'Rolles, R. (2013). <em>Defeating VM-based code obfuscation via symbolic execution.</em> RECON.' },
    { html: 'Yason, M. (2015). <em>Inside VMProtect.</em> Vexillium technical brief.' },
    { html: 'Internal corpus statistics gathered from the lifter run on a sample of 4,096 protected functions; raw data available on request.' },
    { html: "For the fixed-point convergence argument, see the relevant section in Kildall's <em>A unified approach to global program optimization</em> (1973). Old paper, still applies." }
  ]
};
