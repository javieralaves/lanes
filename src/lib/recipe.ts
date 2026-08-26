import type { Recipe } from "./types";

/**
 * Weeknight lentil curry — ~10 min cook compressed into ~2.5 min of play.
 * Notes are real cook verbs timed across Board / Pot / Finish lanes.
 */
export const LENTIL_CURRY: Recipe = {
  id: "weeknight-lentil-curry",
  title: "Weeknight Lentil Curry",
  subtitle: "Board · Pot · Finish — one plate, timed",
  durationSec: 155,
  notes: [
    // Board stream
    { id: "b1", lane: "board", time: 6, label: "Dice onion" },
    { id: "b2", lane: "board", time: 18, label: "Mince garlic" },
    { id: "b3", lane: "board", time: 32, label: "Cube tomato" },
    { id: "b4", lane: "board", time: 48, label: "Rinse lentils" },
    { id: "b5", lane: "board", time: 88, label: "Chop cilantro" },

    // Pot stream — overlapping prep
    { id: "p1", lane: "pot", time: 10, label: "Heat oil" },
    { id: "p2", lane: "pot", time: 22, label: "Bloom cumin" },
    { id: "p3", lane: "pot", time: 26, label: "Bloom turmeric" },
    { id: "p4", lane: "pot", time: 36, label: "Sweat onion" },
    { id: "p5", lane: "pot", time: 44, label: "Stir garlic" },
    { id: "p6", lane: "pot", time: 56, label: "Add tomato" },
    { id: "p7", lane: "pot", time: 68, label: "Tip lentils" },
    { id: "p8", lane: "pot", time: 74, label: "Pour water" },
    { id: "p9", lane: "pot", time: 86, label: "Simmer cue" },
    { id: "p10", lane: "pot", time: 102, label: "Stir pot" },
    { id: "p11", lane: "pot", time: 118, label: "Check lentils" },

    // Finish stream
    { id: "f1", lane: "finish", time: 110, label: "Splash coconut" },
    { id: "f2", lane: "finish", time: 122, label: "Salt to taste" },
    { id: "f3", lane: "finish", time: 132, label: "Fluff rice" },
    { id: "f4", lane: "finish", time: 142, label: "Ladle curry" },
    { id: "f5", lane: "finish", time: 150, label: "Plate & serve" },
  ],
};

export const DEMO_RECIPE = LENTIL_CURRY;
