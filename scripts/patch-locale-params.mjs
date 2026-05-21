import fs from "fs";
import path from "path";

const root = new URL("../src/app", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === "page.tsx") acc.push(p);
  }
  return acc;
}

let count = 0;
for (const file of walk(root)) {
  let c = fs.readFileSync(file, "utf8");
  if (!c.includes('"use client"')) continue;
  if (c.includes("withLocaleParams")) continue;

  const m = c.match(/export default function (\w+)\s*\(/);
  if (!m) {
    console.log("SKIP", file);
    continue;
  }
  const name = m[1];
  c = c.replace(/export default function (\w+)\s*\(/, "function $1(");

  if (!c.includes("with-locale-params")) {
    const idx = c.indexOf('"use client"');
    const end = c.indexOf("\n", idx);
    c =
      c.slice(0, end + 1) +
      '\nimport { withLocaleParams } from "@/lib/with-locale-params";\n' +
      c.slice(end + 1);
  }

  c = c.trimEnd() + `\n\nexport default withLocaleParams(${name});\n`;
  fs.writeFileSync(file, c);
  count++;
  console.log("OK", file);
}
console.log("Total", count);
