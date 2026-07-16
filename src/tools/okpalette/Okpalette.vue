<template>
  <section class="space-y-8">
    <header>
      <h2 class="text-3xl font-bold">OK Palette</h2>
      <p class="mt-4 mb-2">
        Generate OKLCH design system palettes
        <ul class="ml-8 list-decimal text-zinc-500 dark:text-zinc-400">
          <li>Add colors using the "new color range" button.</li>
          <li>Set a hue from 0 to 360 degrees.</li>
          <li>Change start, end and if needed middle point chroma values.</li>
          <li>Results are auto-saved. Download or copy to Figma once finished.</li>
        </ul>
      </p>
    </header>


    <h3 class="text-xl font-bold w-full border-b border-zinc-300 p-4 dark:border-zinc-700">1. Settings</h3>

    <div class="flex gap-4">
      <ProjectToolbar
        :projects="projects"
        :project="currentProject"
        @select="selectProject"
        @new="newProject"
        @remove="removeProject"
        @import="importProject"
        @download="downloadProject"
        @figma="copyFigma"
      />

      <GlobalSettings :project="currentProject" />
    </div>

    <div class="h-4"></div>
    <h3 class="text-xl font-bold w-full border-b border-zinc-300 p-4 dark:border-zinc-700">2. Colors</h3>

    <div class="flex flex-wrap gap-4">
      <PaletteEditor
        v-for="palette in currentProject.palettes"
        :key="palette.id"
        :palette="palette"
        :steps="currentProject.steps"
        @remove="removePalette(palette.id)"
      />
    </div>
    <button
      class="flex justify-center gap-2 rounded bg-blue-500 py-2 pr-4 pl-2 font-medium text-white"
      @click="addPalette"
    >
      <Plus :size="24"></Plus> New color range
    </button>

    <div class="h-4"></div>
    <h3 class="text-xl font-bold w-full border-b border-zinc-300 p-4 dark:border-zinc-700">3. Output</h3>

    <PalettePreview :palettes="generated" @copied="showToast" />

    <Toast :message="toast" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus } from "@lucide/vue";
import ProjectToolbar from "./components/ProjectToolbar.vue";
import GlobalSettings from "./components/GlobalSettings.vue";
import PaletteEditor from "./components/PaletteEditor.vue";
import PalettePreview from "./components/PalettePreview.vue";
import Toast from "./components/Toast.vue";

import { useProjects } from "./composables/useProjects";

import { usePaletteGeneration } from "./composables/usePaletteGeneration";

import { useExport } from "./composables/useExport";

const {
  projects,
  currentProject,
  selectProject,
  createProject,
  deleteProject,
  saveProject,
} = useProjects();

const { generated } = usePaletteGeneration(() => currentProject.value);

const {
  copyFigmaTokens,
  downloadFigmaTokens,
  downloadProject: exportProject,
} = useExport();

const toast = ref("");

function showToast(value: string) {
  toast.value = value;

  setTimeout(() => {
    toast.value = "";
  }, 1500);
}

function newProject() {
  createProject();
}

function removeProject() {
  deleteProject(currentProject.value.id);
}

function importProject(project) {
  projects.value.push(project);

  selectProject(project.id);
}

function downloadProject() {
  exportProject(currentProject.value);
}

async function copyFigma() {
  await copyFigmaTokens(generated.value);

  showToast("Copied Figma tokens");
}

function addPalette() {
  currentProject.value.palettes.push({
    id: crypto.randomUUID(),

    name: "New Color",

    hue: 180,

    chromaStops: [
      {
        step: 0,
        value: 0.02,
      },

      {
        step: currentProject.value.steps - 1,

        value: 0.02,
      },
    ],

    curve: "ease",
  });
}

function removePalette(id: string) {
  currentProject.value.palettes = currentProject.value.palettes.filter(
    (p) => p.id !== id,
  );
}
</script>
