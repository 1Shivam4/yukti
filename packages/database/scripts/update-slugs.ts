import fs from "fs";
import path from "path";

const seedPath = path.join(__dirname, "../src/seed.ts");
const content = fs.readFileSync(seedPath, "utf-8");

const lines = content.split("\n");
const newLines = [];
let inTemplates = false;

for (const line of lines) {
  if (line.includes("const templates = [")) {
    inTemplates = true;
  }

  if (inTemplates && line.trim().startsWith('name: "')) {
    const match = line.match(/name: "(.*)"/);
    if (match) {
      const name = match[1];
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const indent = line.match(/^\s*/)?.[0] || "";
      // Check if slug already exists (idempotency)
      const prevLine = newLines[newLines.length - 1];
      if (!prevLine || !prevLine.includes("slug:")) {
        newLines.push(`${indent}slug: "${slug}",`);
      }
    }
  }

  newLines.push(line);

  if (line.trim() === "];") {
    inTemplates = false;
  }
}

fs.writeFileSync(seedPath, newLines.join("\n"));
console.log("✅ Updated seed.ts with slugs!");
