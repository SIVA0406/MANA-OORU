import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Wheat, IndianRupee, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useLocation } from "wouter";

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  valueColor,
  borderColor,
  bg,
  onClick,
  hint,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  valueColor: string;
  borderColor?: string;
  bg?: string;
  onClick?: () => void;
  hint?: string;
}) {
  return (
    <Card
      className={`shadow-sm ${borderColor ?? ""} ${bg ?? ""} ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${iconColor}`}>{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboardTitle}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t.dashboardTitle}</h1>
        <p className="text-muted-foreground">{t.dashboardSubtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.statFarmers}
          value={summary.totalFarmers}
          icon={Users}
          iconColor="text-primary"
          valueColor="text-primary"
          borderColor="border-primary/20"
          bg="bg-primary/5"
          hint={t.clickToView}
          onClick={() => navigate("/farmers?filter=all")}
        />
        <StatCard
          title={t.statQuantity}
          value={
            <span>
              {summary.totalQuantity}{" "}
              <span className="text-lg font-normal text-muted-foreground">{t.qt}</span>
            </span>
          }
          icon={Wheat}
          iconColor="text-amber-600"
          valueColor="text-foreground"
          onClick={() => navigate("/farmers?filter=all")}
          hint={t.clickToView}
        />
        <StatCard
          title={t.statCompleted}
          value={summary.completedPayments}
          icon={IndianRupee}
          iconColor="text-green-600"
          valueColor="text-green-700"
          borderColor="border-green-600/20"
          hint={t.clickToView}
          onClick={() => navigate("/farmers?filter=completed")}
        />
        <StatCard
          title={t.statPending}
          value={summary.pendingPayments}
          icon={IndianRupee}
          iconColor="text-amber-600"
          valueColor="text-amber-700"
          borderColor="border-amber-500/20"
          hint={t.clickToView}
          onClick={() => navigate("/farmers?filter=pending")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              {t.villagesServed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.villages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.villages.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/farmers?village=${encodeURIComponent(v)}`)}
                    className="px-3 py-1 bg-secondary/10 text-secondary-foreground text-sm font-medium rounded-md border border-secondary/20 hover:bg-secondary/20 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noVillages}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-muted-foreground" />
              {t.cropsHandled}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.crops.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.crops.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/farmers?crop=${encodeURIComponent(c)}`)}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-md border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noCrops}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
