import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "destructive";
  className?: string;
}

export function StatCard({ title, value, icon: Icon, variant = "default", className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 border-0 border-t-4",
        className
      )}
      style={{ borderTopWidth: "4px", borderTopColor: "#1976d2", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }} // #2196f3 is blue-500
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={cn(
            "h-4 w-4 text-muted-foreground",
            variant === "destructive" && "text-destructive"
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
