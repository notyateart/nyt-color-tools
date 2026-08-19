<template>
  <section class="mx-auto max-w-[1800px] space-y-6">
    <ToolHeader
      title="Figma Design System Palette Generator"
      description="Build sophisticated color palettes for design systems. Based on the principles of perceptually uniform color spaces but with more creative freedom while still keeping everything consistent. With the ability to save, download, upload and export to Figma."
    />

    <div class="card bg-base-100 border-base-300 border shadow-sm">
      <div
        class="card-body lg:divide-base-300 grid gap-6 p-6 sm:p-6 lg:grid-cols-2 lg:divide-x"
      >
        <ProjectToolbar
          class="lg:pr-6"
          :projects="projects"
          :project="currentProject"
          @select="selectProject"
          @new="newProject"
          @remove="removeProject"
          @import="tryImportProject"
          @import-error="showToast"
          @download="downloadProject"
          @figma="copyFigma"
        />

        <GlobalSettings :project="currentProject" />
      </div>
    </div>

    <section class="space-y-4">
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-xl font-semibold tracking-tight">Color ranges</h2>
          <p class="text-base-content/60 mt-1 text-sm">
            Adjust each range beside its live swatches.
          </p>
        </div>
        <button
          type="button"
          class="btn btn-primary"
          @click="addPalette"
        >
          <Plus :size="18" /> Add color
        </button>
      </div>

      <article
        v-for="(palette, index) in currentProject.palettes"
        :key="palette.id"
        class="card bg-base-100 border-base-300 border shadow-sm"
      >
        <div class="card-body gap-6 p-6">
          <header class="flex items-center gap-3">
            <input
              v-model="palette.name"
              class="input input-ghost h-auto min-w-0 flex-1 px-0 text-xl font-semibold tracking-tight focus:px-3"
              aria-label="Color range name"
            />
            <span class="text-base-content/50 hidden text-sm sm:block">
              {{ hueSummary(palette.hue, palette.endHue) }}
            </span>
            <button
              type="button"
              class="btn btn-error btn-ghost btn-square btn-sm"
              aria-label="Delete color range"
              :disabled="currentProject.palettes.length <= 1"
              @click="removePalette(palette.id)"
            >
              <Trash2 :size="18" />
            </button>
          </header>

          <div
            class="xl:divide-base-300 grid items-start gap-6 xl:grid-cols-[minmax(420px,0.8fr)_minmax(600px,1.2fr)] xl:divide-x"
          >
            <PaletteSettings
              :palette="palette"
              :steps="currentProject.steps"
              class="xl:pr-6"
            />

            <div>
              <PalettePreview
                :palette="generated[index]"
                @copied="(value) => showToast(`Copied ${value}`)"
                @copy-error="showToast"
              />
            </div>
          </div>
        </div>
      </article>
      <div class="flex flex-row-reverse">
        <button
          type="button"
          class="btn btn-primary"
          @click="addPalette"
        >
          <Plus :size="18" /> Add color
        </button>
      </div>
    </section>

    <AppToast :message="toast" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus, Trash2 } from "@lucide/vue";
import AppToast from "../../components/AppToast.vue";
import ToolHeader from "../../components/ToolHeader.vue";
import ProjectToolbar from "./components/ProjectToolbar.vue";
import GlobalSettings from "./components/GlobalSettings.vue";
import PaletteSettings from "./components/PaletteSettings.vue";
import PalettePreview from "./components/PalettePreview.vue";
import type { PaletteProject } from "./types.ts";

import { useProjects } from "./composables/useProjects.ts";

import { usePaletteGeneration } from "./composables/usePaletteGeneration.ts";

import {
  copyFigmaTokens,
  downloadProject as downloadProjectFile,
} from "./utils/export.ts";

const {
  projects,
  currentProject,
  selectProject,
  createProject,
  deleteProject,
  importProject,
} = useProjects();

const { generated } = usePaletteGeneration(() => currentProject.value);

const toast = ref("");
let toastTimer: number | undefined;

function showToast(value: string) {
  window.clearTimeout(toastTimer);
  toast.value = value;

  toastTimer = window.setTimeout(() => {
    toast.value = "";
  }, 2200);
}

function newProject() {
  createProject();
}

function removeProject() {
  if (
    !window.confirm(
      `Delete “${currentProject.value.name}”? This cannot be undone.`,
    )
  ) {
    return;
  }

  deleteProject(currentProject.value.id);
  showToast("Project deleted");
}

function downloadProject() {
  downloadProjectFile(currentProject.value);
}

async function copyFigma() {
  try {
    await copyFigmaTokens(generated.value);
    showToast("Copied Figma tokens");
  } catch {
    showToast("Clipboard access was blocked");
  }
}

function tryImportProject(project: PaletteProject) {
  try {
    importProject(project);
    showToast("Project imported");
  } catch {
    showToast("Could not import that project file");
  }
}

function addPalette() {
  currentProject.value.palettes.push({
    id: crypto.randomUUID(),

    name: "New Color",

    hue: 180,

    endHue: null,

    chromaStops: [
      {
        id: crypto.randomUUID(),
        step: 0,
        value: 0.02,
      },

      {
        id: crypto.randomUUID(),
        step: currentProject.value.steps - 1,

        value: 0.02,
      },
    ],

    curve: "ease",
  });
}

function removePalette(id: string) {
  const palette = currentProject.value.palettes.find((item) => item.id === id);
  if (
    !palette ||
    !window.confirm(`Delete the “${palette.name}” color range?`)
  ) {
    return;
  }

  currentProject.value.palettes = currentProject.value.palettes.filter(
    (p) => p.id !== id,
  );
}

function hueSummary(start: number, end: number | null) {
  return end === null ? `Hue ${start}°` : `Hue ${start}° → ${end}°`;
}

watch(
  () => currentProject.value.steps,
  (newSteps, oldSteps) => {
    const next = Number(newSteps);
    const previous = Number(oldSteps);
    if (
      !Number.isFinite(next) ||
      !Number.isFinite(previous) ||
      next < 2 ||
      previous < 2 ||
      next === previous
    ) {
      return;
    }

    currentProject.value.palettes.forEach((palette) => {
      palette.chromaStops = palette.chromaStops.map((stop, index, array) => {
        if (index === 0) {
          return { ...stop, step: 0 };
        }

        if (index === array.length - 1) {
          return { ...stop, step: next - 1 };
        }

        return {
          ...stop,
          step: Math.round((stop.step * (next - 1)) / (previous - 1)),
        };
      });
    });
  },
);
</script>
