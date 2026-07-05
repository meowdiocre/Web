/** Drizzle 0.36 typing escape hatch for JS/TS mixed writes. */

export function asInsert<T extends Record<string, unknown>>(value: T): any {
  return value;
}

export function asUpdate<T extends Record<string, unknown>>(value: T): any {
  return value;
}
