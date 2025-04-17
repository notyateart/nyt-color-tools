<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
    <nav class="bg-white shadow-md sticky top-0 z-10 px-8 text-2xl font-medium">
      <div class="mx-auto px-6 py-4 flex items-center justify-between">
        <!-- Title (left) -->
        <RouterLink to="/">
          NYT Color Tools
        </RouterLink>

        <!-- Nav Items (right) -->
        <div class="flex gap-6">
          <RouterLink v-for="tool in toolRoutes" :key="tool.path" :to="tool.path"
            class="hover:text-blue-700 transition-all"
            :class="{ 'text-blue-500': route.path === tool.path }">
            {{ tool.label }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 px-6 py-10 bg-slate-100">
      <div class="px-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { toolRoutes } from '../router'

const route = useRoute()
</script>
