<template>
  <div class="space-y-2">
    <div class="flex items-end gap-3">
      <div class="flex-1">
        <label class="label">Chroma curve</label>
        <select v-model="palette.curve" class="select select w-full">
          <option value="linear">Linear</option>
          <option value="ease">Ease</option>
        </select>
      </div>

      <button
        type="button"
        class="btn btn-ghost btn"
        :disabled="availableSteps.length === 0"
        :title="
          availableSteps.length === 0 ? 'Every step already has a point' : ''
        "
        @click="addStop"
      >
        <Plus :size="16" /> Add point
      </button>
    </div>

    <div class="flex flex-col">
      <div
        v-for="(stop, index) in palette.chromaStops"
        :key="stop.id"
        class="border-base-300 grid grid-cols-12 items-center gap-2 border-b py-2 last:border-b-0 w-fill"
      >
        <span class="text-xs col-span-2">
          {{
            index === 0
              ? "Start"
              : index === palette.chromaStops.length - 1
                ? "End"
                : `Point ${index}`
          }}
        </span>

        <div class="space-y-1 col-span-6">
          <label class="label py-0 text-xs"> Step {{ stop.step + 1 }} </label>

          <input
            v-model.number="stop.step"
            type="range"
            :min="stepMin(index)"
            :max="stepMax(index)"
            :disabled="index === 0 || index === palette.chromaStops.length - 1"
            class="range range-primary range-xs w-full"
            :aria-label="`Chroma point ${index + 1} step`"
            @change="normalizeStop(index)"
            @blur="normalizeStop(index)"
          />
        </div>

        <input
          v-model.number="stop.value"
          type="number"
          step="0.0025"
          min="0"
          max="0.4"
          aria-label="Chroma value"
          class="input w-full  col-span-3"
          @change="normalizeStop(index)"
          @blur="normalizeStop(index)"
        />

        <button
          v-if="index !== 0 && index !== palette.chromaStops.length - 1"
          type="button"
          aria-label="Remove chroma point"
          class="btn btn-error btn-ghost btn-square btn"
          @click="removeStop(index)"
        >
          <Minus :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Palette } from "../types";
import { Minus, Plus } from "@lucide/vue";

const props = defineProps<{
  palette: Palette;
  steps: number;
}>();

const availableSteps = computed(() => {
  const used = new Set(props.palette.chromaStops.map((stop) => stop.step));
  return Array.from(
    { length: Math.max(0, props.steps - 2) },
    (_, index) => index + 1,
  ).filter((step) => !used.has(step));
});

function addStop() {
  const middle = (props.steps - 1) / 2;
  const step = [...availableSteps.value].sort(
    (a, b) => Math.abs(a - middle) - Math.abs(b - middle),
  )[0];

  if (step === undefined) return;
  props.palette.chromaStops.push({
    id: crypto.randomUUID(),
    step,
    value: 0.12,
  });
  props.palette.chromaStops.sort((a, b) => a.step - b.step);
}

function removeStop(index: number) {
  props.palette.chromaStops.splice(index, 1);
}

function stepMin(index: number) {
  if (index === 0) return 0;
  return props.palette.chromaStops[index - 1].step + 1;
}

function stepMax(index: number) {
  if (index === props.palette.chromaStops.length - 1) return props.steps - 1;
  return props.palette.chromaStops[index + 1].step - 1;
}

function normalizeStop(index: number) {
  const stop = props.palette.chromaStops[index];
  stop.value = clamp(Number(stop.value) || 0, 0, 0.4);

  if (index > 0 && index < props.palette.chromaStops.length - 1) {
    stop.step = Math.round(
      clamp(Number(stop.step), stepMin(index), stepMax(index)),
    );
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
</script>
