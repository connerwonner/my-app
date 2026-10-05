# Error log

## Run 1 (data/generated/run-01.raw.json)
- Validator result: 5/5 records valid (docs/evidence/validator-run-01.txt)
- Data errors captured: none
- Setup problems I fixed along the way (not data errors):
  - AI Studio rejected the strict schema: Unknown key "additionalProperties"
  - AI Studio showed an unreadable error ("Dj") when the root of the schema was an array, so I wrapped it in an object with a "listings" array
  - A paid model showed an upgrade popup, so I switched to a free-tier model

## Which layer enforces each rule
| Rule | Layer | How |
|---|---|---|
| Shape of the record, required fields, enum values | AI Studio structured output | Simplified schema (OpenAPI subset) |
| PROP-0001 / SPN-001 ID format, 2-letter state, ZIP format | Prompt + schema descriptions, then Ajv | Hints for the model, strict pattern checks in Ajv |
| Nonnegative numbers, bathrooms in 0.5 steps, max 3 sponsors | Ajv (local validator) | minimum, multipleOf, maxItems in schema/property.schema.json |
| Unknown fields rejected | Ajv (local validator) | additionalProperties: false |
| At most one primary sponsor | Validator script | Check in scripts/validate.mjs |
| Invalid records never reach the screen | UI | loadProperties() filters them and shows a warning |

## Conclusion
Run 1 passed without changes, so no regeneration was needed. The invalid fixtures in
tests/fixtures prove that the validator rejects bad data for the expected reasons.