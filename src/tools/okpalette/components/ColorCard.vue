<template>
  <div
    class="flex h-32 flex-col justify-end gap-1 rounded border p-2 font-mono text-xs shadow transition-transform hover:scale-[1.02]"
    :style="{
      background: color.oklch,
      borderColor: color.border,
    }"
  >
    <button
      class="cursor-pointer text-left hover:underline"
      :style="{ color: color.text }"
      @click="copy(color.oklch)"
    >
      {{ color.oklch }}
    </button>

    <button
      class="cursor-pointer text-left hover:underline"
      :style="{ color: color.text }"
      @click="copy(color.hex)"
    >
      {{ color.hex }}
    </button>

    <span :style="{ color: color.text }" class="opacity-80">
      APCA {{ Math.round(color.apca) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { GeneratedColor } from "../types";

const emit = defineEmits<{ copied: [value: string] }>();

defineProps<{ color: GeneratedColor }>();

async function copy(value: string) {
  await navigator.clipboard.writeText(value);

  emit("copied", value);
}
</script>
