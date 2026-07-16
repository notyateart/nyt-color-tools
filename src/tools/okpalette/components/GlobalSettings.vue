<template>
  <fieldset
    class="flex w-100 flex-col gap-4 rounded border border-zinc-300 p-4 dark:border-zinc-700"
  >
    <legend class="px-2 font-semibold text-zinc-500 dark:text-zinc-300">
      Global Settings
    </legend>

    <div class="space-y-2">
      <label class="text-sm"> Lightness Top </label>
      <input
        v-model.number="project.lightnessTop"
        type="number"
        min="0"
        max="100"
        step="1"
        class="w-full rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm"> Lightness Bottom </label>
      <input
        v-model.number="project.lightnessBottom"
        type="number"
        min="0"
        max="100"
        step="1"
        class="w-full rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm"> Steps </label>
      <input
        v-model.number="project.steps"
        type="number"
        min="2"
        max="30"
        step="1"
        class="w-full rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      />
    </div>

    <!-- Chroma Multiplier -->

    <div class="space-y-2">
      <label class="text-sm">
        Global chroma multiply =
        {{ project.chromaMultiplier }}
      </label>

      <input
        v-model.number="project.chromaMultiplier"
        type="range"
        min="0"
        max="1.5"
        step="0.05"
        class="w-full"
      />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { PaletteProject } from "../../paletter/types";

defineProps<{
  project: PaletteProject;
}>();
</script>
