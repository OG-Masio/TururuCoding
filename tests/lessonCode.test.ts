import { describe, expect, it } from "vitest";
import { formatCode } from "../src/lib/format";

/** Every code block with "file=name" in every written lesson. */
const blocks: { where: string; file: string; code: string }[] = [];
const lessons = import.meta.glob<string>("../content/units/**/*.md", { query: "?raw", import: "default", eager: true });
for (const [path, source] of Object.entries(lessons)) {
  const text = source.replace(/\r\n/g, "\n");
  const fence = /^```\w* file=(\S+)\n([\s\S]*?)^```$/gm;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = fence.exec(text))) blocks.push({ where: `${path.replace("../content/units/", "")} block ${++n}`, file: match[1], code: match[2].replace(/\n$/, "") });
}

describe("the code in the lessons", () => {
  it("is found", () => {
    expect(blocks.length).toBeGreaterThan(60);
  });

  it("is already tidy: Format leaves every answer, starter and twist answer as it is", async () => {
    const changed: string[] = [];
    for (const block of blocks) {
      if (!/\.(html|css|js)$/.test(block.file)) continue;
      const tidy = await formatCode(block.code, block.file);
      if (tidy !== block.code) {
        const a = block.code.split("\n");
        const b = tidy.split("\n");
        const i = a.findIndex((line, k) => line !== b[k]);
        changed.push(`${block.where} (${block.file}) line ${i + 1}: ${JSON.stringify(a[i])} -> ${JSON.stringify(b[i])}`);
      }
    }
    expect(changed).toEqual([]);
  });
});
