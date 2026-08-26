import type { Metadata } from "next";
import LanesGame from "@/components/LanesGame";

export const metadata: Metadata = {
  title: "Play — Lanes Arcade Cook",
  description:
    "Guitar Hero–style cooking demo. Run a weeknight lentil curry through timed Board, Pot, and Finish lanes.",
};

export default function PlayPage() {
  return <LanesGame />;
}
