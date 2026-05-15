import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";
import FarmersPage from "@/pages/farmers";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import { LanguageProvider } from "@/lib/language";
import { BuyerProfileProvider, useBuyerProfile } from "@/lib/buyer-profile";
import { BuyerSetupModal } from "@/components/buyer-setup-modal";
import { WelcomeSplash } from "@/components/welcome-splash";
import { useAuth } from "@workspace/replit-auth-web";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={FarmersPage} />
        <Route path="/farmers" component={FarmersPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppWithProfile() {
  const { profile, isSetupDone } = useBuyerProfile();
  const [setupComplete, setSetupComplete] = useState(isSetupDone);
  const [splashDone, setSplashDone] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (profile && setupComplete) {
      if (profile.role === "buyer") {
        navigate("/dashboard");
      }
    }
  }, [setupComplete, profile]);

  if (!setupComplete) {
    return <BuyerSetupModal onDone={() => setSetupComplete(true)} />;
  }

  return (
    <>
      {!splashDone && <WelcomeSplash onDone={() => setSplashDone(true)} />}
      <Router />
    </>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-900">
        <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <BuyerProfileProvider>
      <AppWithProfile />
    </BuyerProfileProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthGate />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
