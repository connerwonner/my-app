# ADR 001: Data contract for property listings

- Status: Accepted
- Date: 2026-10-04

## Context
The app shows property cards, detail pages, sponsor selection, and voice responses.
AI-generated data can be malformed, so we need a strict, testable contract.
All data is fictional and synthetic.

## Decision
1. JSON Schema (draft 2020-12) in `schema/property.schema.json` is the single source of truth.
2. TypeScript types are generated from it with `npm run gen:types`. Nobody edits them by hand.
3. Ajv validates at runtime, and the UI only renders records that pass.
4. Amenities are a controlled enum list.
5. Sponsors are embedded in each property record. The PropertySponsor field `placement` lives on the embedded sponsor.
6. "At most one primary sponsor" is enforced in `scripts/validate.mjs`, not in the schema.
7. `additionalProperties: false` is set on the property, address, and sponsor objects, so unknown fields are rejected.

## Alternatives considered
- Zod as the source of truth: good for TypeScript-only projects, but JSON Schema also works with AI Studio and other languages.
- Free-text amenities: rejected because of inconsistent spelling.
- Amenities as a join table: rejected as overkill until amenities need their own attributes.
- Sponsors by ID reference only: rejected for now because every card would need a second lookup.
- Writing the single-primary rule in the schema with `contains` and `minContains` (suggested by both ChatGPT and Gemini): possible later, but the validator script already enforces it.

## Consequences
- Bad data fails loudly and the UI degrades safely, showing a warning and skipping the invalid record.
- Adding an amenity means editing the schema and regenerating the types.
- Embedded sponsors duplicate the sponsor name and category across properties. ChatGPT and Gemini both flagged this. It is acceptable as a denormalized read projection but not as the canonical source of sponsor data.
- Unique `sponsor_id` values within one property are not enforced, because `uniqueItems` cannot compare a single field inside nested objects.
- AI Studio's structured output accepts only an OpenAPI subset. It rejected `additionalProperties` ("Unknown key"), gave an unreadable error when the root of the schema was an array, and only accepted a simplified schema wrapped in an object with a `listings` array. Removed keywords: additionalProperties, $schema, $id, $defs/$ref, pattern, multipleOf, uniqueItems, format, minimum/maximum, maxItems. Local Ajv validation with the full schema is the real safety net.
- Installing vitest required upgrading `@types/node` to version 24 because of a peer dependency conflict.
- The data uses informal RESO-style concepts only. It is not RESO certified or compliant.
