import type { GeneratedPalette } from "../types";

interface FigmaColorToken {
  $extensions: {
    "com.figma.scopes": string[];
    "com.figma.hiddenFromPublishing": boolean;
  };

  $type: "color";

  $value: string;
}

/**
 * Converts generated palettes into
 * Figma Variables JSON format.
 *
 * Token order:
 * 10 = lightest
 * 20 = next
 * ...
 */
export function serializeFigmaTokens(palettes: GeneratedPalette[]) {
  const output: Record<string, any> = {};

  palettes.forEach((palette) => {
    const colors: Record<string, FigmaColorToken> = {};

    palette.colors.forEach((color, index) => {
      const step = (index + 1) * 10;

      colors[step] = {
        $extensions: {
          "com.figma.scopes": ["ALL_SCOPES"],

          "com.figma.hiddenFromPublishing": true,
        },

        $type: "color",

        $value: color.hex,
      };
    });

    output[palette.name] = colors;
  });

  return output;
}

/**
 * Serializes any object as readable JSON.
 */
export function stringifyJSON(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
