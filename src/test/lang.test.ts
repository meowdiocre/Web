import { describe, it, expect } from 'vitest';

import {
  SAFE_LANGS_SET,
  ALIAS,
  normaliseLang,
  detectLang
} from '$lib/editor/lang';

describe('normaliseLang', () => {
  it('lowercases + trims', () => {
    expect(normaliseLang('  PYTHON  ')).toBe('python');
  });
  it('rewrites aliases', () => {
    expect(normaliseLang('js')).toBe('javascript');
    expect(normaliseLang('ts')).toBe('typescript');
    expect(normaliseLang('py')).toBe('python');
    expect(normaliseLang('yml')).toBe('yaml');
  });
  it('falls back to plaintext for unknown langs', () => {
    expect(normaliseLang('whatever')).toBe('plaintext');
    expect(normaliseLang('')).toBe('plaintext');
    expect(normaliseLang(null)).toBe('plaintext');
  });
  it('every value in ALIAS resolves to a known SAFE_LANG', () => {
    for (const v of Object.values(ALIAS)) {
      expect(SAFE_LANGS_SET.has(v)).toBe(true);
    }
  });
});

describe('detectLang', () => {
  it('returns plaintext for empty input', () => {
    expect(detectLang('')).toBe('plaintext');
    expect(detectLang('   \n  ')).toBe('plaintext');
  });

  it('honours shebangs', () => {
    expect(detectLang('#!/usr/bin/env python\nprint("hi")')).toBe('python');
    expect(detectLang('#!/usr/bin/env node\nconsole.log(1)')).toBe('javascript');
    expect(detectLang('#!/usr/bin/env bash\necho hi')).toBe('bash');
    expect(detectLang('#!/bin/sh\necho hi')).toBe('bash');
    expect(detectLang('#!/usr/bin/env ruby\nputs :hi')).toBe('ruby');
  });

  it('detects python keyword shape', () => {
    const src = `
def greet(name):
    return f"hello, {name}"

if __name__ == "__main__":
    greet("world")
`;
    expect(detectLang(src)).toBe('python');
  });

  it('detects typescript via type annotations', () => {
    const src = `
interface User { name: string; age: number; }
function greet(u: User): string { return u.name; }
`;
    expect(detectLang(src)).toBe('typescript');
  });

  it('detects rust via fn + impl', () => {
    const src = `
fn main() -> Result<()> {
    let mut x = vec![1, 2, 3];
    Ok(())
}

impl Display for Foo { /* ... */ }
`;
    expect(detectLang(src)).toBe('rust');
  });

  it('detects go via package + func', () => {
    const src = `
package main

func main() {
    println("hi")
}
`;
    expect(detectLang(src)).toBe('go');
  });

  it('detects x86 asm', () => {
    const src = `
.text
.globl _start
_start:
    mov rax, 1
    mov rdi, 1
    syscall
`;
    expect(detectLang(src)).toBe('asm');
  });

  it('detects sql', () => {
    expect(detectLang('SELECT id, name FROM users WHERE active = 1;')).toBe('sql');
  });

  it('detects html via doctype', () => {
    expect(detectLang('<!doctype html><html><body>hi</body></html>')).toBe('html');
  });

  it('detects bash via if [[ pattern', () => {
    const src = `
if [[ -z "$VAR" ]]; then
  echo "missing"
fi
`;
    expect(detectLang(src)).toBe('bash');
  });

  it('falls back to plaintext for ambiguous input', () => {
    expect(detectLang('just some plain text without keywords.')).toBe('plaintext');
  });

  it('always returns a value in SAFE_LANGS', () => {
    const samples = [
      '', 'a', 'def x():', 'fn x() {}', 'package main', '.text\n  mov rax, 1',
      'SELECT 1', '<!doctype html>', 'random gibberish'
    ];
    for (const s of samples) {
      expect(SAFE_LANGS_SET.has(detectLang(s))).toBe(true);
    }
  });
});
