import type { Metadata } from "next";
import LanesGame from "@/components/LanesGame";

export const metadata: Metadata = {
  title: "Play — Lanes Arcade Cook",
  description:
    "Arcade cook demo. Warm up on garlic oil toast, then run a weeknight lentil curry through Board, Pot, and Finish lanes.",
};

export default function PlayPage() {
  return <LanesGame />;
}
