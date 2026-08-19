<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold">Project</h2>

    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
      <label :for="projectSelectId" class="sr-only">Active project</label>
      <select :id="projectSelectId" v-model="selectedId" class="select w-full">
        <option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
        >
          {{ project.name }}
        </option>
      </select>

      <button
        type="button"
        class="btn btn-error btn-outline"
        :disabled="projects.length <= 1"
        @click="emit('remove')"
      >
        <Trash2 :size="18" /> Delete
      </button>

      <input
        :id="projectNameId"
        v-model="project.name"
        aria-label="Project name"
        class="input w-full"
      />

      <button type="button" class="btn btn-primary" @click="emit('new')">
        <Plus :size="18" /> New project
      </button>
    </div>

    <div class="grid grid-cols-3 gap-2 pt-1">
      <label
        class="btn btn-soft cursor-pointer"
        aria-label="Import project JSON"
      >
        <Upload :size="18" /> Import
        <input type="file" accept=".json" class="hidden" @change="importFile" />
      </label>

      <button
        type="button"
        class="btn btn-soft"
        @click="emit('download')"
      >
        <Download :size="18" /> Export
      </button>

      <button
        type="button"
        class="btn btn-soft"
        title="Copy Figma-compatible design tokens"
        @click="emit('figma')"
      >
        <ClipboardCopy :size="18" /> Tokens
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import { Upload, Download, ClipboardCopy, Trash2, Plus } from "@lucide/vue";
import type { PaletteProject } from "../types";

const props = defineProps<{
  projects: PaletteProject[];

  project: PaletteProject;
}>();

const emit = defineEmits<{
  select: [id: string];

  new: [];

  remove: [];

  import: [project: PaletteProject];

  importError: [message: string];

  download: [];

  figma: [];
}>();

const selectedId = computed({
  get: () => props.project.id,
  set: (id: string) => emit("select", id),
});

const id = useId();
const projectSelectId = `${id}-project`;
const projectNameId = `${id}-project-name`;

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement;

  const file = input.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    const project = JSON.parse(text) as PaletteProject;

    emit("import", project);
  } catch {
    emit("importError", "Could not import that project file");
  } finally {
    input.value = "";
  }
}
</script>
