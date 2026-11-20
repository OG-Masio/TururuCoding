import { describe, expect, it } from "vitest";
import { buildPreview, buildStandalone } from "../src/lib/preview";

const options = { token: "tok", assetBase: "https://site.test/sandbox/" };

describe("preview page", () => {
  it("puts the helper right after <head>, on the same line", () => {
    const html = buildPreview({ "index.html": "<!DOCTYPE html>\n<html>\n<head>\n<title>x</title>\n</head>\n<body><p>hi</p></body>\n</html>\n" }, options);
    expect(html.startsWith("<!DOCTYPE html>\n<html>\n<head><script data-tc-helper>")).toBe(true);
    // The user's own lines keep their line numbers.
    expect(html.split("\n").length).toBe(8);
  });

  it("still works without head, html or doctype", () => {
    expect(buildPreview({ "index.html": "<p>hi</p>" }, options)).toMatch(/^<script data-tc-helper>.*<\/script><p>hi<\/p>$/s);
    expect(buildPreview({ "index.html": "<!DOCTYPE html><p>hi</p>" }, options).startsWith("<!DOCTYPE html><script data-tc-helper>")).toBe(true);
  });

  it("puts linked CSS and JavaScript files into the page", () => {
    const html = buildPreview(
      {
        "index.html": '<head><link rel="stylesheet" href="style.css"></head><body><script src="script.js"></script></body>',
        "style.css": "p { color: red; }",
        "script.js": 'console.log("</script>");',
      },
      options,
    );
    expect(html).toContain('<style data-file="style.css">\np { color: red; }</style>');
    expect(html).toContain('<script data-file="script.js">\nconsole.log("<\\/script>");</script>');
    expect(html).not.toContain('href="style.css"');
  });

  it("leaves links to files that do not exist alone", () => {
    const html = buildPreview({ "index.html": '<link rel="stylesheet" href="missing.css"><script src="https://cdn.test/x.js"></script>' }, options);
    expect(html).toContain('href="missing.css"');
    expect(html).toContain('src="https://cdn.test/x.js"');
  });

  it("points sample images at this site", () => {
    const html = buildPreview({ "index.html": '<img src="images/bird.svg"><img src=\'./images/a.svg\'><div style="background: url(images/b.svg)"></div>' }, options);
    expect(html).toContain('src="https://site.test/sandbox/images/bird.svg"');
    expect(html).toContain("src='https://site.test/sandbox/images/a.svg'");
    expect(html).toContain("url(https://site.test/sandbox/images/b.svg)");
  });

  it("makes a page for lessons that have only CSS or JavaScript", () => {
    const html = buildPreview({ "script.js": "console.log(1)" }, options);
    expect(html).toContain('<script data-file="script.js">\nconsole.log(1)</script>');
  });

  it("shows another file when asked", () => {
    const html = buildPreview({ "index.html": "<p>home</p>", "about.html": "<p>about</p>" }, { ...options, entry: "about.html" });
    expect(html).toContain("<p>about</p>");
    expect(html).not.toContain("<p>home</p>");
  });

  it("marks its messages with the token", () => {
    expect(buildPreview({ "index.html": "<p>hi</p>" }, { ...options, token: "abc123" })).toContain('var T="abc123"');
  });
});

describe("download", () => {
  it("makes one file without the helper", () => {
    const html = buildStandalone({ "index.html": '<head><link rel="stylesheet" href="style.css"></head><p>hi</p>', "style.css": "p{}" });
    expect(html).toBe("<head><style>\np{}</style></head><p>hi</p>");
  });
});
