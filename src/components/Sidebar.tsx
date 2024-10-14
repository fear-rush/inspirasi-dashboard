"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Map, House, Sun, Earth } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const menuItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/earthquakemap", label: "Earthquake Map", icon: Map },
    {
      href: "/earthquakesigmap",
      label: "Earthquake Significance Map",
      icon: Earth,
    },
    { href: "/weather", label: "Weather Station", icon: Sun },
  ];

  const handleMenuItemClick = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  if (!isMounted) {
    return null; // or a loading placeholder
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-8">
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-2 text-left",
                    pathname === item.href && "bg-gray-100 font-semibold"
                  )}
                  onClick={() => handleMenuItemClick(item.href)}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10 relative">
          <div className="flex items-center px-4 py-3">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>
        <main className="p-4 h-[calc(100vh-4rem)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
