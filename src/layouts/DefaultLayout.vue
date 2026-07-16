<template>
  <div
    class="flex min-h-screen flex-col bg-zinc-100 font-sans text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
  >
    <nav
      class="sticky top-0 z-10 bg-white px-8 text-2xl font-medium shadow-md dark:bg-zinc-800"
    >
      <div class="mx-auto flex items-center justify-between px-6 py-4">
        <!-- Title (left) -->
        <RouterLink to="/"> NYT Color Tools </RouterLink>

        <!-- Nav Items (right) -->
        <div class="flex gap-6">
          <RouterLink
            v-for="tool in toolRoutes"
            :key="tool.path"
            :to="tool.path"
            class="transition-all hover:text-blue-700"
            :class="{ 'text-blue-500': route.path === tool.path }"
          >
            {{ tool.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 px-6 py-10">
      <div class="px-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { toolRoutes } from "../router";

const route = useRoute();
</script>
