# AI collaboration log

All prompts used fictional listing requirements and my own schema. No secrets or personal data were included.

## Entry 1: ChatGPT
- Date: 2026-10-04
- Prompt:
  > Given these fictional listing requirements, propose a strict JSON Schema. Identify ambiguous business rules before writing the schema. Then provide valid and intentionally invalid examples and explain what a validator should reject.
  >
  > Requirements: a fictional real-estate app needs property_id, address fields, price, bedrooms, bathrooms, square_feet, amenities, zip_code, and local_sponsors (0 to 3 per property, one may be primary).
  >
  > Also, here is my schema. Identify normalization problems. Specifically decide whether amenities should be free text, controlled values, or a join table, and whether embedding sponsors in each property causes duplication problems.
  >
  > (contents of schema/property.schema.json pasted here)
- Useful output:
  - Listed the ambiguous rules before writing the schema: whether price is dollars or cents, that "one may be primary" means a primary sponsor is not required, and whether sponsor IDs must be unique within a property.
  - Confirmed that amenities should be controlled values, not free text, because of spelling variants such as "central AC" and "Central Air". A join table only makes sense in a relational database where amenities are managed independently.
  - Explained the sponsor duplication problem: if one sponsor appears on thousands of properties, a change to its name or website creates update anomalies. It recommended a separate Sponsor entity with a PropertySponsor join table that holds `placement`, which matches my docs/data-model.md.
  - Said embedded sponsors are acceptable as a deliberate denormalized read projection, as long as that is understood as duplication.
  - Noted that `uniqueItems` cannot enforce unique `sponsor_id` values inside nested objects.
  - Noted that `format: uri` is only an annotation unless format assertion is enabled. In my setup Ajv with ajv-formats does assert it.
  - Gave a clear list of invalid cases: bad ID, bad ZIP, bad bathrooms, unknown amenity, duplicate amenity, more than 3 sponsors, two primary sponsors, unknown field.
- Rejected output:
  - Did not replace my schema with its rewritten version. It was almost identical to mine, and its only real addition was a `contains` / `minContains` rule for one primary sponsor.
  - Did not adopt its relational Sponsor, Amenity, and join tables. That is beyond the scope of this lab, so it is recorded as a consequence in ADR 001.
  - Did not use its partial invalid examples (for example only `{"property_id": "PROPERTY-42"}`), because they fail for many reasons at once. My fixtures are full records with exactly one defect each.
  - Did not copy the redundant `"minItems": 0`.
- Verification:
  - Compared its schema line by line against schema/property.schema.json.
  - Ran an invalid fixture with two primary sponsors (tests/fixtures/invalid-two-primary.json). The validator rejected it with "more than one primary sponsor" (docs/evidence/validator-two-primary.txt).
  - Ran `npm test` (docs/evidence/test-output.txt) and `npm run validate` on the seed file (docs/evidence/validator-seed.txt).
- Commit: (add the hash after Step 14)

## Entry 2: Gemini
- Date: 2026-10-04
- Prompt: Same prompt as Entry 1, including the pasted schema.
- Useful output:
  - Pointed out that `enum: ["primary", "secondary"]` on each sponsor allows several primary sponsors, so the rule needs a separate constraint.
  - Raised questions I had not asked: whether quarter-baths (0.25) are allowed, whether 0 bathrooms is valid, and whether `unit` should be required for multi-family properties.
  - Gave a short table comparing amenities and sponsors. It said to keep amenities as a controlled enum array, and that a join table adds nesting without benefit unless amenities need their own details (such as "heated pool").
  - Explained the denormalization risk of embedded sponsors and suggested keeping them embedded in the API payload but using a `property_sponsors` join table in a normalized database.
- Rejected output:
  - Its schema uses the key `"comment"`. That is not a JSON Schema keyword (the standard one is `$comment`), and my Ajv validator runs in strict mode, so I did not copy it.
  - Its `contains` block for the primary rule has no `required: ["placement"]`, so an object with no placement would match it. ChatGPT's version includes `required`.
  - Its invalid example B puts four defects in one record, which does not show which rule rejected which value. I wrote one fixture per defect instead.
  - Its examples are fragments, not complete records, so I did not use them as fixtures.
- Verification:
  - Compared its schema against mine and against ChatGPT's. The shared addition was the single-primary rule.
  - Ran the two-primary fixture through my validator (docs/evidence/validator-two-primary.txt).
  - Ran `npm test` and confirmed all fixtures fail for the expected reason (docs/evidence/test-output.txt).
- Commit: (add the hash after Step 14)

## Entry 3: Gemini in AI Studio (data generation)
- Date: 2026-10-04
- Prompt: The generation prompt with five fictional property notes and the instruction to return a JSON object with a "listings" array of 5 records.
- Useful output: data/generated/run-01.raw.json, 5 records, all valid.
- Rejected output: My strict schema. AI Studio would not accept it (Unknown key "additionalProperties"), so I used a simplified schema wrapped in an object with a "listings" array.
- Verification: `npm run validate` gave 5/5 valid (docs/evidence/validator-run-01.txt).
- Commit: (add the hash after Step 14)

## Decisions after comparing both answers
- Amenities stay a controlled enum list. Both AIs agreed, and it avoids inconsistent spelling.
- Sponsors stay embedded in each property as a deliberate denormalized read projection. Both AIs identified the duplication problem, and ADR 001 lists it as a consequence.
- "At most one primary sponsor" is enforced in scripts/validate.mjs. Both AIs showed it can also be written in the schema with `contains` and `minContains`, which is a possible later change.
- Known gap: unique `sponsor_id` values within a property are not enforced yet. ChatGPT noted this cannot be done with `uniqueItems`.