import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";

const [, , filePath] = process.argv;
if (!filePath) {
  console.error("Usage: node scripts/validate.mjs <path-to-json-file>");
  process.exit(2);
}

const schema = JSON.parse(readFileSync("schema/property.schema.json", "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

let data;
try {
  data = JSON.parse(readFileSync(filePath, "utf8"));
} catch (e) {
  console.error(`FAIL: ${filePath} is not valid JSON: ${e.message}`);
  process.exit(1);
}

const records = Array.isArray(data)
  ? data
  : Array.isArray(data.listings)
    ? data.listings
    : [data];
let failures = 0;

records.forEach((record, i) => {
  const label = record?.property_id ?? `record #${i}`;
  const ok = validate(record);
  const extra = [];
  const primaries = (record?.local_sponsors ?? []).filter(s => s.placement === "primary");
  if (primaries.length > 1) extra.push("more than one primary sponsor");

  if (ok && extra.length === 0) {
    console.log(`PASS ${label}`);
  } else {
    failures++;
    console.log(`FAIL ${label}`);
    (validate.errors ?? []).forEach(err =>
      console.log(`   ${err.instancePath || "(root)"} ${err.message}`));
    extra.forEach(msg => console.log(`   ${msg}`));
  }
});

console.log(`\n${records.length - failures}/${records.length} records valid`);
process.exit(failures ? 1 : 0);