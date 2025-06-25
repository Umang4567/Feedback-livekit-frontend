"use client";

import ThemeToggle from "@/lib/ThemeToggle";

export default function Header() {
  return (
    <div className="p-4 absolute top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img
            src={"/images/dark.svg"}
            alt="BuildFast Logo"
            className="dark:hidden"
            width={60}
            height={60}
          />
          <img
            src={"/images/logo.svg"}
            alt="BuildFast Logo"
            className="hidden dark:block"
            width={60}
            height={60}
          />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
