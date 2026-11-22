/**
 * Screen sizes for the result.
 *
 * A page with layout rules looks different on a phone and on a big screen. The buttons
 * Phone, Tablet and Desktop show the result at the width of such a screen, so you can
 * test a page without owning three devices.
 */

export interface ScreenSize {
  id: string;
  label: string;
  /** Width in CSS pixels. */
  width: number;
}

export const SCREENS: ScreenSize[] = [
  { id: "phone", label: "Phone", width: 375 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "desktop", label: "Desktop", width: 1200 },
];

export interface Fit {
  /** 1 when the page fits at its real size, less when it must be shown smaller. */
  scale: number;
  /** Space left of the page, so that it sits in the middle of the box. */
  left: number;
  /** How high the page must be before scaling, to fill the box after scaling. */
  height: number;
}

/**
 * How a page of a fixed width fits in a box.
 * Enough room: real size, in the middle. Not enough room: the whole page is shown smaller,
 * the way a phone shows a desktop page. The page itself still "thinks" it has its full width.
 */
export function fitScreen(width: number, box: { width: number; height: number }): Fit {
  if (!(width > 0) || !(box.width > 0)) return { scale: 1, left: 0, height: box.height };
  const scale = Math.min(1, box.width / width);
  return { scale, left: Math.max(0, (box.width - width * scale) / 2), height: box.height / scale };
}

/** Does this code look different at different widths? Then the width buttons are worth showing. */
export const dependsOnWidth = (files: Record<string, string>): boolean => Object.values(files).some((text) => /@media\b|auto-fi(t|ll)\b/.test(text));
