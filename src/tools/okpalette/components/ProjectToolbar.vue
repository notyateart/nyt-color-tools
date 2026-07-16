<template>
  <fieldset
    class="flex w-150 flex-col gap-4 rounded border border-zinc-300 p-4 dark:border-zinc-700"
  >
    <legend class="px-2 font-semibold text-zinc-500 dark:text-zinc-300">
      Palette management
    </legend>

    <div class="grid grid-cols-3 grid-rows-3 gap-4">
      <select
        v-model="selectedId"
        class="col-span-2 rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
        @change="changeProject"
      >
        <option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
        >
          {{ project.name }}
        </option>
      </select>

      <button
        class="col-span-1 flex justify-center gap-2 rounded bg-red-500 py-2 pr-4 pl-2 font-medium text-white"
        @click="emit('remove')"
      >
        <Trash2 :size="24" /> Delete set
      </button>

      <input
        v-model="project.name"
        class="col-span-2 rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      />

      <button
        class="col-span-1 flex justify-center gap-2 rounded bg-blue-500 py-2 pr-4 pl-2 font-medium text-white"
        @click="emit('new')"
      >
        <Save :size="24" /> Save set
      </button>

      <label
        class="col-span-1 flex cursor-pointer justify-center gap-2 rounded bg-zinc-300 py-2 pr-4 pl-2 font-medium dark:bg-zinc-700"
      >
        <Upload :size="24" /> Upload JSON
        <input type="file" accept=".json" class="hidden" @change="importFile" />
      </label>

      <button
        class="col-span-1 flex cursor-pointer justify-center gap-2 rounded bg-zinc-300 py-2 pr-4 pl-2 font-medium dark:bg-zinc-700"
        @click="emit('download')"
      >
        <Download :size="24" /> Download JSON
      </button>

      <button
        class="col-span-1 flex cursor-pointer justify-center gap-2 rounded bg-zinc-300 py-2 pr-4 pl-2 font-medium dark:bg-zinc-700"
        @click="emit('figma')"
      >
        <ClipboardCopy :size="24" /> Copy tokens
      </button>
    </div>
    <p>
      Install
      <a
        class="underline hover:text-blue-500"
        href="https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens"
        >Figma Tokens</a
      >, run the plugin and open JSON tab, copy tokens and paste there.
    </p>
  </fieldset>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Upload, Download, ClipboardCopy, Trash2, Save } from "@lucide/vue";
import type { PaletteProject } from "../../paletter/types";

const props = defineProps<{
  projects: PaletteProject[];

  project: PaletteProject;
}>();

const emit = defineEmits<{
  select: [id: string];

  new: [];

  remove: [];

  import: [project: PaletteProject];

  download: [];

  figma: [];
}>();

const selectedId = ref(props.project.id);

function changeProject() {
  emit("select", selectedId.value);
}

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement;

  const file = input.files?.[0];

  if (!file) return;

  const text = await file.text();

  const project = JSON.parse(text) as PaletteProject;

  emit("import", project);

  input.value = "";
}
</script>
