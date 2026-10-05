import seed from "../../data/seed/properties.seed.json";
import { loadProperties } from "../lib/loadProperties";

export function PropertyList() {
  const { valid, invalidCount } = loadProperties(seed);

  return (
    <section className="space-y-4">
      {invalidCount > 0 && (
        <p role="alert" className="rounded border border-red-500 p-3 text-red-500">
          {invalidCount} listing(s) could not be shown because the data was invalid.
        </p>
      )}
      {valid.map((p) => (
        <article key={p.property_id} className="rounded border p-4">
          <h3 className="font-semibold">
            {p.address.street}
            {p.address.unit ? `, Unit ${p.address.unit}` : ""}, {p.address.city}, {p.address.state} {p.address.zip_code}
          </h3>
          <p>
            ${p.price.toLocaleString()} · {p.bedrooms} bd · {p.bathrooms} ba · {p.square_feet.toLocaleString()} sq ft
          </p>
          <p>Amenities: {p.amenities.join(", ") || "None listed"}</p>
          <p>Sponsors: {p.local_sponsors.map((s) => s.name).join(", ") || "None"}</p>
        </article>
      ))}
    </section>
  );
}