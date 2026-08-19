<template>
  <section class="space-y-10 pt-6 pb-8 sm:space-y-14 sm:pt-12">
    <div class="hero min-h-[38vh]">
      <div class="hero-content text-center">
        <div class="max-w-3xl">
          <div class="badge badge-primary badge-outline mb-4">
            OKLCH utilities
          </div>
          <h1 class="text-4xl font-bold tracking-[-0.045em] sm:text-6xl">
            NYT Color Tools
          </h1>
          <p
            class="text-base-content/70 mx-auto max-w-2xl py-6 text-base leading-relaxed sm:text-lg"
          >
            Generate accessible palettes, explore color combinations, and build
            smooth perceptual gradients—all in the browser.
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <RouterLink
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        class="card bg-base-100 border-base-300 group border transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="card-body gap-4 p-6">
          <span
            class="bg-primary/12 text-primary grid size-11 place-items-center rounded-xl"
          >
            <component :is="tool.icon" :size="22" />
          </span>
          <div>
            <h2 class="card-title text-lg">
              {{ tool.title }}
              <ArrowRight
                :size="17"
                class="transition-transform group-hover:translate-x-1"
              />
            </h2>
            <p class="text-base-content/65 mt-2 text-sm leading-relaxed">
              {{ tool.description }}
            </p>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Blend, Layers3, Palette } from "@lucide/vue";

const tools = [
  {
    title: "Gradient Step Generator",
    description: "Generate swatches from smooth color transitions using OKLCH or HEX input.",
    to: "/gradient",
    icon: Blend,
  },
  {
    title: "Quick Palette Generator",
    description:
      "Quickly generate perceptually uniform color palettes.",
    to: "/quickpalette",
    icon: Layers3,
  },
    {
    title: "Figma Design System Palette Generator",
    description:
      "Build sophisticated color palettes for design systems. Based on the principles of perceptually uniform color spaces but with more creative freedom while still keeping everything consistent. With the ability to save, download, upload and export to Figma.",
    to: "/figmapalette",
    icon: Palette,
  },

];
</script>
