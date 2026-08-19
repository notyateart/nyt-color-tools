<template>
  <div
    class="grid items-start gap-6 lg:grid-cols-[minmax(140px,0.7fr)_minmax(260px,1.3fr)]"
  >
    <div class="space-y-3">
      <div>
        <label :for="startHueId" class="label">Start hue</label>
        <input
          :id="startHueId"
          v-model.number="palette.hue"
          type="number"
          min="0"
          max="360"
          class="input w-full"
          @change="normalizeHue('hue')"
          @blur="normalizeHue('hue')"
        />
      </div>

      <label :for="gradientId" class="label cursor-pointer justify-start gap-2">
        <input
          :id="gradientId"
          type="checkbox"
          class="toggle toggle-primary toggle"
          :checked="palette.endHue !== null"
          @change="setHueGradient"
        />
        Hue gradient
      </label>

      <div v-if="palette.endHue !== null">
        <label :for="endHueId" class="label">End hue</label>
        <input
          :id="endHueId"
          v-model.number="palette.endHue"
          type="number"
          min="0"
          max="360"
          class="input w-full"
          @change="normalizeHue('endHue')"
          @blur="normalizeHue('endHue')"
        />
      </div>
    </div>

    <ChromaCurveEditor :palette="palette" :steps="steps" />
  </div>
</template>

<script setup lang="ts">
import { useId } from "vue";
import type { Palette } from "../types";
import ChromaCurveEditor from "./ChromaCurveEditor.vue";

const props = defineProps<{
  palette: Palette;
  steps: number;
}>();

const id = useId();
const startHueId = `${id}-start-hue`;
const gradientId = `${id}-gradient`;
const endHueId = `${id}-end-hue`;

function setHueGradient(event: Event) {
  const enabled = (event.target as HTMLInputElement).checked;
  props.palette.endHue = enabled ? (props.palette.hue + 60) % 360 : null;
}

function normalizeHue(key: "hue" | "endHue") {
  const value = Number(props.palette[key]);
  const normalized = Math.min(
    Math.max(Number.isFinite(value) ? value : 0, 0),
    360,
  );

  if (key === "hue") props.palette.hue = normalized;
  else props.palette.endHue = normalized;
}
</script>
