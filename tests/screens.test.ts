import { describe, expect, it } from "vitest";
import { SCREENS, dependsOnWidth, fitScreen } from "../src/lib/screens";

describe("the width of the result", () => {
  it("offers a phone, a tablet and a desktop, from narrow to wide", () => {
    expect(SCREENS.map((screen) => screen.label)).toEqual(["Phone", "Tablet", "Desktop"]);
    expect(SCREENS.map((screen) => screen.width)).toEqual([375, 768, 1200]);
  });

  it("shows a page at real size, in the middle, when there is room", () => {
    expect(fitScreen(375, { width: 875, height: 400 })).toEqual({ scale: 1, left: 250, height: 400 });
  });

  it("shows the whole page smaller when it does not fit", () => {
    const fit = fitScreen(1200, { width: 600, height: 300 });
    expect(fit.scale).toBe(0.5);
    expect(fit.left).toBe(0);
    // Twice as high before scaling, so that it fills the box after scaling.
    expect(fit.height).toBe(600);
  });

  it("does nothing odd before the box has a size", () => {
    expect(fitScreen(768, { width: 0, height: 0 })).toEqual({ scale: 1, left: 0, height: 0 });
  });

  it("knows which code looks different on a phone", () => {
    expect(dependsOnWidth({ "style.css": "@media (min-width: 600px) { h1 { color: red; } }" })).toBe(true);
    expect(dependsOnWidth({ "style.css": ".g { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }" })).toBe(true);
    expect(dependsOnWidth({ "index.html": "<p>Hi</p>", "style.css": "p { color: red; }" })).toBe(false);
  });
});
