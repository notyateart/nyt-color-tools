<template>
  <div class="space-y-6">
    <ToolHeader
      title="Quick Palette Generator"
      description="Quickly generate perceptually uniform color palettes."
    />

    <div class="grid gap-6 md:grid-cols-3">
      <!-- Hue Controls -->
      <div class="card bg-base-100 border-base-300 border">
        <div class="card-body gap-4 p-5">
          <h2 class="card-title text-base">Hues (°)</h2>
          <div class="space-y-2">
            <div v-for="(_, i) in hues" :key="'h' + i" class="flex gap-2">
              <input
                v-model.number="hues[i]"
                type="number"
                step="5"
                min="0"
                max="360"
                class="input input-sm min-w-0 flex-1"
                :placeholder="'Hue ' + (i + 1)"
                :aria-label="`Hue ${i + 1} in degrees`"
                @change="normalizeValue(hues, i, 0, 360)"
                @blur="normalizeValue(hues, i, 0, 360)"
              />
              <button
                type="button"
                class="btn btn-error btn-ghost btn-square btn-sm"
                aria-label="Remove hue"
                :disabled="hues.length <= 1"
                @click="hues.splice(i, 1)"
              >
                <X :size="16" />
              </button>
            </div>
            <button
              type="button"
              class="btn btn-soft btn-sm"
              @click="hues.push(0)"
            >
              <Plus :size="16" /> Add hue
            </button>
          </div>
        </div>
      </div>

      <!-- Lightness Controls -->
      <div class="card bg-base-100 border-base-300 border">
        <div class="card-body gap-4 p-5">
          <h2 class="card-title text-base">Lightness</h2>
          <div class="space-y-2">
            <div
              v-for="(_, i) in lightnesses"
              :key="'l' + i"
              class="flex gap-2"
            >
              <input
                v-model.number="lightnesses[i]"
                type="number"
                step="5"
                min="0"
                max="100"
                class="input input-sm min-w-0 flex-1"
                :placeholder="'L ' + (i + 1)"
                :aria-label="`Lightness ${i + 1} in percent`"
                @change="normalizeValue(lightnesses, i, 0, 100)"
                @blur="normalizeValue(lightnesses, i, 0, 100)"
              />
              <button
                type="button"
                class="btn btn-error btn-ghost btn-square btn-sm"
                aria-label="Remove lightness"
                :disabled="lightnesses.length <= 1"
                @click="lightnesses.splice(i, 1)"
              >
                <X :size="16" />
              </button>
            </div>
            <button
              type="button"
              class="btn btn-soft btn-sm"
              @click="lightnesses.push(70)"
            >
              <Plus :size="16" /> Add lightness
            </button>
          </div>
        </div>
      </div>

      <!-- Chroma Controls -->
      <div class="card bg-base-100 border-base-300 border">
        <div class="card-body gap-4 p-5">
          <h2 class="card-title text-base">Chroma</h2>
          <div class="space-y-2">
            <div v-for="(_, i) in chromas" :key="'c' + i" class="flex gap-2">
              <input
                v-model.number="chromas[i]"
                type="number"
                step="0.01"
                min="0"
                max="0.4"
                class="input input-sm min-w-0 flex-1"
                :placeholder="'C ' + (i + 1)"
                :aria-label="`Chroma ${i + 1}`"
                @change="normalizeValue(chromas, i, 0, 0.4)"
                @blur="normalizeValue(chromas, i, 0, 0.4)"
              />
              <button
                type="button"
                class="btn btn-error btn-ghost btn-square btn-sm"
                aria-label="Remove chroma"
                :disabled="chromas.length <= 1"
                @click="chromas.splice(i, 1)"
              >
                <X :size="16" />
              </button>
            </div>
            <button
              type="button"
              class="btn btn-soft btn-sm"
              @click="chromas.push(0.05)"
            >
              <Plus :size="16" /> Add chroma
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Generated colors</h2>
        <p class="text-base-content/60 text-sm">
          {{ palette.length }} combinations
        </p>
      </div>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="palette.length === 0"
        @click="copyCode"
      >
        <Copy :size="18" /> Copy {{ palette.length }} HEX values
      </button>
    </div>
    <!-- Color Grid -->
    <div
      v-if="palette.length"
      class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2"
    >
      <ColorSwatch
        v-for="(color, index) in palette"
        :key="index"
        :color="displayColor(color)"
        :text-color="textColor(color)"
        :primary-value="color.to('oklch').toString()"
        :secondary-value="hexValue(color)"
        :invalid="!color.inGamut('srgb')"
        @copied="showToast(`Copied ${$event}`)"
        @copy-error="showToast"
      />
    </div>
  </div>
  <AppToast :message="toast" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Copy, Plus, X } from "@lucide/vue";
import Color from "colorjs.io";
import AppToast from "../../components/AppToast.vue";
import ColorSwatch from "../../components/ColorSwatch.vue";
import ToolHeader from "../../components/ToolHeader.vue";

// Reactive arrays
const hues = ref<Array<number | string>>([
  10, 55, 100, 145, 190, 235, 280, 325,
]);
const lightnesses = ref<Array<number | string>>([85, 70, 55, 40]);
const chromas = ref<Array<number | string>>([0.15, 0.05]);
const toast = ref("");
let toastTimer: number | undefined;
const white = new Color("#FFFFFF");
const black = new Color("#000000");

const palette = computed(() => {
  const result: Color[] = [];

  for (const hue of finiteValues(hues.value)) {
    for (const chroma of finiteValues(chromas.value)) {
      for (const lightness of finiteValues(lightnesses.value)) {
        const color = new Color(`oklch(${lightness}% ${chroma} ${hue})`);
        result.push(color);
      }
    }
  }

  return result;
});

// Toast system
function showToast(message: string, duration = 3000) {
  window.clearTimeout(toastTimer);
  toast.value = message;
  toastTimer = window.setTimeout(() => {
    toast.value = "";
  }, duration);
}

function displayColor(color: Color) {
  return color.clone().toGamut({ space: "srgb" }).toString();
}

function hexValue(color: Color) {
  return color
    .to("srgb")
    .toGamut({ space: "srgb" })
    .toString({ format: "hex", collapse: false });
}

function textColor(color: Color) {
  const display = color.clone().toGamut({ space: "srgb" });
  return Math.abs(display.contrast(white, "APCA")) >
    Math.abs(display.contrast(black, "APCA"))
    ? "white"
    : "black";
}

// Copy colors to clipboard
async function copyCode() {
  const hexList = palette.value.map((color) =>
    color
      .to("srgb")
      .toGamut({ space: "srgb" })
      .toString({ format: "hex", collapse: false }),
  );

  try {
    await navigator.clipboard.writeText(JSON.stringify(hexList, null, 2));
    showToast(`Copied ${hexList.length} HEX values`);
  } catch {
    showToast("Clipboard access was blocked");
  }
}

function finiteValues(values: Array<number | string>) {
  return values
    .filter((value) => value !== "")
    .map(Number)
    .filter(Number.isFinite);
}

function normalizeValue(
  values: Array<number | string>,
  index: number,
  min: number,
  max: number,
) {
  const number = Number(values[index]);
  values[index] = Number.isFinite(number)
    ? Math.min(Math.max(number, min), max)
    : min;
}
</script>
