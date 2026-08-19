<template>
  <section class="space-y-6">
    <ToolHeader
      title="Gradient Step Generator"
      description="Generate swatches from smooth color transitions using OKLCH or HEX input."
    />

    <!-- === Inputs === -->
    <div class="grid gap-4 lg:grid-cols-2">
      <ColorInput
        v-model="startColorRaw"
        label="Start Color"
        @oklch="(val) => (startColorOKLCH = val)"
      />

      <ColorInput
        v-model="endColorRaw"
        label="End Color"
        @oklch="(val) => (endColorOKLCH = val)"
      />

      <!-- Step count -->
      <div
        class="bg-base-100 border-base-300 flex flex-wrap items-end justify-between gap-3 rounded-lg border p-4 lg:col-span-2"
      >
        <label :for="stepsId" class="fieldset w-28">
          <span class="fieldset-legend">Steps</span>
          <input
            :id="stepsId"
            v-model.number="steps"
            type="number"
            min="2"
            max="100"
            step="1"
            class="input w-full"
            @change="normalizeSteps"
            @blur="normalizeSteps"
          />
        </label>

        <button type="button" class="btn btn-primary" @click="copyGradient">
          <Copy :size="18" /> Copy {{ interpolated.length }} HEX values
        </button>
      </div>
    </div>

    <!-- === Preview Grid === -->
    <div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
      <ColorSwatch
        v-for="(color, i) in interpolated"
        :key="i"
        :color="color.hex"
        :text-color="color.text"
        :primary-value="color.oklch"
        :secondary-value="color.hex"
        :invalid="color.outOfGamut"
        @copied="showCopied"
        @copy-error="showToast"
      />
    </div>

    <AppToast :message="toast" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import { Copy } from "@lucide/vue";
import Color from "colorjs.io";
import AppToast from "../../components/AppToast.vue";
import ColorInput from "../../components/ColorInput.vue";
import ColorSwatch from "../../components/ColorSwatch.vue";
import ToolHeader from "../../components/ToolHeader.vue";

const startColorRaw = ref("#006eff");
const endColorRaw = ref("#996699");
const startColorOKLCH = ref({ l: 58, c: 0.23, h: 260 });
const endColorOKLCH = ref({ l: 58, c: 0.09, h: 325 });
const steps = ref<number | string>(5);
const toast = ref("");
const stepsId = `${useId()}-steps`;
let toastTimer: number | undefined;
const black = new Color("#000000");
const white = new Color("#FFFFFF");

const normalizedSteps = computed(() => {
  const value = Number(steps.value);
  return Number.isFinite(value) ? clamp(Math.round(value), 2, 100) : 2;
});

// Interpolation + APCA contrast
function interpolateOklch(
  start: { l: number; c: number; h: number },
  end: { l: number; c: number; h: number },
  n: number,
) {
  const result = [];

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const l = start.l + t * (end.l - start.l);
    const c = start.c + t * (end.c - start.c);
    const h = interpolateHue(start.h, end.h, t);

    const color = new Color("oklch(" + l / 100 + " " + c + " " + h + ")");
    const srgb = color.to("srgb");
    const display = srgb.clone().toGamut({ space: "srgb" });
    const hex = display.toString({ format: "hex", collapse: false });

    const contrastToBlack = black.contrast(display, "APCA");
    const contrastToWhite = white.contrast(display, "APCA");
    let textColor = "#ffffff";
    if (Math.abs(contrastToBlack) > Math.abs(contrastToWhite)) {
      textColor = "#000000";
    } else {
      textColor = "#ffffff";
    }
    result.push({
      oklch: `oklch(${l.toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`,
      hex,
      text: textColor,
      outOfGamut: !color.inGamut("srgb"),
    });
  }

  return result;
}

function interpolateHue(h1: number, h2: number, t: number) {
  const delta = ((h2 - h1 + 180) % 360) - 180;
  return (h1 + delta * t + 360) % 360;
}

const interpolated = computed(() => {
  return interpolateOklch(
    startColorOKLCH.value,
    endColorOKLCH.value,
    normalizedSteps.value,
  );
});

function showCopied(text: string) {
  showToast(`Copied ${text}`);
}

function showToast(message: string) {
  window.clearTimeout(toastTimer);
  toast.value = message;
  toastTimer = window.setTimeout(() => {
    toast.value = "";
  }, 2200);
}

function normalizeSteps() {
  const value = Number(steps.value);
  steps.value = Number.isFinite(value) ? clamp(Math.round(value), 2, 100) : 2;
}

async function copyGradient() {
  const values = interpolated.value.map((color) => color.hex);

  try {
    await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    showToast(`Copied ${values.length} HEX values`);
  } catch {
    showToast("Clipboard access was blocked");
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
</script>
