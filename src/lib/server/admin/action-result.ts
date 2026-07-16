export type FormValues = Record<string, string>;

export interface ActionFailure {
  ok: false;
  message: string;
  action?: string;
  fieldErrors?: Record<string, string>;
  values?: FormValues;
  tagSlugs?: string[];
}

export type ActionSuccess<T extends Record<string, unknown> = Record<string, unknown>> = {
  ok: true;
  action?: string;
  message?: string;
} & T;

export type ActionResult<T extends Record<string, unknown> = Record<string, unknown>> =
  | ActionFailure
  | ActionSuccess<T>;

export function actionFailure(
  message: string,
  options: Omit<ActionFailure, 'ok' | 'message'> = {}
): ActionFailure {
  return { ok: false, message, ...options };
}

export function actionSuccess<T extends Record<string, unknown> = Record<string, unknown>>(
  options: T = {} as T
): ActionSuccess<T> {
  return { ok: true, ...options } as ActionSuccess<T>;
}

export function formValues(input: Record<string, unknown>): FormValues {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, String(value ?? '')])
  );
}
