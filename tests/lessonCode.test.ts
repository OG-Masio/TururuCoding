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

  it("has no drawings made of line characters", () => {
    // The code font has no line characters (┌ ─ │ ►). The browser takes them from another font with
    // another width, and the drawing does not line up. Draw with real boxes: see .boxmodel and .flow in app.css.
    const drawn = Object.entries(lessons)
      .filter(([, source]) => /[\u2500-\u257f\u25ba\u25c4]/.test(source))
      .map(([path]) => path.replace("../content/units/", ""));
    expect(drawn).toEqual([]);
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
