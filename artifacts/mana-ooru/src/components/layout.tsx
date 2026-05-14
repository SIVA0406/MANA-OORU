import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Sprout, Languages, Pencil, LogOut } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { useBuyerProfile } from "@/lib/buyer-profile";
import { useState } from "react";
import { BuyerSetupModal } from "@/components/buyer-setup-modal";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t, toggleLanguage } = useLanguage();
  const { profile } = useBuyerProfile();
  const { logout } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="p-4 flex items-center border-b border-border">
            <div className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground w-full px-2">
              <Sprout className="w-6 h-6 text-primary" />
              <span>{t.appName}</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/" || location === "/farmers"}
                  className="font-medium"
                >
                  <Link href="/" data-testid="link-farmers">
                    <Users className="w-5 h-5" />
                    <span>{t.navProcurement}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard"}
                  className="font-medium"
                >
                  <Link href="/dashboard" data-testid="link-dashboard">
                    <LayoutDashboard className="w-5 h-5" />
                    <span>{t.navDashboard}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border space-y-2">
            {profile && (
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
              >
                {profile.photoUrl ? (
                  <img
                    src={`/api/storage${profile.photoUrl}`}
                    alt={profile.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-primary/30 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-muted-foreground leading-none">{t.welcomeBack}</p>
                  <p className="text-sm font-semibold text-sidebar-foreground truncate mt-0.5">{profile.name}</p>
                </div>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start gap-2 font-medium text-sm"
              onClick={toggleLanguage}
              data-testid="button-toggle-language"
            >
              <Languages className="w-4 h-4" />
              {t.langToggle}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 font-medium text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col bg-background relative overflow-hidden">
          <header className="h-16 flex items-center px-6 border-b bg-card border-border gap-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="font-semibold text-lg ml-2">{t.appSubtitle}</div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>

      {editingProfile && (
        <BuyerSetupModal onDone={() => setEditingProfile(false)} />
      )}
    </SidebarProvider>
  );
}
