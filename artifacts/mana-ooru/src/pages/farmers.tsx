import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  useListFarmers,
  useCreateFarmer,
  useDeleteFarmer,
  useUpdatePaymentStatus,
  useUpdateFarmer,
  useGetFarmer,
  getListFarmersQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetFarmerQueryKey
} from "@workspace/api-client-react";
import type { PaymentStatusUpdate } from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, CheckCircle2, CircleDashed, Plus, Edit, Users, Wheat, IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language";

const farmerSchema = z.object({
  name: z.string().min(1),
  village: z.string().min(1),
  crop: z.string().min(1),
  quantity: z.coerce.number().min(0.1),
  moisture: z.string().min(1),
  bankAccount: z.string().min(5),
});

function EditFarmerDialog({ id, open, onOpenChange }: { id: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const updateFarmer = useUpdateFarmer();

  const { data: farmer, isLoading } = useGetFarmer(id ?? 0, {
    query: {
      enabled: !!id,
      queryKey: id ? getGetFarmerQueryKey(id) : ["farmer", 0]
    }
  });

  const form = useForm<z.infer<typeof farmerSchema>>({
    resolver: zodResolver(farmerSchema),
    defaultValues: { name: "", village: "", crop: "Paddy", quantity: 0, moisture: "", bankAccount: "" },
  });

  useEffect(() => {
    if (farmer && open) {
      form.reset({
        name: farmer.name,
        village: farmer.village,
        crop: farmer.crop,
        quantity: farmer.quantity,
        moisture: farmer.moisture,
        bankAccount: farmer.bankAccount,
      });
    }
  }, [farmer, form, open]);

  const onSubmit = (values: z.infer<typeof farmerSchema>) => {
    if (!id) return;
    updateFarmer.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetFarmerQueryKey(id) });
          toast({ title: t.toastUpdated });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: t.toastError, description: t.toastUpdateFailed, variant: "destructive" });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.editRecord}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fieldFarmerName}</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="village" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fieldVillage}</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-village" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="crop" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fieldCrop}</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-crop" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fieldQuantity}</FormLabel>
                    <FormControl><Input type="number" step="0.1" {...field} data-testid="input-edit-quantity" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="moisture" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fieldMoisture}</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-moisture" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bankAccount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fieldBankAccount}</FormLabel>
                    <FormControl><Input {...field} data-testid="input-edit-bank" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={updateFarmer.isPending} data-testid="button-submit-edit-farmer">
                  {updateFarmer.isPending ? t.saving : t.updateRecord}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function FarmersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { data: farmers, isLoading } = useListFarmers();
  const createFarmer = useCreateFarmer();
  const deleteFarmer = useDeleteFarmer();
  const updatePayment = useUpdatePaymentStatus();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createForm = useForm<z.infer<typeof farmerSchema>>({
    resolver: zodResolver(farmerSchema),
    defaultValues: { name: "", village: "", crop: "Paddy", quantity: 0, moisture: "", bankAccount: "" },
  });

  const onCreateSubmit = (values: z.infer<typeof farmerSchema>) => {
    createFarmer.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: t.toastFarmerSaved, description: t.toastFarmerSavedDesc });
          setIsCreateOpen(false);
          createForm.reset();
        },
        onError: () => {
          toast({ title: t.toastError, description: t.toastSaveFailed, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm(t.confirmDelete)) {
      deleteFarmer.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast({ title: t.toastDeleted });
          }
        }
      );
    }
  };

  const handleTogglePayment = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    updatePayment.mutate(
      { id, data: { paymentStatus: newStatus as PaymentStatusUpdate["paymentStatus"] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: t.toastPaymentUpdated });
        }
      }
    );
  };

  const totalQuantity = farmers ? farmers.reduce((sum, f) => sum + f.quantity, 0) : 0;
  const totalFarmers = farmers ? farmers.length : 0;
  const pendingCount = farmers ? farmers.filter((f) => f.paymentStatus === "Pending").length : 0;
  const completedCount = farmers ? farmers.filter((f) => f.paymentStatus === "Completed").length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground">{t.procurementTitle}</h1>
          <p className="text-muted-foreground mt-1">{t.procurementSubtitle}</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-farmer" size="lg" className="font-semibold shadow-sm">
              <Plus className="mr-2 h-5 w-5" />
              {t.addRecord}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t.newRecord}</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={createForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fieldFarmerName}</FormLabel>
                      <FormControl><Input {...field} data-testid="input-name" placeholder="Ramu" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={createForm.control} name="village" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fieldVillage}</FormLabel>
                      <FormControl><Input {...field} data-testid="input-village" placeholder="Kondapur" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={createForm.control} name="crop" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fieldCrop}</FormLabel>
                      <FormControl><Input {...field} data-testid="input-crop" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={createForm.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fieldQuantity}</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} data-testid="input-quantity" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={createForm.control} name="moisture" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fieldMoisture}</FormLabel>
                      <FormControl><Input {...field} data-testid="input-moisture" placeholder="14%" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={createForm.control} name="bankAccount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fieldBankAccount}</FormLabel>
                      <FormControl><Input {...field} data-testid="input-bank" placeholder="XXXX 1234" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createFarmer.isPending} data-testid="button-submit-farmer">
                    {createFarmer.isPending ? t.saving : t.saveRecord}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center gap-3" data-testid="summary-farmers">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.summaryFarmers}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : totalFarmers}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center gap-3" data-testid="summary-quantity">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Wheat className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.summaryQuantity}</p>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalQuantity} <span className="text-sm font-normal text-muted-foreground">{t.qt}</span>
            </p>
          </div>
        </div>
        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center gap-3" data-testid="summary-pending">
          <div className="bg-amber-100 p-2 rounded-lg">
            <IndianRupee className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.summaryPending}</p>
            <p className="text-2xl font-bold text-amber-700">{isLoading ? "—" : pendingCount}</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl shadow-sm p-4 flex items-center gap-3" data-testid="summary-completed">
          <div className="bg-green-100 p-2 rounded-lg">
            <IndianRupee className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.summaryCompleted}</p>
            <p className="text-2xl font-bold text-green-700">{isLoading ? "—" : completedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : farmers && farmers.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t.colFarmer}</TableHead>
                <TableHead>{t.colLocation}</TableHead>
                <TableHead>{t.colCropDetail}</TableHead>
                <TableHead>{t.colPayment}</TableHead>
                <TableHead className="text-right">{t.colActions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id} data-testid={`row-farmer-${farmer.id}`}>
                  <TableCell>
                    <div className="font-semibold text-card-foreground">{farmer.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t.idLabel} {farmer.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{farmer.village}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{farmer.quantity} {t.qt}</div>
                    <div className="flex gap-2 items-center text-xs mt-1">
                      <span className="text-muted-foreground">{farmer.crop}</span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span className="text-muted-foreground">{farmer.moisture} {t.moist}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={farmer.paymentStatus === "Completed" ? "default" : "secondary"}
                        className={farmer.paymentStatus === "Completed" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent"}
                      >
                        {farmer.paymentStatus === "Completed" ? t.completed : t.pending}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{farmer.bankAccount}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={farmer.paymentStatus === "Pending" ? "text-green-600 border-green-200 hover:bg-green-50" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
                        onClick={() => handleTogglePayment(farmer.id, farmer.paymentStatus)}
                        data-testid={`button-toggle-payment-${farmer.id}`}
                      >
                        {farmer.paymentStatus === "Pending" ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <CircleDashed className="w-4 h-4 mr-1" />}
                        {farmer.paymentStatus === "Pending" ? t.pay : t.revert}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:bg-muted"
                        onClick={() => setEditingId(farmer.id)}
                        data-testid={`button-edit-farmer-${farmer.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(farmer.id)}
                        data-testid={`button-delete-farmer-${farmer.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-foreground mb-1">{t.noRecords}</h3>
            <p>{t.noRecordsHint}</p>
          </div>
        )}
      </div>

      <EditFarmerDialog
        id={editingId}
        open={editingId !== null}
        onOpenChange={(open) => !open && setEditingId(null)}
      />
    </div>
  );
}
