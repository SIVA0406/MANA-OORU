import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Wheat, IndianRupee, MapPin } from "lucide-react";

export default function DashboardPage() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Season procurement summary across all villages.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="stat-farmers">{summary.totalFarmers}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Wheat className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-quantity">{summary.totalQuantity} <span className="text-lg font-normal text-muted-foreground">Qt</span></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-green-600/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed Payments</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700" data-testid="stat-completed">{summary.completedPayments}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Pending Payments</CardTitle>
            <IndianRupee className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700" data-testid="stat-pending">{summary.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" /> 
              Villages Served
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.villages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.villages.map((v, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary-foreground text-sm font-medium rounded-md border border-secondary/20">
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No villages recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-muted-foreground" />
              Crops Handled
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.crops.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {summary.crops.map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary-foreground text-sm font-medium rounded-md border border-primary/20">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No crops recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
