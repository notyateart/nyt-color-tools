<template>
  <header>
    <h1 class="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="text-base-content/65 mt-2 max-w-3xl text-sm leading-relaxed sm:text-base"
    >
      {{ description }}
    </p>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
