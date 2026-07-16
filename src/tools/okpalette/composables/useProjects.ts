import { computed, ref, watch } from "vue";

import type { Palette, PaletteProject } from "../types";

const STORAGE_KEY = "ok-palette-projects";

const ACTIVE_KEY = "ok-palette-active";

function createDefaultProject(): PaletteProject {
  return {
    id: crypto.randomUUID(),

    name: "New Palette",

    lightnessTop: 98,

    lightnessBottom: 18,

    steps: 12,

    chromaMultiplier: 1,

    palettes: [
      {
        id: crypto.randomUUID(),

        name: "Blue",

        hue: 240,

        curve: "ease",

        chromaStops: [
          {
            step: 0,
            value: 0.02,
          },

          {
            step: 6,
            value: 0.18,
          },

          {
            step: 11,
            value: 0.04,
          },
        ],
      },
    ],
  };
}

function loadProjects(): PaletteProject[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [createDefaultProject()];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [createDefaultProject()];
  }
}

export function useProjects() {
  const projects = ref<PaletteProject[]>(loadProjects());

  const activeId = ref(
    localStorage.getItem(ACTIVE_KEY) ?? projects.value[0].id,
  );

  const currentProject = computed(() => {
    return (
      projects.value.find((p) => p.id === activeId.value) ?? projects.value[0]
    );
  });

  watch(
    projects,

    (value) => {
      localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify(value),
      );
    },

    {
      deep: true,
    },
  );

  watch(
    activeId,

    (value) => {
      localStorage.setItem(ACTIVE_KEY, value);
    },
  );

  function selectProject(id: string) {
    activeId.value = id;
  }

  function createProject() {
    const project = createDefaultProject();

    project.name = `Palette ${projects.value.length + 1}`;

    projects.value.push(project);

    selectProject(project.id);
  }

  function deleteProject(id: string) {
    if (projects.value.length <= 1) {
      return;
    }

    projects.value = projects.value.filter((p) => p.id !== id);

    selectProject(projects.value[0].id);
  }

  function importProject(project: PaletteProject) {
    const normalized = normalizeProject(project);

    projects.value.push(normalized);

    selectProject(normalized.id);
  }

  return {
    projects,

    currentProject,

    selectProject,

    createProject,

    deleteProject,

    importProject,
  };
}

function normalizeProject(project: PaletteProject): PaletteProject {
  return {
    ...project,

    id: project.id ?? crypto.randomUUID(),

    palettes: project.palettes.map((palette: Palette) => ({
      ...palette,

      id: palette.id ?? crypto.randomUUID(),

      chromaStops: palette.chromaStops ?? [
        {
          step: 0,
          value: 0.02,
        },

        {
          step: project.steps - 1,

          value: 0.02,
        },
      ],
    })),
  };
}
