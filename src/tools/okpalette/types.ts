export type Curve = "linear" | "ease";

export type LightnessCurve = "linear" | "smooth";

export interface ChromaStop {
  id?: string;

  step: number;

  value: number;
}

export interface Palette {
  id: string;

  name: string;

  hue: number;

  endHue: number | null;

  chromaStops: ChromaStop[];

  curve: Curve;
}

export interface PaletteProject {
  id: string;

  name: string;

  lightnessTop: number;

  lightnessBottom: number;

  steps: number;

  lightnessCurve: LightnessCurve;

  lightnessCurveFactor: number;

  chromaMultiplier: number;

  palettes: Palette[];
}

export interface GeneratedColor {
  oklch: string;

  hex: string;

  text: string;

  border: string;

  apca: number;

  outOfGamut: boolean;
}

export interface GeneratedPalette extends Palette {
  colors: GeneratedColor[];
}
