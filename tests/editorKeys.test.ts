import { describe, expect, it } from "vitest";
import { CSS_WORDS, cssToSnippet, cssToText, isCssShortForm } from "../src/lib/cssShortForms";
import { formatCode } from "../src/lib/format";
import { wrapText } from "../src/lib/wrapWith";
import { aloneInContainer, expandToSnippet, expandToText, isAbbreviation, suggestsItself } from "../src/lib/editorKeys";

describe("short forms (Emmet)", () => {
  it("accepts real short forms", () => {
    for (const text of ["p", "h1", "ul>li*3", "a", "div.card", ".card", "#main", "!", "img", "nav>a*4", "table>tr*2>td*3", "p.note", "a:link", "btn", "section#about>h2+p", "ul>li.item$*3", "p{Hello}"]) {
      expect(isAbbreviation(text), text).toBe(true);
    }
  });

  it("leaves normal words and unfinished short forms alone", () => {
    for (const text of ["hello", "you", "Sam", "the", "tururu", "www.example", "ul>", "div.", "3", "", ".", "e.g", "p,", "Link", "Menu", "Table"]) {
      expect(isAbbreviation(text), text).toBe(false);
    }
  });

  it("reads a tag name as a tag when it is the only thing inside a container", () => {
    expect(aloneInContainer("<footer>", "</footer>")).toBe(true);
    expect(aloneInContainer('  <div class="card" id="a">', "</div>")).toBe(true);
    expect(aloneInContainer("<div><section>", "</section></div>")).toBe(true);
    expect(aloneInContainer("<ul>", "</ul>")).toBe(true);
    expect(aloneInContainer("<TR>", "</tr>")).toBe(true);
  });

  it("leaves it a word inside tags that hold text, and when it is not alone", () => {
    // tags for text: here "menu", "code" or "link" is a word
    for (const tag of ["p", "li", "a", "td", "h2", "button", "span", "label"]) expect(aloneInContainer(`<${tag}>`, `</${tag}>`)).toBe(false);
    // something stands between the opening tag and the word
    expect(aloneInContainer("<div>See the ", "</div>")).toBe(false);
    expect(aloneInContainer("<div> ", "</div>")).toBe(false);
    // something stands between the word and the closing tag
    expect(aloneInContainer("<div>", " more</div>")).toBe(false);
    expect(aloneInContainer("<div>", " </div>")).toBe(false);
    // the closing tag belongs to another element
    expect(aloneInContainer("<div>", "</section>")).toBe(false);
    expect(aloneInContainer("", "</div>")).toBe(false);
    expect(aloneInContainer("<div>", "")).toBe(false);
  });

  it("puts a stop inside the tag and a last stop after it", () => {
    expect(expandToSnippet("p")).toBe("<p>${1}</p>${0}");
  });

  it("gives every empty spot its own stop, in order", () => {
    expect(expandToSnippet("a")).toBe('<a href="${1}">${2}</a>${0}');
    expect(expandToSnippet("ul>li*2")).toBe("<ul>\n\t<li>${1}</li>\n\t<li>${2}</li>\n</ul>${0}");
  });

  it("keeps classes, ids and text", () => {
    expect(expandToSnippet("div.card#one")).toBe('<div class="card" id="one">${1}</div>${0}');
    expect(expandToSnippet("p{Hello}")).toBe("<p>Hello</p>${0}");
  });

  it("writes a whole page for !", () => {
    const page = expandToSnippet("!") ?? "";
    expect(page.startsWith("<!DOCTYPE html>\n<html lang=\"en\">")).toBe(true);
    expect(page).toContain('<meta charset="UTF-8">');
    expect(page.endsWith("</html>${0}")).toBe(true);
  });

  it("stops on the title and in the body of a new page, not in the meta lines", () => {
    const page = expandToSnippet("!") ?? "";
    expect(page).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    expect(page).toContain("<title>${5:Document}</title>");
    expect(page).toMatch(/<body>\n\t\$\{6\}\n<\/body>/);
    expect(page.match(/\$\{\d+/g)).toEqual(["${5", "${6", "${0"]);
  });

  it("shows what a short form becomes, without the stops", () => {
    expect(expandToText("ul>li*2")).toBe("<ul>\n  <li></li>\n  <li></li>\n</ul>");
    expect(expandToText("!")).toContain("<title>Document</title>");
    expect(expandToText("hello world")).toBeNull();
  });

  it("suggests the page starter and forms with a symbol, and leaves plain tag names to Tab", () => {
    for (const text of ["!", "ul>li*3", "div.card", ".card", "section#about>h2+p"]) expect(suggestsItself(text), text).toBe(true);
    for (const text of ["p", "a", "img", "ul"]) expect(suggestsItself(text), text).toBe(false);
  });

  it("escapes braces so the editor does not read them as stops", () => {
    expect(expandToSnippet("p{a {b} c}")).toBe("<p>a \\{b\\} c</p>${0}");
  });
});

describe("short forms for CSS", () => {
  it("expands a property with a value", () => {
    expect(cssToText("m10")).toBe("margin: 10px;");
    expect(cssToText("p10-20")).toBe("padding: 10px 20px;");
    expect(cssToText("fz18")).toBe("font-size: 18px;");
    expect(cssToText("w100p")).toBe("width: 100%;");
    expect(cssToText("c#333")).toBe("color: #333;");
    expect(cssToText("op.5")).toBe("opacity: 0.5;");
    expect(cssToText("m0-a")).toBe("margin: 0 auto;");
    expect(cssToText("bdrs8")).toBe("border-radius: 8px;");
  });

  it("knows every word on its list, and each one becomes what the list says", () => {
    for (const [word, line] of Object.entries(CSS_WORDS)) expect(cssToText(word), word).toBe(line);
  });

  it("never guesses: words that are not on the list stay as they are", () => {
    for (const text of ["foo", "mar", "is", "the", "hello", "color", "margin", "h", "m", "p", "red", "xyz10", "card", "", "10", "#fff"]) expect(isCssShortForm(text), text).toBe(false);
  });

  it("puts a stop on a value that still has to be chosen, and a last stop after the line", () => {
    expect(cssToSnippet("m10")).toBe("margin: 10px;${0}");
    expect(cssToSnippet("bgc")).toBe("background-color: ${1:#fff};${0}");
    expect(cssToSnippet("bd")).toBe("border: ${1:1px} ${2:solid} ${3:#000};${0}");
    expect(cssToSnippet("mt")).toBe("margin-top: ${1};${0}");
    expect(cssToSnippet("foo")).toBeNull();
  });
});

describe("wrap with a tag", () => {
  it("wraps a few words", () => {
    expect(wrapText("strong", "Hello there")).toBe("<strong>Hello there</strong>");
    expect(wrapText("a", "Home")).toBe('<a href="">Home</a>');
    expect(wrapText("span.tag", "new")).toBe('<span class="tag">new</span>');
  });

  it("wraps several lines in a box and moves them in", () => {
    expect(wrapText("div.card", "<h2>One</h2>\n    <p>Two</p>", "    ")).toBe('<div class="card">\n      <h2>One</h2>\n      <p>Two</p>\n    </div>');
  });

  it("makes one list item for every line", () => {
    expect(wrapText("ul>li*", "Milk\nEggs\nBread")).toBe("<ul>\n  <li>Milk</li>\n  <li>Eggs</li>\n  <li>Bread</li>\n</ul>");
  });

  it("refuses text that is not a short form", () => {
    for (const text of ["", "hello world", "Strong", "!", "nothing"]) expect(wrapText(text, "x"), text).toBeNull();
  });
});

describe("format", () => {
  it("fixes the indentation of a page and changes nothing else", async () => {
    const messy = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>x</title>\n</head>\n<body>\n<div class="card">\n<h1>Hi</h1>\n      <p>One <strong>two</strong> three.<br>Four</p>\n</div>\n</body>\n</html>';
    const tidy = '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <title>x</title>\n  </head>\n  <body>\n    <div class="card">\n      <h1>Hi</h1>\n      <p>One <strong>two</strong> three.<br>Four</p>\n    </div>\n  </body>\n</html>';
    expect(await formatCode(messy, "index.html")).toBe(tidy);
    expect(await formatCode(tidy, "index.html")).toBe(tidy);
  });

  it("formats CSS: one declaration per line", async () => {
    expect(await formatCode(".card{border:2px solid black;padding:12px}\nh1, h2{color:red}", "style.css")).toBe(".card {\n  border: 2px solid black;\n  padding: 12px\n}\n\nh1,\nh2 {\n  color: red\n}");
  });

  it("formats JavaScript and leaves other files alone", async () => {
    expect(await formatCode("function hi(){\nconsole.log(1);\n}", "script.js")).toBe("function hi() {\n  console.log(1);\n}");
    expect(await formatCode("a  b", "notes.txt")).toBe("a  b");
    expect(await formatCode("", "index.html")).toBe("");
  });
});
