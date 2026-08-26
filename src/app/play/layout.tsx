import type { ReactNode } from "react";

export default function PlayLayout({ children }: { children: ReactNode }) {
  return <div className="arcade-page">{children}</div>;
}
