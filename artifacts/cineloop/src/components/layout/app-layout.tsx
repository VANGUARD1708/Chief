import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, TrendingUp, Compass, User, Trophy, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/trending", icon: TrendingUp, label: "Trending" },
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-black text-foreground overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <Film className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold tracking-tighter text-primary">CINELOOP</span>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-[inset_0_0_0_1px_rgba(244,62,92,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-all", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="text-base">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[100dvh] relative flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 z-50 absolute top-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Film className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tighter text-primary drop-shadow-md">CINELOOP</span>
          </div>
        </header>

        <div className="flex-1 h-full relative z-0 overflow-hidden bg-black">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/85 backdrop-blur-xl border-t border-white/10 z-50 px-2 py-2 pb-safe">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 group min-w-0 flex-1"
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary scale-110"
                    : "text-muted-foreground group-active:scale-95"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-all",
                    isActive && "drop-shadow-[0_0_6px_rgba(244,62,92,0.7)]"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
