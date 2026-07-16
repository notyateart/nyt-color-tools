<template>
  <div class="space-y-8">
    <section v-for="palette in palettes" :key="palette.id" class="space-y-3">
      <header class="flex items-center justify-between">
        <h3 class="text-lg font-bold">
          {{ palette.name }}
        </h3>

        <span class="text-sm text-gray-500"> Hue {{ palette.hue }}° </span>
      </header>

      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10"
      >
        <ColorCard
          v-for="color in palette.colors"
          :key="color.oklch"
          :color="color"
          @copied="emit('copied', $event)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GeneratedPalette } from "../types";

import ColorCard from "./ColorCard.vue";

defineProps<{
  palettes: GeneratedPalette[];
}>();

const emit = defineEmits<{
  copied: [value: string];
}>();
</script>
