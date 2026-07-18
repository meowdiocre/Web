// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { render, within } from '@testing-library/svelte/pure';
import { describe, expect, it } from 'vitest';

import PostFileImport from '$lib/components/admin/PostFileImport.svelte';

describe('post file import form', () => {
  it('submits a Markdown file to the named import action', () => {
    const { container } = render(PostFileImport, {
      message: 'The category does not exist.'
    });
    const form = within(container);
    const element = container.querySelector('form');

    expect(element).toHaveAttribute('action', '?/import');
    expect(element).toHaveAttribute('method', 'POST');
    expect(element).toHaveAttribute('enctype', 'multipart/form-data');
    expect(form.getByLabelText('Markdown file')).toHaveAttribute('accept', '.md,text/markdown');
    expect(form.getByRole('button', { name: 'import draft' })).toBeInTheDocument();
    expect(form.getByRole('alert')).toHaveTextContent('The category does not exist.');
  });
});
