<template>
  <Transition name="fade">
    <div
      v-if="message"
      class="fixed right-4 bottom-4 rounded bg-black px-4 py-2 text-sm text-white shadow"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
