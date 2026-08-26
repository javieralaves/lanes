import type { Recipe } from "./types";

/**
 * Counter warm-up — initiation cook for tempo + three lanes.
 *
 * A real weeknight micro-cook (garlic oil on toast). Short windows, clear
 * handoffs Board → Pot → Finish. Faster and simpler than the lentil curry;
 * meant to set kitchen tempo before a longer recipe.
 */
export const GARLIC_OIL_TOAST: Recipe = {
  id: "garlic-oil-toast",
  title: "Garlic Oil Toast",
  subtitle: "Initiation · set your kitchen tempo",
  durationSec: 150,
  notes: [
    // Board — knife work, then the pot takes over
    {
      id: "g1",
      lane: "board",
      time: 6,
      duration: 28,
      label: "Smash & peel garlic",
    },
    {
      id: "g2",
      lane: "board",
      time: 38,
      duration: 32,
      label: "Rough chop garlic",
    },

    // Pot — heat, then soft cook (not a long simmer)
    { id: "g3", lane: "pot", time: 28, duration: 25, label: "Warm oil in pan" },
    {
      id: "g4",
      lane: "pot",
      time: 72,
      duration: 40,
      label: "Soften garlic in oil",
    },

    // Finish — plate at counter pace
    {
      id: "g5",
      lane: "finish",
      time: 115,
      duration: 35,
      label: "Spoon oil over toast",
    },
  ],
};

/**
 * Weeknight lentil curry — cook-paced chart.
 *
 * Each note's `duration` is about how long that real step takes. The window
 * opens, you do the work, then tap when you're done. Simmer is shortened
 * for a previewable demo; prep/finish windows stay near real kitchen time.
 */
export const LENTIL_CURRY: Recipe = {
  id: "weeknight-lentil-curry",
  title: "Weeknight Lentil Curry",
  subtitle: "Do the step · tap when done",
  durationSec: 840,
  notes: [
    // Board — knife work at real chopping pace
    { id: "b1", lane: "board", time: 12, duration: 90, label: "Dice onion" },
    { id: "b2", lane: "board", time: 110, duration: 45, label: "Mince garlic" },
    { id: "b3", lane: "board", time: 165, duration: 60, label: "Cube tomato" },
    { id: "b4", lane: "board", time: 235, duration: 40, label: "Rinse lentils" },
    { id: "b5", lane: "board", time: 600, duration: 45, label: "Chop cilantro" },

    // Pot — heat, build the curry, then a real-feel simmer wait
    { id: "p1", lane: "pot", time: 50, duration: 40, label: "Heat oil" },
    {
      id: "p2",
      lane: "pot",
      time: 165,
      duration: 110,
      label: "Sweat onion + bloom spices",
    },
    { id: "p3", lane: "pot", time: 290, duration: 90, label: "Cook tomato down" },
    {
      id: "p4",
      lane: "pot",
      time: 395,
      duration: 45,
      label: "Tip lentils + water",
    },
    {
      id: "p5",
      lane: "pot",
      time: 450,
      duration: 210,
      label: "Simmer until soft",
    },
    { id: "p6", lane: "pot", time: 670, duration: 50, label: "Stir & check" },

    // Finish — plating at a calm pace
    { id: "f1", lane: "finish", time: 660, duration: 35, label: "Splash coconut" },
    { id: "f2", lane: "finish", time: 705, duration: 30, label: "Salt to taste" },
    { id: "f3", lane: "finish", time: 740, duration: 40, label: "Fluff rice" },
    { id: "f4", lane: "finish", time: 785, duration: 55, label: "Ladle & plate" },
  ],
};

export const RECIPES: Recipe[] = [GARLIC_OIL_TOAST, LENTIL_CURRY];

export const INITIATION_RECIPE = GARLIC_OIL_TOAST;
export const DEMO_RECIPE = LENTIL_CURRY;

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
