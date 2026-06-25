/**
 * @typedef {Object} Entry
 * @property {string} href
 * @property {string} date     'Mar 14'
 * @property {string} title
 * @property {string} desc
 * @property {string} category
 * @property {string} readTime
 */

/**
 * Entries grouped by year, in display order (newest first).
 * @type {{ year: number, entries: Entry[] }[]}
 */
export const entryGroups = [
  {
    year: 2026,
    entries: [
      {
        href: '/article',
        date: 'Mar 14',
        title: 'Devirtualizing VMProtect 3.x without a VM.',
        desc: 'A field guide — dispatch graph, three known handlers, and patience for fixed points.',
        category: 'Reverse',
        readTime: '22 min'
      },
      {
        href: '/article',
        date: 'Feb 02',
        title: 'ETW providers as the new strace.',
        desc: 'Every Microsoft-Windows-* provider worth subscribing to in 2026, ranked by signal density.',
        category: 'Windows',
        readTime: '17 min'
      },
      {
        href: '/article',
        date: 'Jan 18',
        title: 'Patchguard is not your friend.',
        desc: 'Why "Driver Verifier off, PatchGuard ignored" is the new normal in research VMs.',
        category: 'Windows',
        readTime: '15 min'
      }
    ]
  },
  {
    year: 2025,
    entries: [
      {
        href: '/article',
        date: 'Dec 09',
        title: 'Activation steering as cheap interpretability.',
        desc: 'Two evenings, a 7B model, and a steering vector that catches when the model is bluffing about citations.',
        category: 'ML',
        readTime: '14 min'
      },
      {
        href: '/article',
        date: 'Nov 18',
        title: 'When the JIT becomes a weapon.',
        desc: "V8 Maglev's bug class — five recent type-confusion patterns and why they keep coming back.",
        category: 'Web',
        readTime: '19 min'
      },
      {
        href: '/article',
        date: 'Oct 27',
        title: 'Anti-cheat is a UX problem.',
        desc: 'Detection is solved; experience is not. A short manifesto on what sits between a true positive and a justified ban.',
        category: 'Anti-cheat',
        readTime: '9 min'
      },
      {
        href: '/article',
        date: 'Sep 14',
        title: 'Reading transformers like assembly.',
        desc: "What you can learn from staring at attention patterns the way you'd stare at a disassembly window.",
        category: 'ML',
        readTime: '12 min'
      },
      {
        href: '/article',
        date: 'Aug 03',
        title: 'DMA cards, three years later.',
        desc: 'The state of hardware cheat hardware in 2025 — what works, what got expensive, what got banned.',
        category: 'Anti-cheat',
        readTime: '11 min'
      },
      {
        href: '/article',
        date: 'Jun 21',
        title: 'Notes from a year inside Hyper-V.',
        desc: 'Why nested virtualization is the most under-documented platform in the Windows research stack.',
        category: 'Windows',
        readTime: '16 min'
      }
    ]
  }
];
