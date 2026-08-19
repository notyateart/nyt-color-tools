import type { ChromaStop, Curve, LightnessCurve } from "../types";

export function generateLightness(
  top: number,
  bottom: number,
  steps: number,
  curve: LightnessCurve,
  factor: number,
) {
  return Array.from(
    {
      length: steps,
    },

    (_, i) => {
      const progress = i / (steps - 1);

      const curvedProgress =
        curve === "smooth" ? sCurve(progress, factor) : progress;

      return top + (bottom - top) * curvedProgress;
    },
  );
}

function sCurve(progress: number, factor: number) {
  const steepness = Math.max(1, factor);
  const rising = progress ** steepness;
  const falling = (1 - progress) ** steepness;

  return rising / (rising + falling);
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

  const startSource = sorted.find((stop) => stop.step === 0) ?? sorted[0];
  const start = {
    id: startSource?.id ?? crypto.randomUUID(),
    step: 0,
    value: sorted[0]?.value ?? 0,
  };

  const endSource =
    sorted.find((stop) => stop.step === maxStep) ?? sorted[sorted.length - 1];
  const end = {
    id: endSource?.id ?? crypto.randomUUID(),
    step: maxStep,
    value: sorted[sorted.length - 1]?.value ?? 0,
  };

  const middle =
    maxStep <= 1
      ? []
      : sorted
          .filter((stop) => stop.step !== 0 && stop.step !== maxStep)
          .map((stop) => ({
            ...stop,
            id: stop.id ?? crypto.randomUUID(),
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
