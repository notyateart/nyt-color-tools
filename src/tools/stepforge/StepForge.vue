<template>
  <section class="space-y-8">
    <header>
      <h2 class="text-3xl font-bold">StepForge</h2>
      <p class="text-gray-600 mt-4 mb-2">
        Generate smooth color transitions using OKLCH or HEX input.
      </p>
      <hr class="border-slate-300" />
    </header>

    <!-- === Inputs === -->
    <form class="grid gap-6 sm:grid-cols-2 max-w-4xl">
      <ColorInput v-model="startColorRaw" label="Start Color" @oklch="(val) => (startColorOKLCH = val)" />

      <ColorInput v-model="endColorRaw" label="End Color" @oklch="(val) => (endColorOKLCH = val)" />


      <!-- Step count -->
      <div class="flex flex-col gap-2 sm:col-span-2">
        <label class="text-sm font-medium">Steps</label>
        <input v-model.number="steps" type="number" min="2" max="100" class="w-24 px-3 py-2 border rounded text-sm" />
      </div>
    </form>

    <!-- === Preview Grid === -->
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-4">
      <div v-for="(color, i) in interpolated" :key="i"
        class="h-36 rounded shadow border flex flex-col items-center justify-center gap-1 text-xs font-mono px-1 py-2 text-center"
        :style="{ backgroundColor: color.hex, border: color.border }">
        <span :style="{ color: color.text }" class="hover:underline cursor-pointer" @click="copy(color.oklch, 'OKLCH')">
          {{ color.oklch }}
        </span>
        <span :style="{ color: color.text }" class="hover:underline cursor-pointer" @click="copy(color.hex, 'HEX')">
          {{ color.hex }}
        </span>
      </div>
    </div>

    <!-- === Toast === -->
    <div v-if="toast"
      class="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow transition-opacity duration-300">
      {{ toast }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Color from 'colorjs.io'
import ColorInput from '../../components/ColorInput.vue'

const startColorRaw = ref('#006eff')
const endColorRaw = ref('#996699')
const startColorOKLCH = ref({ l: 58, c: 0.23, h: 260 })
const endColorOKLCH = ref({ l: 58, c: 0.09, h: 325 })
const steps = ref(5)
const toast = ref('')

// Interpolation + APCA contrast
function interpolateOklch(
  start: { l: number; c: number; h: number },
  end: { l: number; c: number; h: number },
  n: number
) {
  const result = []

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const l = start.l + t * (end.l - start.l)
    const c = start.c + t * (end.c - start.c)
    const h = interpolateHue(start.h, end.h, t)

    const color = new Color('oklch(' + l / 100 + ' ' + c + ' ' + h + ')')
    const srgb = color.to('srgb')
    const hex = srgb.toString({ format: 'hex' })

    const black = new Color('#000000')
    const white = new Color('#FFFFFF')
    const contrastToBlack = black.contrast(srgb, 'APCA')
    const contrastToWhite = white.contrast(srgb, 'APCA')
    let textColor = '#ffffff'
    if (Math.abs(contrastToBlack) > Math.abs(contrastToWhite)) {
      textColor = '#000000'
    } else {
      textColor = '#ffffff'
    }
    let border = '#000000'
    if (color.inGamut("srgb")) {
      border = '1px solid #000000'
    } else {
      border = '4px dashed #000000'
    }

    result.push({
      oklch: `oklch(${l.toFixed(2)}% ${c.toFixed(4)} ${h.toFixed(2)})`,
      hex,
      text: textColor,
      border,
    })
  }

  return result
}

function interpolateHue(h1: number, h2: number, t: number) {
  const delta = (((h2 - h1 + 180) % 360) - 180)
  return (h1 + delta * t + 360) % 360
}

const interpolated = computed(() => {
  if (steps.value < 2) return []
  return interpolateOklch(startColorOKLCH.value, endColorOKLCH.value, steps.value)
})

function copy(text: string, label = '') {
  navigator.clipboard.writeText(text)
  toast.value = `${label} copied: ${text}`
  setTimeout(() => {
    toast.value = ''
  }, 2000)
}
</script>
