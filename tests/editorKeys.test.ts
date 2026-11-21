import { describe, expect, it } from "vitest";
import { expandToSnippet, expandToText, isAbbreviation, suggestsItself } from "../src/lib/editorKeys";

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
