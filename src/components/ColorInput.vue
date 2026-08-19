<template>
  <fieldset class="fieldset bg-base-100 border-base-300 rounded-box border p-5">
    <legend class="fieldset-legend px-1">{{ label }}</legend>

    <div class="flex items-center gap-3">
      <label :for="pickerId" class="sr-only">{{ label }} color picker</label>
      <input
        :id="pickerId"
        type="color"
        :value="pickerHex"
        class="h-11 w-11 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        @input="updateFromPicker"
      />

      <div class="min-w-0 flex-1">
        <label :for="hexId" class="sr-only">{{ label }} HEX value</label>
        <input
          :id="hexId"
          v-model.trim="hexInput"
          type="text"
          inputmode="text"
          autocomplete="off"
          spellcheck="false"
          class="input w-full font-mono"
          :class="{ 'input-error': invalidInput }"
          :aria-invalid="invalidInput"
          :aria-describedby="messageId"
          @blur="restoreInvalidInput"
        />
      </div>
    </div>

    <p v-if="invalidInput" :id="messageId" class="text-error mt-1 text-xs">
      Enter a valid CSS color, such as #006eff.
    </p>
    <p v-else-if="outOfGamut" :id="messageId" class="text-warning mt-1 text-xs">
      This OKLCH color is outside sRGB. The HEX preview is gamut-mapped.
    </p>
    <span v-else :id="messageId" class="sr-only">Valid color</span>

    <div class="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label :for="lightnessRangeId" class="label text-xs">
          Lightness (L)
        </label>
        <input
          :id="lightnessRangeId"
          v-model.number="lightness"
          class="range range-xs range-primary"
          type="range"
          min="0"
          max="100"
          step="1"
        />
        <input
          v-model.number="lightness"
          type="number"
          min="0"
          max="100"
          step="1"
          :aria-label="`${label} lightness value`"
          class="input mt-1 w-full font-mono"
          @change="normalizeChannels"
          @blur="normalizeChannels"
        />
      </div>

      <div>
        <label :for="chromaRangeId" class="label text-xs">Chroma (C)</label>
        <input
          :id="chromaRangeId"
          v-model.number="chroma"
          type="range"
          min="0"
          max="0.4"
          step="0.005"
          class="range range-xs range-primary"
        />
        <input
          v-model.number="chroma"
          type="number"
          min="0"
          max="0.4"
          step="0.005"
          :aria-label="`${label} chroma value`"
          class="input mt-1 w-full font-mono"
          @change="normalizeChannels"
          @blur="normalizeChannels"
        />
      </div>

      <div>
        <label :for="hueRangeId" class="label text-xs">Hue (H)</label>
        <input
          :id="hueRangeId"
          v-model.number="hue"
          class="range range-xs range-primary"
          type="range"
          min="0"
          max="360"
          step="1"
        />
        <input
          v-model.number="hue"
          type="number"
          min="0"
          max="360"
          step="1"
          :aria-label="`${label} hue value`"
          class="input mt-1 w-full font-mono"
          @change="normalizeChannels"
          @blur="normalizeChannels"
        />
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import Color from "colorjs.io";

const props = defineProps<{
  modelValue: string;
  label: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "oklch", value: { l: number; c: number; h: number }): void;
}>();

const id = useId();
const pickerId = `${id}-picker`;
const hexId = `${id}-hex`;
const messageId = `${id}-message`;
const lightnessRangeId = `${id}-lightness-range`;
const chromaRangeId = `${id}-chroma-range`;
const hueRangeId = `${id}-hue-range`;

const hexInput = ref(props.modelValue);
const lightness = ref<number | string>(50);
const chroma = ref<number | string>(0.1);
const hue = ref<number | string>(0);
const outOfGamut = ref(false);
const invalidInput = ref(false);
let syncing = false;

const pickerHex = computed(() => {
  try {
    return new Color(hexInput.value)
      .to("srgb")
      .toGamut({ space: "srgb" })
      .toString({ format: "hex", collapse: false });
  } catch {
    return "#000000";
  }
});

function updateHexFromOklch() {
  const l = toFiniteNumber(lightness.value);
  const c = toFiniteNumber(chroma.value);
  const h = toFiniteNumber(hue.value);

  if (l === null || c === null || h === null || syncing) return;

  try {
    const color = new Color(`oklch(${l / 100} ${c} ${h})`);
    const srgb = color.to("srgb");
    const hex = srgb
      .clone()
      .toGamut({ space: "srgb" })
      .toString({ format: "hex", collapse: false });

    outOfGamut.value = !srgb.inGamut();
    invalidInput.value = false;
    syncing = true;
    hexInput.value = hex;
    syncing = false;

    emit("update:modelValue", hex);
    emit("oklch", { l, c, h });
  } catch {
    invalidInput.value = true;
  }
}

function updateOklchFromColor(value: string) {
  if (syncing) return;

  try {
    const color = new Color(value);
    const oklch = color.to("oklch").oklch;

    syncing = true;
    lightness.value = +(oklch.l * 100).toFixed(2);
    chroma.value = +oklch.c.toFixed(4);
    hue.value = +(oklch.h ?? 0).toFixed(2);
    syncing = false;

    invalidInput.value = false;
    outOfGamut.value = false;
    emit("update:modelValue", value);
    emit("oklch", {
      l: Number(lightness.value),
      c: Number(chroma.value),
      h: Number(hue.value),
    });
  } catch {
    invalidInput.value = true;
  }
}

function updateFromPicker(event: Event) {
  hexInput.value = (event.target as HTMLInputElement).value;
}

function restoreInvalidInput() {
  if (!invalidInput.value) return;
  invalidInput.value = false;
  hexInput.value = props.modelValue;
}

function normalizeChannels() {
  syncing = true;
  lightness.value = clamp(Number(lightness.value) || 0, 0, 100);
  chroma.value = clamp(Number(chroma.value) || 0, 0, 0.4);
  hue.value = clamp(Number(hue.value) || 0, 0, 360);
  syncing = false;
  updateHexFromOklch();
}

function toFiniteNumber(value: number | string) {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

watch(hexInput, updateOklchFromColor, { flush: "sync" });

watch(
  () => props.modelValue,
  (value) => {
    if (value !== hexInput.value) hexInput.value = value;
  },
);

watch([lightness, chroma, hue], updateHexFromOklch, { flush: "sync" });

onMounted(() => updateOklchFromColor(hexInput.value));
</script>
