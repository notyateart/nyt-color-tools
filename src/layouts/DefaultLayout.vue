<template>
  <div class="bg-base-200 text-base-content flex min-h-dvh flex-col font-sans">
    <nav
      aria-label="Primary navigation"
      class="border-base-300/70 bg-base-100/90 sticky top-0 z-20 border-b backdrop-blur-xl"
    >
      <div
        class="navbar mx-auto min-h-16 w-full max-w-[1800px] px-4 sm:px-6 lg:px-8"
      >
        <div class="navbar-start">
          <RouterLink
            to="/"
            class="btn btn-ghost gap-3 px-0 hover:bg-transparent"
          >
            <span
              class="bg-primary text-primary-content grid size-9 place-items-center rounded-xl shadow-sm"
            >
              <Palette :size="20" />
            </span>
            <span class="text-base font-semibold tracking-tight sm:text-lg">
              NYT Color Tools
            </span>
          </RouterLink>
        </div>

        <div class="navbar-end gap-2">
          <ul
            class="menu menu-horizontal bg-base-200/70 rounded-box hidden gap-1 p-1 lg:flex"
          >
            <li v-for="tool in toolRoutes" :key="tool.path">
              <RouterLink
                :to="tool.path"
                class="px-3 text-sm font-medium"
                :class="{ 'menu-active': route.path === tool.path }"
              >
                {{ tool.label }}
              </RouterLink>
            </li>
          </ul>

          <button
            type="button"
            class="btn btn-ghost btn-square btn-sm"
            :aria-label="isDark ? 'Use light theme' : 'Use dark theme'"
            :aria-pressed="isDark"
            @click="toggleTheme"
          >
            <Sun v-if="isDark" :size="19" />
            <Moon v-else :size="19" />
          </button>

          <details ref="mobileMenu" class="dropdown dropdown-end lg:hidden">
            <summary
              class="btn btn-ghost btn-square"
              aria-label="Open navigation"
            >
              <Menu :size="22" />
            </summary>
            <ul
              class="menu dropdown-content bg-base-100 border-base-300 rounded-box z-20 mt-3 w-52 border p-2 shadow-xl"
            >
              <li v-for="tool in toolRoutes" :key="tool.path">
                <RouterLink
                  :to="tool.path"
                  :class="{ 'menu-active': route.path === tool.path }"
                  @click="closeMobileMenu"
                >
                  {{ tool.label }}
                </RouterLink>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </nav>

    <main class="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
      <div class="mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Menu, Moon, Palette, Sun } from "@lucide/vue";
import { useRoute } from "vue-router";
import { toolRoutes } from "../router";

const route = useRoute();
const mobileMenu = ref<HTMLDetailsElement | null>(null);
const isDark = ref(document.documentElement.dataset.theme === "sweet-dark");

function toggleTheme() {
  isDark.value = !isDark.value;
  const theme = isDark.value ? "sweet-dark" : "sweet-light";
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("nyt-color-tools-theme", theme);
}

function closeMobileMenu() {
  if (mobileMenu.value) mobileMenu.value.open = false;
}
</script>
