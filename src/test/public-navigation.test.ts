// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte/pure';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

import Nav from '$lib/components/Nav.svelte';
import Footer from '$lib/components/Footer.svelte';
import TmuxKeymap from '$lib/components/TmuxKeymap.svelte';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe('public mobile navigation', () => {
  it('renders an application bar with direct routes and a menu drawer', async () => {
    const { container } = render(Nav, { current: 'writing' });
    const mobile = within(container).getByTestId('mobile-app-shell');
    const primary = within(mobile).getByRole('navigation', { name: 'Mobile primary' });

    expect(within(mobile).getByTestId('mobile-app-bar')).toHaveTextContent('writing');
    expect(within(primary).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(primary).getByRole('link', { name: 'Writing' })).toHaveAttribute('aria-current', 'page');
    expect(within(primary).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');

    await fireEvent.click(within(primary).getByRole('button', { name: 'Open menu' }));
    expect(within(mobile).getByRole('navigation', { name: 'Mobile menu' })).toBeInTheDocument();
  });

  it('uses the mobile menu for social contacts instead of duplicate routes', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const { container } = render(Nav, { current: 'home' });
    const mobile = within(container).getByTestId('mobile-app-shell');
    const primary = within(mobile).getByRole('navigation', { name: 'Mobile primary' });

    await fireEvent.click(within(primary).getByRole('button', { name: 'Open menu' }));
    const menu = within(mobile).getByRole('navigation', { name: 'Mobile menu' });

    expect(within(menu).queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: 'Writing' })).not.toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
    expect(within(menu).getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/meowdiocre'
    );

    await fireEvent.click(within(menu).getByRole('button', { name: /copy discord username/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('meowdiocre'));
    expect(within(menu).getByText('Copied')).toHaveAttribute('aria-live', 'polite');
  });

  it.each(['minimal', 'paper', 'article'] as const)('renders a dedicated %s mobile footer', (variant) => {
    const { container } = render(Footer, { variant });

    expect(within(container).getByTestId('mobile-footer')).toHaveAttribute('data-variant', variant);
    expect(within(container).getByTestId('desktop-footer')).toBeInTheDocument();
  });

  it('does not show tmux notifications on touch-size screens', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      media: '(max-width: 900px) and (pointer: coarse)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })));

    render(TmuxKeymap);
    await vi.advanceTimersByTimeAsync(800);

    expect(screen.queryByText(/this site responds to/i)).not.toBeInTheDocument();
  });

  it('enables phone safe-area layout', () => {
    const app = readFileSync(resolve('src/app.html'), 'utf8');
    expect(app).toContain('viewport-fit=cover');
  });

  it('keeps article reader controls above the mobile app bar', () => {
    const reader = readFileSync(resolve('src/lib/components/ReaderControls.svelte'), 'utf8');
    expect(reader).toContain("max-[900px]:bottom-[calc(78px+env(safe-area-inset-bottom))]");
  });
});
