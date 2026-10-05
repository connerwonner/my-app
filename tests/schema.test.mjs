import { describe, it, expect } from "vitest";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";

const schema = JSON.parse(readFileSync("schema/property.schema.json", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const load = (name) => JSON.parse(readFileSync(`tests/fixtures/${name}`, "utf8"));

function errorsFor(name) {
  validate(load(name));
  return validate.errors ?? [];
}

describe("property schema", () => {
  it("accepts a valid record", () => {
    expect(validate(load("valid.json"))).toBe(true);
  });

  it("accepts every seed record", () => {
    const seed = JSON.parse(readFileSync("data/seed/properties.seed.json", "utf8"));
    expect(seed.length).toBe(5);
    seed.forEach((r) => expect(validate(r)).toBe(true));
  });

  it("rejects a missing property_id", () => {
    const errs = errorsFor("invalid-missing-id.json");
    expect(
      errs.some((e) => e.keyword === "required" && e.params.missingProperty === "property_id")
    ).toBe(true);
  });

  it("rejects a negative price", () => {
    const errs = errorsFor("invalid-negative-price.json");
    expect(errs.some((e) => e.instancePath === "/price" && e.keyword === "minimum")).toBe(true);
  });

  it("rejects a bad ZIP", () => {
    const errs = errorsFor("invalid-bad-zip.json");
    expect(
      errs.some((e) => e.instancePath === "/address/zip_code" && e.keyword === "pattern")
    ).toBe(true);
  });

  it("rejects an unknown property field", () => {
    const errs = errorsFor("invalid-unknown-field.json");
    expect(errs.some((e) => e.keyword === "additionalProperties")).toBe(true);
  });
});