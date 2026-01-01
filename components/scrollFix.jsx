"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollFix() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, [pathname]);

  return null;
}
