<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    <h2 class="text-3xl font-bold">OKLCH Palette Generator</h2>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Hue Controls -->
      <div>
        <h3 class="font-semibold mb-2">Hues (°)</h3>
        <div class="space-y-2">
          <div v-for="(h, i) in hues" :key="'h' + i" class="flex gap-2">
            <input
              v-model.number="hues[i]"
              type="number"
              step="5"
              min="0"
              max="360"
              class="flex-1 p-2 border rounded"
              :placeholder="'Hue ' + (i + 1)"
            />
            <button @click="hues.splice(i, 1)" class="text-red-500">✕</button>
          </div>
          <button
            @click="hues.push(0)"
            class="px-2 py-1 text-sm bg-gray-200 rounded"
          >
            + Add Hue
          </button>
        </div>
      </div>

      <!-- Lightness Controls -->
      <div>
        <h3 class="font-semibold mb-2">Lightness</h3>
        <div class="space-y-2">
          <div v-for="(l, i) in lightnesses" :key="'l' + i" class="flex gap-2">
            <input
              v-model.number="lightnesses[i]"
              type="number"
              step="5"
              min="0"
              max="100"
              class="flex-1 p-2 border rounded"
              :placeholder="'L ' + (i + 1)"
            />
            <button @click="lightnesses.splice(i, 1)" class="text-red-500">
              ✕
            </button>
          </div>
          <button
            @click="lightnesses.push(70)"
            class="px-2 py-1 text-sm bg-gray-200 rounded"
          >
            + Add Lightness
          </button>
        </div>
      </div>

      <!-- Chroma Controls -->
      <div>
        <h3 class="font-semibold mb-2">Chroma</h3>
        <div class="space-y-2">
          <div v-for="(c, i) in chromas" :key="'c' + i" class="flex gap-2">
            <input
              v-model.number="chromas[i]"
              type="number"
              step="0.01"
              min="0"
              class="flex-1 p-2 border rounded"
              :placeholder="'C ' + (i + 1)"
            />
            <button @click="chromas.splice(i, 1)" class="text-red-500">
              ✕
            </button>
          </div>
          <button
            @click="chromas.push(0.05)"
            class="px-2 py-1 text-sm bg-gray-200 rounded"
          >
            + Add Chroma
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 space-x-4">
      <!-- Button -->
      <button
        @click="copyCode"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Copy Code
      </button>
    </div>
    <!-- Color Grid -->
    <div v-if="palette.length" class="grid grid-cols-6 gap-2">
        <div
            v-for="(color, index) in palette"
            :key="index"
            class="aspect-square rounded border-4 flex items-center justify-center text-xs text-center px-1"
            :style="{
            backgroundColor: color.clone().toGamut({ space: 'srgb' }).toString(),
            borderColor: color.inGamut('srgb') ? 'white' : 'red',
            }"
        >
        <span
            :style="{
            color: (
                Math.abs(color.clone().toGamut(
                    { space: 'srgb' }
                ).contrast(white, 'APCA')) > 
                Math.abs(color.clone().toGamut(
                    { space: 'srgb' }
                ).contrast(black, 'APCA'))
            ) ? 'white' : 'black',
            }"
        >
            {{ color.toString('oklch') }}
        </span>
        </div>
    </div>



  </div>
  <!-- Toast notifications -->
  <div class="fixed bottom-4 right-4 flex flex-col items-end space-y-4 z-50">
    <transition-group name="fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="bg-gray-900 text-white px-4 py-2 rounded shadow-lg text-sm"
      >
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

<script setup>
import { ref, watchEffect } from "vue";
import Color from "colorjs.io";

// Reactive arrays
const hues = ref([10, 55, 100, 145, 190, 235, 280, 325]);
const lightnesses = ref([85, 70, 55, 40]);
const chromas = ref([0.15, 0.05]);
const palette = ref([]);
const toasts = ref([]);
const white = new Color("#FFFFFF");
const black = new Color("#000000");

// Auto-generate on change
watchEffect(() => {
  const result = [];

  for (let hue of hues.value) {
    for (let chroma of chromas.value) {
      for (let lightness of lightnesses.value) {
        const color = new Color(`oklch(${lightness}% ${chroma} ${hue})`);
        result.push(color);
      }
    }
  }

  palette.value = result;
});

// Toast system
function showToast(message, duration = 3000) {
  const id = Date.now();
  toasts.value.push({ id, message });
  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, duration);
}


// Copy colors to clipboard
async function copyCode() {
  const hexList = palette.value
    .map((color) => color.to("srgb").toString({ format: "hex" }))
    .join('", "');

  try {
    await navigator.clipboard.writeText('"' + hexList + '"');
    showToast("Copied palette to clipboard ✅");
  } catch (err) {
    console.error("Clipboard error:", err);
    showToast("Failed to copy to clipboard ❌");
  }
}
</script>
