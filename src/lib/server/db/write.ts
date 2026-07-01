/**
 * Drizzle 0.36 narrows insert/update payloads to required columns only in
 * this mixed JS/TS setup. Keep the escape hatch isolated to the DB layer.
 */

export function asInsert(value: object): any {
  return value;
}

export function asUpdate(value: object): any {
  return value;
}
