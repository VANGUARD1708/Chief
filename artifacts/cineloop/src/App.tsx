import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { UserDataProvider } from "@/contexts/user-data-context";
import NotFound from "@/pages/not-found";

import FeedPage from "@/pages/feed";
import TrendingPage from "@/pages/trending";
import DiscoverPage from "@/pages/discover";
import LeaderboardPage from "@/pages/leaderboard";
import ProfilePage from "@/pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={FeedPage} />
        <Route path="/trending" component={TrendingPage} />
        <Route path="/discover" component={DiscoverPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserDataProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </UserDataProvider>
    </QueryClientProvider>
  );
}

export default App;
