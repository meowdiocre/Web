// Minimal stub for `$app/*` imports during unit tests. Tests that need
// the real surface can replace these with vi.mock(...).
export const navigating = { subscribe: (cb: any) => { cb(null); return () => {}; } };
export const page       = { subscribe: (cb: any) => { cb({ url: new URL('http://localhost/'), params: {}, route: { id: '/' } }); return () => {}; } };
export const updated    = { subscribe: (cb: any) => { cb(false); return () => {}; } };
export function getStores() { return { navigating, page, updated }; }
