import { computed } from "vue";
import type {
  GeneratedPalette,
  GeneratedColor,
  PaletteProject,
} from "../../paletter/types";

import { generateLightness, generateChroma } from "../utils/chroma";

import { getContrast, toHex, getBorderColor } from "../utils/contrast";

export function usePaletteGeneration(
  project: () => PaletteProject | undefined,
) {
  const lightness = computed(() => {
    if (!project()) {
      return [];
    }

    return generateLightness(
      project()!.lightnessTop,
      project()!.lightnessBottom,
      project()!.steps,
    );
  });

  const generated = computed<GeneratedPalette[]>(() => {
    const current = project();

    if (!current) {
      return [];
    }

    return current.palettes.map((palette) => {
      const chroma = generateChroma(
        current.steps,
        palette.chromaStops,
        palette.curve,
      );

      const colors = lightness.value.map((l, index): GeneratedColor => {
        const c = chroma[index] * current.chromaMultiplier;

        const css = `oklch(${l.toFixed(1)}% ${c.toFixed(3)} ${palette.hue})`;

        const contrast = getContrast(css);

        return {
          oklch: css,

          hex: toHex(css),

          text: contrast.text,

          border: getBorderColor(css),

          apca: contrast.apca,
        };
      });

      return {
        ...palette,

        colors,
      };
    });
  });

  return {
    lightness,

    generated,
  };
}
