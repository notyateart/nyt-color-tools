<template>
    <div class="flex flex-col gap-4">
      <label class="text-sm font-medium">{{ label }}</label>
  
      <!-- Hex picker and preview -->
      <div class="flex items-center gap-2">
        <input
          type="color"
          v-model="hexInput"
          class="w-10 h-10 rounded border shrink-0"
          :title="outOfGamut ? 'Fallback preview (outside sRGB)' : ''"
        />
        <input
          v-model="hexInput"
          type="text"
          class="flex-1 px-3 py-2 border rounded text-sm font-mono"
        />
      </div>
  
      <!-- OKLCH sliders + inputs -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label class="text-xs text-gray-500">Lightness (L)</label>
          <input type="range" min="0" max="100" step="1" v-model.number="l" />
          <input type="number" min="0" max="100" step="1" v-model.number="l" class="w-full px-2 py-1 border rounded text-sm font-mono" />
        </div>
        <div>
          <label class="text-xs text-gray-500">Chroma (C)</label>
          <input type="range" min="0" max="0.37" step="0.005" v-model.number="c" />
          <input type="number" min="0" max="0.37" step="0.005" v-model.number="c" class="w-full px-2 py-1 border rounded text-sm font-mono" />
        </div>
        <div>
          <label class="text-xs text-gray-500">Hue (H)</label>
          <input type="range" min="0" max="360" step="1" v-model.number="h" />
          <input type="number" min="0" max="360" step="1" v-model.number="h" class="w-full px-2 py-1 border rounded text-sm font-mono" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import Color from 'colorjs.io'
  
  const props = defineProps<{
    modelValue: string
    label: string
  }>()
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'oklch', value: { l: number; c: number; h: number }): void
  }>()
  
  const hexInput = ref(props.modelValue)
  const l = ref(50)
  const c = ref(0.1)
  const h = ref(0)
  const fallbackHex = ref('#808080')
  const outOfGamut = ref(false)
  
  function updateHexFromOklch() {
    try {
      const color = new Color(`oklch(${l.value / 100} ${c.value} ${h.value})`)
      const srgb = color.to('srgb')
      fallbackHex.value = srgb.toString({ format: 'hex' })
      outOfGamut.value = !srgb.inGamut()
  
      emit('update:modelValue', fallbackHex.value)
      emit('oklch', { l: l.value, c: c.value, h: h.value })
    } catch {
      fallbackHex.value = '#000000'
      outOfGamut.value = true
    }
  }
  
  function updateOklchFromHex(newHex: string) {
    try {
      const color = new Color(newHex)
      const o = color.oklch
      l.value = +(o.l * 100).toFixed(2)
      c.value = +o.c.toFixed(4)
      h.value = +(o.h ?? 0).toFixed(2)
      fallbackHex.value = newHex
      outOfGamut.value = false
      emit('oklch', { l: l.value, c: c.value, h: h.value })
    } catch {
      // Do nothing on invalid hex
    }
  }
  
  // Sync: hex → oklch (all 3 sliders update together)
  watch(hexInput, (val) => {
    updateOklchFromHex(val)
  })
  
  // Sync: oklch sliders → hex (hex updates, but oklch remains stable)
  watch([l, c, h], () => {
    updateHexFromOklch()
  })
  
  // Init
  onMounted(() => {
    hexInput.value = props.modelValue
    updateOklchFromHex(hexInput.value)
  })
  </script>