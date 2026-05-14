import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";
import FarmersPage from "@/pages/farmers";
import DashboardPage from "@/pages/dashboard";
import { LanguageProvider } from "@/lib/language";
import { BuyerProfileProvider, useBuyerProfile } from "@/lib/buyer-profile";
import { BuyerSetupModal } from "@/components/buyer-setup-modal";
import { WelcomeSplash } from "@/components/welcome-splash";
import { useState } from "react";

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
  const { isSetupDone } = useBuyerProfile();
  const [setupComplete, setSetupComplete] = useState(isSetupDone);
  const [splashDone, setSplashDone] = useState(false);

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

function App() {
  return (
    <LanguageProvider>
      <BuyerProfileProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppWithProfile />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </BuyerProfileProvider>
    </LanguageProvider>
  );
}

export default App;
