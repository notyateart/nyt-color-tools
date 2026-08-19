import Color from "colorjs.io";

export interface ContrastResult {
  text: string;
  apca: number;
}

/**
 * Converts any CSS color (OKLCH, HEX, RGB...) to HEX.
 */
export function toHex(color: string): string {
  return new Color(color)
    .to("srgb")
    .toGamut({ space: "srgb" })
    .toString({ format: "hex", collapse: false });
}

export function isInSrgbGamut(color: string) {
  return new Color(color).inGamut("srgb");
}

/**
 * Calculates APCA against black and white
 * and returns the better text color.
 */
export function getContrast(color: string): ContrastResult {
  const background = new Color(color).to("srgb").toGamut({ space: "srgb" });

  const black = Math.abs(background.contrast("black", "APCA"));

  const white = Math.abs(background.contrast("white", "APCA"));

  return {
    text: black > white ? "#000" : "#fff",

    apca: Math.max(black, white),
  };
}

export function getBorderColor(color: string): string {
  const c = new Color(color);

  return c
    .to("oklch")
    .set({
      l: Math.max(0, c.oklch.l - 0.12),
    })
    .toString();
}
