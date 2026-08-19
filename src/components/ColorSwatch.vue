<template>
  <div
    class="card min-w-0 overflow-hidden border shadow-sm"
    :class="compact ? 'h-24' : 'h-32'"
    :style="{
      background: color,
      borderColor: `oklch(from ${textColor} l c h / 0.25)`,
      borderStyle: invalid ? 'dashed' : 'solid',
      borderWidth: invalid ? '1px' : '1px',
    }"
  >
    <div class="card-body justify-between gap-1 p-2 font-mono text-[11px]">
      <div
        class="flex justify-between gap-1"
        :style="{ color: textColor }"
      >
        <!-- <span
          class="truncate font-semibold"
          :title="secondaryValue ?? primaryValue"
        >
          {{ secondaryValue ?? primaryValue }}
        </span> -->
        <span
          v-if="meta"
          class="shrink-0 text-[10px] font-semibold uppercase"
          :style="{ color: textColor }"
        >
          {{ meta }}
        </span>
        <div class="tooltip tooltip-left tooltip-start">
          <div class="tooltip-content z-1000">Not in<br>sRGB!<br>Fallback<br>in use.</div>
          <TriangleAlert :size="10" v-if="invalid" />
        </div>
      </div>

      <div class="flex flex-wrap gap-1">
        <button
          class="btn btn-ghost btn-xs min-h-0 justify-start p-1 text-[var(--temp-col)] border-[var(--temp-col-50)] hover:border-[var(--temp-inv-col-50)] hover:bg-[var(--temp-col)] hover:text-[var(--temp-inv-col)]"
          :style="{ 
            '--temp-col': `oklch(from ${textColor} l c h)`,
            '--temp-inv-col': `oklch(from ${textColor} calc(1 - l) c h)`,
            '--temp-col-50': `oklch(from ${textColor} l c h / 0.25)`,
            '--temp-inv-col-50': `oklch(from ${textColor} calc(1 - l) c h / 0.25)`
          }"
          :title="primaryValue"
          :aria-label="`Copy OKLCH value ${primaryValue}`"
          @click="copy(primaryValue)"
        >
          <Copy :size="12" /> OKLCH
        </button><br>

        <button
          v-if="secondaryValue"
          class="btn btn-ghost btn-xs min-h-0 justify-start p-1 text-[var(--temp-col)] border-[var(--temp-col-50)] hover:border-[var(--temp-inv-col-50)] hover:bg-[var(--temp-col)] hover:text-[var(--temp-inv-col)]"
          :style="{ 
            '--temp-col': `oklch(from ${textColor} l c h)`,
            '--temp-inv-col': `oklch(from ${textColor} calc(1 - l) c h)`,
            '--temp-col-50': `oklch(from ${textColor} l c h / 0.5)`,
            '--temp-inv-col-50': `oklch(from ${textColor} calc(1 - l) c h / 0.5)`
          }"
          :title="secondaryValue"
          :aria-label="`Copy HEX value ${secondaryValue}`"
          @click="copy(secondaryValue)"
        >
          <Copy :size="12" /> HEX
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Copy, TriangleAlert } from "@lucide/vue";

withDefaults(
  defineProps<{
    color: string;
    textColor: string;
    primaryValue: string;
    secondaryValue?: string;
    meta?: string;
    borderColor?: string;
    invalid?: boolean;
    compact?: boolean;
  }>(),
  {
    borderColor: "transparent",
    secondaryValue: undefined,
    meta: undefined,
  },
);

const emit = defineEmits<{
  copied: [value: string];
  "copy-error": [message: string];
}>();

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    emit("copied", value);
  } catch {
    emit("copy-error", "Clipboard access was blocked");
  }
}
</script>
