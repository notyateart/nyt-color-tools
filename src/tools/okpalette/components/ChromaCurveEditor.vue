<template>
  <div class="w-fill space-y-4">
    <label class="text-sm"> Chroma </label>
    <select
      v-model="palette.curve"
      class="w-full rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
    >
      <option value="linear">Linear</option>

      <option value="ease">Ease</option>
    </select>

    <div class="flex flex-col gap-4">
      <div
        v-for="(stop, index) in palette.chromaStops"
        :key="index"
        class="grid grid-cols-6 grid-rows-1 items-center gap-2 rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      >
        <span class="col-span-1">
          {{
            index === 0
              ? "Start"
              : index === palette.chromaStops.length - 1
                ? "End"
                : `Point ${index}`
          }}
        </span>

        <div class="col-span-2 space-y-1">
          <label class="text-sm"> Step {{ stop.step }} </label>

          <input
            v-model.number="stop.step"
            type="range"
            min="1"
            :max="steps - 2"
            :disabled="index === 0 || index === palette.chromaStops.length - 1"
            class="w-full"
          />
        </div>

        <input
          v-model.number="stop.value"
          type="number"
          step="0.0025"
          min="0"
          max="0.2"
          class="col-span-2 rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
        />

        <button
          v-if="index !== 0 && index !== palette.chromaStops.length - 1"
          class="col-span-1 flex justify-center gap-2 rounded border border-red-500 py-2 pr-4 pl-2 font-medium text-red-500"
          @click="removeStop(index)"
        >
          <Minus :size="24"></Minus>Remove
        </button>
      </div>
    </div>

    <button
      class="flex cursor-pointer justify-center gap-2 rounded bg-zinc-300 py-2 pr-4 pl-2 font-medium dark:bg-zinc-700"
      @click="addStop"
    >
      <Plus :size="24"></Plus> New point
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Palette } from "../../paletter/types";
import { Minus, Plus } from "@lucide/vue";

const props = defineProps<{
  palette: Palette;
  steps: number;
}>();

function addStop() {
  const middle = Math.floor(props.steps / 2);

  props.palette.chromaStops.splice(
    props.palette.chromaStops.length - 1,

    0,

    {
      step: middle,
      value: 0.12,
    },
  );
}

function removeStop(index: number) {
  props.palette.chromaStops.splice(index, 1);
}
</script>
