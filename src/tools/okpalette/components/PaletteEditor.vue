<template>
  <fieldset
    class="flex w-220 flex-col gap-4 rounded border border-zinc-300 p-4 dark:border-zinc-700"
  >
    <legend class="px-2 font-semibold text-zinc-500 dark:text-zinc-300">
      {{ palette.name }}
    </legend>

    <div class="flex items-start gap-4">
      <div class="w-1/3 space-y-2">
        <label class="text-sm"> Name </label>
        <input
          v-model="palette.name"
          class="w-full rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
        />
        <label class="text-sm"> Hue </label>

        <input
          v-model.number="palette.hue"
          type="number"
          min="0"
          max="360"
          class="w-full rounded border px-3 py-2"
        />
        <div class="h-4"></div>
        <button
          class="flex justify-center gap-2 rounded bg-red-500 py-2 pr-4 pl-2 font-medium text-white"
          @click="emit('remove')"
        >
          <Trash2 :size="24"></Trash2>Delete color range
        </button>
      </div>

      <div class="w-2/3">
        <ChromaCurveEditor :palette="palette" :steps="steps" />
      </div>
    </div>

    <!-- Hue -->

    <!-- Chroma -->
  </fieldset>
</template>

<script setup lang="ts">
import type { Palette } from "../types";
import { Trash2 } from "@lucide/vue";
import ChromaCurveEditor from "./ChromaCurveEditor.vue";

defineProps<{
  palette: Palette;
  steps: number;
}>();

const emit = defineEmits<{
  remove: [];
}>();
</script>
