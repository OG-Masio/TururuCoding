// The emmet package ships types, but its package.json does not point TypeScript at them.
declare module "emmet" {
  interface ExpandConfig {
    type?: "markup" | "stylesheet";
    syntax?: string;
    options?: Record<string, unknown>;
  }
  interface Extracted {
    abbreviation: string;
    location: number;
    start: number;
    end: number;
  }
  export default function expand(abbreviation: string, config?: ExpandConfig): string;
  export function extract(line: string, pos?: number, options?: { type?: "markup" | "stylesheet"; lookAhead?: boolean; prefix?: string }): Extracted | undefined;
}
