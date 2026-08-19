<template>
  <section
    class="grid w-full grid-cols-1 gap-4 min-[460px]:grid-cols-2 xl:grid-cols-3"
  >
    <h2 class="col-span-full text-base font-semibold">Palette settings</h2>

    <div>
      <label :for="topId" class="label">Lightness top</label>
      <input
        :id="topId"
        v-model.number="project.lightnessTop"
        type="number"
        min="0"
        max="100"
        step="1"
        class="input w-full"
        @change="normalizeSettings"
        @blur="normalizeSettings"
      />
    </div>

    <div>
      <label :for="bottomId" class="label">Lightness bottom</label>
      <input
        :id="bottomId"
        v-model.number="project.lightnessBottom"
        type="number"
        min="0"
        max="100"
        step="1"
        class="input w-full"
        @change="normalizeSettings"
        @blur="normalizeSettings"
      />
    </div>

    <div>
      <label :for="stepsId" class="label">Steps</label>
      <input
        :id="stepsId"
        v-model.number="project.steps"
        type="number"
        min="2"
        max="30"
        step="1"
        class="input w-full"
        @change="normalizeSettings"
        @blur="normalizeSettings"
      />
    </div>

    <div>
      <label :for="distributionId" class="label">Lightness distribution</label>
      <select
        :id="distributionId"
        v-model="project.lightnessCurve"
        class="select w-full"
      >
        <option value="linear">Linear</option>
        <option value="smooth">S-Curve</option>
      </select>
    </div>

    <div v-if="project.lightnessCurve === 'smooth'">
      <label :for="curveId" class="label">
        S-Curve steepness =
        {{ project.lightnessCurveFactor.toFixed(1) }}
      </label>
      <input
        :id="curveId"
        v-model.number="project.lightnessCurveFactor"
        type="range"
        min="1"
        max="4"
        step="0.1"
        class="range range-primary w-full"
        @change="normalizeSettings"
      />
    </div>

    <div>
      <label :for="chromaId" class="label">
        Global chroma multiply =
        {{ project.chromaMultiplier }}
      </label>

      <input
        :id="chromaId"
        v-model.number="project.chromaMultiplier"
        type="range"
        min="0"
        max="1.5"
        step="0.05"
        class="range range-primary w-full"
        @change="normalizeSettings"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from "vue";
import type { PaletteProject } from "../types";

const props = defineProps<{
  project: PaletteProject;
}>();

const id = useId();
const topId = `${id}-lightness-top`;
const bottomId = `${id}-lightness-bottom`;
const stepsId = `${id}-steps`;
const distributionId = `${id}-distribution`;
const curveId = `${id}-curve`;
const chromaId = `${id}-chroma`;

function normalizeSettings() {
  props.project.lightnessTop = clamp(props.project.lightnessTop, 0, 100, 98);
  props.project.lightnessBottom = clamp(
    props.project.lightnessBottom,
    0,
    100,
    18,
  );
  props.project.steps = Math.round(clamp(props.project.steps, 2, 30, 12));
  props.project.lightnessCurveFactor = clamp(
    props.project.lightnessCurveFactor,
    1,
    5,
    1.5,
  );
  props.project.chromaMultiplier = clamp(
    props.project.chromaMultiplier,
    0,
    1.5,
    1,
  );
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(number, min), max)
    : fallback;
}
</script>
