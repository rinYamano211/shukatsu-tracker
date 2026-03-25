"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-200 px-3 md:px-6 py-3 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        
        <h1 className="font-bold text-sm md:text-lg text-gray-900">
          ShukatsuTracker
        </h1>

        <nav className="flex gap-1 md:gap-2">
          <Link
            href="/"
            className={`px-2 md:px-3 py-1.5 md:py-1 rounded-md text-xs md:text-sm ${
              pathname === "/"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            企業
          </Link>

          <Link
            href="/schedule"
            className={`px-2 md:px-3 py-1.5 md:py-1 rounded-md text-xs md:text-sm ${
              pathname === "/schedule"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            予定
          </Link>
        </nav>

      </div>
    </header>
  );
}