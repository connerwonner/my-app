import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "../../schema/property.schema.json";
import type { Property } from "../types/property";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

export function loadProperties(raw: unknown): { valid: Property[]; invalidCount: number } {
  const list = Array.isArray(raw) ? raw : [];
  const valid: Property[] = [];
  let invalidCount = 0;
  for (const item of list) {
    if (validate(item)) valid.push(item as Property);
    else invalidCount++;
  }
  return { valid, invalidCount };
}