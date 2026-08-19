<template>
  <Transition name="toast">
    <div
      v-if="message"
      class="toast toast-end toast-bottom pointer-events-none z-50"
      role="status"
      aria-live="polite"
    >
      <div class="alert alert-info shadow-lg">
        <span>{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
