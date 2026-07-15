# Category Default Icons Design

## Goal

Use clearer default icons for the five seeded categories.

## Mapping

- `Reverse`: `debug`
- `Windows`: `app-windows`
- `ML`: `ai-scan`
- `Web`: `globe`
- `Anti-cheat`: `shield`

## Scope

Update the seed-data icon mapping and its test. Do not migrate or overwrite existing database categories. Existing categories can be updated through the admin icon picker or by reseeding.

## Verification

Run the seed-data test, `npm run check`, and the full test suite.
