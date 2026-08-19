import { computed } from "vue";
import type {
  GeneratedPalette,
  GeneratedColor,
  PaletteProject,
} from "../types";

import { generateLightness, generateChroma } from "../utils/chroma";

import {
  getContrast,
  getBorderColor,
  isInSrgbGamut,
  toHex,
} from "../utils/contrast";

export function usePaletteGeneration(
  project: () => PaletteProject | undefined,
) {
  const stepCount = computed(() => {
    const value = Number(project()?.steps);
    return Number.isFinite(value)
      ? Math.min(Math.max(Math.round(value), 2), 30)
      : 12;
  });

  const lightness = computed(() => {
    const current = project();

    if (!current) {
      return [];
    }

    return generateLightness(
      current.lightnessTop,
      current.lightnessBottom,
      stepCount.value,
      current.lightnessCurve,
      current.lightnessCurveFactor,
    );
  });

  const generated = computed<GeneratedPalette[]>(() => {
    const current = project();

    if (!current) {
      return [];
    }

    return current.palettes.map((palette) => {
      const chroma = generateChroma(
        stepCount.value,
        palette.chromaStops,
        palette.curve,
      );

      const colors = lightness.value.map((l, index): GeneratedColor => {
        const c = chroma[index] * current.chromaMultiplier;
        const hue =
          palette.endHue === null
            ? palette.hue
            : interpolateHue(
                palette.hue,
                palette.endHue,
                index / (stepCount.value - 1),
              );

        const css = `oklch(${l.toFixed(1)}% ${c.toFixed(3)} ${hue.toFixed(1)})`;

        const contrast = getContrast(css);

        return {
          oklch: css,

          hex: toHex(css),

          text: contrast.text,

          border: getBorderColor(css),

          apca: contrast.apca,

          outOfGamut: !isInSrgbGamut(css),
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

function interpolateHue(start: number, end: number, progress: number) {
  const delta = ((end - start + 540) % 360) - 180;

  return (start + delta * progress + 360) % 360;
}
