"use client";

import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Rocket,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  Menu,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState, useEffect, useContext, createContext, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/student-reports", label: "Student Reports", icon: Users },
  { href: "/test-reports", label: "Test Reports", icon: FileText },
  { href: "/batch-reports", label: "Batch Reports", icon: Layers },
  { href: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function SidebarNav({
  isCollapsed,
  onLinkClick,
  collegeName,
  collegeLogo,
  username,
}: {
  isCollapsed: boolean;
  onLinkClick?: () => void;
  collegeName: string;
  collegeLogo: string;
  username: string;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* Top section: Logo + College Name */}
      <div className="flex items-center gap-2 pb-6">
        {collegeLogo && !logoError ? (
          <img
            src={collegeLogo}
            alt="College Logo"
            className="h-10 w-10 rounded-lg object-contain bg-white p-1 border"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="h-6 w-6" />
          </div>
        )}
        <h1
          className={cn(
            "font-headline text-sm font-bold transition-opacity",
            isCollapsed && "opacity-0"
          )}
        >
          {collegeName}
        </h1>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href} onClick={onLinkClick}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
            >
              <item.icon className="h-5 w-5" />
              <span
                className={cn(
                  "transition-opacity",
                  isCollapsed && "sr-only"
                )}
              >
                {item.label}
              </span>
            </Button>
          </Link>
        ))}
      </nav>

      {/* Bottom: Username + Logout */}
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 border-t pt-4">
          <div
            className={cn(
              "flex flex-col transition-opacity",
              isCollapsed && "sr-only"
            )}
          >
            <span className="text-sm font-medium">{username}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full justify-start gap-3"
          >
            <LogOut className="h-5 w-5" />
            <span
              className={cn(
                "transition-opacity",
                isCollapsed && "sr-only"
              )}
            >
              Logout
            </span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

const SidebarContext = createContext<
  | {
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
  }
  | undefined
>(undefined);

export function AppSidebar({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [collegeName, setCollegeName] = useState("");
  const [collegeLogo, setCollegeLogo] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("apex-login");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const user = Array.isArray(parsed) ? parsed[0] : parsed;

        setCollegeName(user.college_name || "");
        setCollegeLogo(user.college_logo || "");
        setUsername(user.Username || "");
      } catch (e) {
        console.error("Failed to parse apex-login:", e);
        setCollegeLogo(""); // fallback
      }
    }
  }, []);


  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 768px)");
    const handleResize = (e: MediaQueryListEvent) => {
      setIsCollapsed(e.matches);
    };
    setIsCollapsed(mobileMediaQuery.matches);
    mobileMediaQuery.addEventListener("change", handleResize);
    return () =>
      mobileMediaQuery.removeEventListener("change", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {/* Mobile Sidebar */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-4">
            <SidebarNav
              isCollapsed={false}
              onLinkClick={() => setIsMobileOpen(false)}
              collegeName={collegeName}
              collegeLogo={collegeLogo}
              username={username}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          {collegeLogo ? (
            <img
              src={collegeLogo}
              alt="College Logo"
              className="h-8 w-8 rounded bg-white object-contain p-1 border"
            />
          ) : (
            <Rocket className="h-5 w-5" />
          )}
          <h1 className="font-headline text-lg font-bold">CRT Reports</h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 hidden h-screen flex-col border-r bg-card p-4 transition-all duration-300 ease-in-out md:flex",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-5 top-9 h-10 w-10 rounded-full border bg-card hover:bg-secondary"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </Button>

        <SidebarNav
          isCollapsed={isCollapsed}
          collegeName={collegeName}
          collegeLogo={collegeLogo}
          username={username}
        />
      </aside>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error(
      "useSidebar must be used within a an AppSidebar provider"
    );
  }
  return context;
};