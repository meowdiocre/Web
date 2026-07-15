/**
 * @typedef {Object} Entry
 * @property {string} href
 * @property {string} date
 * @property {string} title
 * @property {string} desc
 * @property {string} category
 */

/** @type {{ year: number, entries: Entry[] }[]} */
export const entryGroups = [
  {
    year: 2026,
    entries: [
      {
        href: '/blog/reverse/vmprotect-3x-devirt',
        date: 'Mar 14',
        title: 'Devirtualizing VMProtect 3.x without a VM.',
        desc: 'A field guide — dispatch graph, three known handlers, and patience for fixed points.',
        category: 'Reverse',
      },
      {
        href: '/blog/windows/etw-providers-as-the-new-strace',
        date: 'Feb 02',
        title: 'ETW providers as the new strace.',
        desc: 'Every Microsoft-Windows-* provider worth subscribing to in 2026, ranked by signal density.',
        category: 'Windows',
      },
      {
        href: '/blog/windows/patchguard-is-not-your-friend',
        date: 'Jan 18',
        title: 'Patchguard is not your friend.',
        desc: 'Why "Driver Verifier off, PatchGuard ignored" is the new normal in research VMs.',
        category: 'Windows',
      }
    ]
  },
  {
    year: 2025,
    entries: [
      {
        href: '/blog/ml/activation-steering-as-cheap-interpretability',
        date: 'Dec 09',
        title: 'Activation steering as cheap interpretability.',
        desc: 'Two evenings, a 7B model, and a steering vector that catches when the model is bluffing about citations.',
        category: 'ML',
      },
      {
        href: '/blog/web/when-the-jit-becomes-a-weapon',
        date: 'Nov 18',
        title: 'When the JIT becomes a weapon.',
        desc: "V8 Maglev's bug class — five recent type-confusion patterns and why they keep coming back.",
        category: 'Web',
      },
      {
        href: '/blog/anti-cheat/anti-cheat-is-a-ux-problem',
        date: 'Oct 27',
        title: 'Anti-cheat is a UX problem.',
        desc: 'Detection is solved; experience is not. A short manifesto on what sits between a true positive and a justified ban.',
        category: 'Anti-cheat',
      },
      {
        href: '/blog/ml/reading-transformers-like-assembly',
        date: 'Sep 14',
        title: 'Reading transformers like assembly.',
        desc: "What you can learn from staring at attention patterns the way you'd stare at a disassembly window.",
        category: 'ML',
      },
      {
        href: '/blog/anti-cheat/dma-cards-three-years-later',
        date: 'Aug 03',
        title: 'DMA cards, three years later.',
        desc: 'The state of hardware cheat hardware in 2025 — what works, what got expensive, what got banned.',
        category: 'Anti-cheat',
      },
      {
        href: '/blog/windows/notes-from-a-year-inside-hyper-v',
        date: 'Jun 21',
        title: 'Notes from a year inside Hyper-V.',
        desc: 'Why nested virtualization is the most under-documented platform in the Windows research stack.',
        category: 'Windows',
      }
    ]
  }
];
