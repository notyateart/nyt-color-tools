<template>
  <div
    v-if="palette"
    class="grid grid-cols-[repeat(auto-fit,minmax(105px,1fr))] gap-2"
  >
    <ColorSwatch
      v-for="color in palette.colors"
      :key="color.oklch"
      :color="color.oklch"
      :text-color="color.text"
      :border-color="color.border"
      :primary-value="color.oklch"
      :secondary-value="color.hex"
      :meta="`APCA ${Math.round(color.apca)}`"
      :invalid="color.outOfGamut"
      compact
      @copied="emit('copied', $event)"
      @copy-error="emit('copy-error', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { GeneratedPalette } from "../types";

import ColorSwatch from "../../../components/ColorSwatch.vue";

defineProps<{
  palette?: GeneratedPalette;
}>();

const emit = defineEmits<{
  copied: [value: string];
  "copy-error": [message: string];
}>();
</script>
