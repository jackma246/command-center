"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/trading", label: "Trading", icon: "📈" },
  { href: "/study", label: "Study Plan", icon: "📚" },
  { href: "/ideas", label: "Ideas", icon: "💡" },
  { href: "/costs", label: "API Costs", icon: "💰" },
  { href: "/today", label: "Today", icon: "✅" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">🦞 Jack & Clack</h1>
        <p className="text-sm text-gray-500">Command Center</p>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-500">
          <p>💪 $550k target</p>
          <p>📅 March 2026</p>
        </div>
      </div>
    </aside>
  );
}
