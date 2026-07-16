import type { GeneratedPalette, PaletteProject } from "../../paletter/types";

import { serializeFigmaTokens, stringifyJSON } from "../utils/figma";

import { downloadFile } from "../utils/download";

export function useExport() {
  async function copyFigmaTokens(palettes: GeneratedPalette[]) {
    const json = stringifyJSON(serializeFigmaTokens(palettes));

    await navigator.clipboard.writeText(json);
  }

  function downloadFigmaTokens(palettes: GeneratedPalette[], name = "palette") {
    const json = stringifyJSON(serializeFigmaTokens(palettes));

    downloadFile(`${name}-figma.json`, json);
  }

  function downloadProject(project: PaletteProject) {
    const json = stringifyJSON(project);

    downloadFile(`${project.name}.json`, json);
  }

  async function copyProjectJSON(project: PaletteProject) {
    await navigator.clipboard.writeText(stringifyJSON(project));
  }

  return {
    copyFigmaTokens,

    downloadFigmaTokens,

    downloadProject,

    copyProjectJSON,
  };
}
