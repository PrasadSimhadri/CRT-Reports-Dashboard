"use client";

import { AppSidebar, useSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  return (
    <main
      className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
        "md:ml-64", // Default margin for expanded sidebar
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}
    >
      {children}
    </main>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <AppSidebar>
        <MainContent>{children}</MainContent>
      </AppSidebar>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/login");
    } else if (isAuthenticated === true) {
      setIsVerified(true);
    }
  }, [isAuthenticated, router]);

  if (!isVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-primary animate-pulse">
          <Rocket className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return <AppLayoutContent>{children}</AppLayoutContent>;
}
