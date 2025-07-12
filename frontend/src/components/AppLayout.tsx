"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ModelSelector from "@/components/ModelSelector";
import { 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Menu,
  Settings,
  HelpCircle,
  Activity
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Activity",
    href: "/activity",
    icon: Activity,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

function SidebarContent({ className, isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-screen", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            S
          </div>
          {!isCollapsed && <span>Sgope</span>}
        </Link>
      </div>
      <div className="flex-1 flex flex-col">
        <nav className="grid gap-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mx-2 my-4 border-t" />
        <nav className="grid gap-1 p-2">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1" />
        {/* Model Selector at bottom of sidebar */}
        <div className="border-t p-2">
          <ModelSelector />
        </div>
      </div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {

  // Always show sidebar for all pages, including chat

  return (
    <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sticky Desktop Sidebar (SSR-safe) */}
      <aside className="hidden md:flex flex-col sticky top-0 h-screen border-r bg-muted/40 z-30">
        <SidebarContent />
      </aside>
      {/* Main Content Area (with header) */}
      <div className="flex flex-col h-screen">
      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
      </div>
    </div>
  );
}
