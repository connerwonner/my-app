# Data model

## Property (primary key: property_id)
property_id, street, unit (optional), city, state, zip_code, price,
bedrooms, bathrooms, square_feet, amenities[]

## Sponsor (primary key: sponsor_id)
sponsor_id, name, category, website (optional)

## PropertySponsor (join table, composite primary key: property_id + sponsor_id)
property_id -> Property.property_id   (foreign key)
sponsor_id  -> Sponsor.sponsor_id     (foreign key)
placement   (primary | secondary)

## Relationships
One Property has many Sponsors, and one Sponsor can sponsor many Properties.
This is many-to-many, which is why PropertySponsor exists.

## How it appears in JSON
Each property record embeds its sponsors in `local_sponsors`. Each item combines
Sponsor fields with the PropertySponsor field `placement`, so the UI and voice
response need no second lookup.