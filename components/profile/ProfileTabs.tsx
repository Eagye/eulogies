"use client";

import { useState, type ReactNode } from "react";

type TabId = "posts" | "about";

type ProfileTabsProps = {
  posts: ReactNode;
  about: ReactNode;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "about", label: "About" },
];

export default function ProfileTabs({ posts, about }: ProfileTabsProps) {
  const [active, setActive] = useState<TabId>("posts");

  return (
    <div>
      <nav
        className="flex border-b border-gray-200/80"
        aria-label="Profile sections"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                selected
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 sm:p-5" role="tabpanel">
        {active === "posts" ? posts : about}
      </div>
    </div>
  );
}
