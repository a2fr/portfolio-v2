import { Marcellus, Pinyon_Script } from "next/font/google";

/** Typefaces of the desk pad print: a flared serif for the mottos, a script for the swash "O". */
const serif = Marcellus({ weight: "400", subsets: ["latin"] });
const script = Pinyon_Script({ weight: "400", subsets: ["latin"] });

export const PAD_FONTS = { serif: serif.style.fontFamily, script: script.style.fontFamily };
