import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

/** Títulos y números grandes. */
export const DISPLAY_FONT = loadSpaceGrotesk("normal", {
  weights: ["500", "700"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

/** Texto corrido y subtítulos. */
export const BODY_FONT = loadInter("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
