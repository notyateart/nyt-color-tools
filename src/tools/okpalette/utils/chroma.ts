import type { ChromaStop, Curve } from "../../paletter/types";

export function generateLightness(top: number, bottom: number, steps: number) {
  return Array.from(
    {
      length: steps,
    },

    (_, i) => top + (bottom - top) * (i / (steps - 1)),
  );
}

export function normalizeChromaStops(
  stops: ChromaStop[],
  steps: number,
): ChromaStop[] {
  const maxStep = steps - 1;

  const sorted = stops
    .map((stop) => ({
      ...stop,
    }))
    .sort((a, b) => a.step - b.step);

  const start = {
    step: 0,
    value: sorted[0]?.value ?? 0,
  };

  const end = {
    step: maxStep,
    value: sorted.at(-1)?.value ?? 0,
  };

  const middle = sorted
    .filter((stop) => stop.step !== 0 && stop.step !== maxStep)
    .map((stop) => ({
      ...stop,

      step: Math.min(Math.max(stop.step, 1), maxStep - 1),
    }));

  return [start, ...removeDuplicateSteps(middle), end];
}

function removeDuplicateSteps(stops: ChromaStop[]) {
  const used = new Set<number>();

  return stops.filter((stop) => {
    if (used.has(stop.step)) {
      return false;
    }

    used.add(stop.step);

    return true;
  });
}

export function generateChroma(
  steps: number,
  stops: ChromaStop[],
  curve: Curve,
) {
  const normalized = normalizeChromaStops(stops, steps);

  return Array.from(
    {
      length: steps,
    },

    (_, i) => {
      const left = [...normalized].reverse().find((stop) => stop.step <= i)!;

      const right = normalized.find((stop) => stop.step >= i)!;

      if (left.step === right.step) {
        return left.value;
      }

      let t = (i - left.step) / (right.step - left.step);

      if (curve === "ease") {
        t = easeInOutBezier(t);
      }

      return left.value + (right.value - left.value) * t;
    },
  );
}

/**
 * Smooth ease-in/ease-out curve
 * cubic-bezier(0.42,0,0.58,1)
 */
function easeInOutBezier(t: number) {
  return 3 * (1 - t) * t * t + t * t * t;
}
