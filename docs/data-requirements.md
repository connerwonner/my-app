# Minimum facts by screen (all data is fictional)

## Property card (list view)
property_id, street, city, state, zip_code, price, bedrooms, bathrooms, square_feet, one hero amenity

## Detail page
Everything on the card plus: full amenities list, all local sponsors with category

## Sponsor selection
sponsor_id, sponsor name, category, placement (primary or secondary)

## Voice response
Short spoken sentence: address, price, beds/baths, and the primary sponsor name

## Ambiguous business rules to resolve
1. Is price a whole number of dollars or does it allow cents?
2. Can bathrooms be fractional (2.5)?
3. How many sponsors per property? Can there be zero?
4. Can two sponsors both be "primary"?
5. Are amenities free text or a controlled list?
6. Is zip_code a string (leading zeros) or a number?
7. Is a unit/apartment number required?

## Decisions
1. Whole dollars, integer.
2. Allowed in 0.5 steps (multipleOf 0.5).
3. 0 to 3 sponsors.
4. At most one primary (enforced in the validator, not the schema).
5. Controlled list (see ADR).
6. String, pattern ^\d{5}(-\d{4})?$
7. Optional.