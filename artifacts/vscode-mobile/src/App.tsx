import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorPage } from "@/pages/Editor";
import { LoginPage } from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Zap } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AuthGate() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="min-h-dvh w-screen bg-[hsl(220,13%,10%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <Zap size={24} className="text-white" fill="white" />
          </div>
          <div className="text-slate-500 text-sm">Loading Su Zai Zai Code…</div>
        </div>
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return <LoginPage onGuest={auth.continueAsGuest} />;
  }

  return (
    <>
      <EditorPage authUser={auth.user} onSignOut={auth.signOutUser} />
      <PWAInstallPrompt />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthGate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
