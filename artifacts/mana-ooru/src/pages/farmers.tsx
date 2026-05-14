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
import type { FarmerInput, PaymentStatusUpdate, FarmerUpdate } from "@workspace/api-client-react/src/generated/api.schemas";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, CheckCircle2, CircleDashed, Plus, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const farmerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  village: z.string().min(1, "Village is required"),
  crop: z.string().min(1, "Crop is required"),
  quantity: z.coerce.number().min(0.1, "Quantity must be greater than 0"),
  moisture: z.string().min(1, "Moisture % is required"),
  bankAccount: z.string().min(5, "Bank account is required"),
});

function EditFarmerDialog({ id, open, onOpenChange }: { id: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateFarmer = useUpdateFarmer();
  
  const { data: farmer, isLoading } = useGetFarmer(id ?? 0, {
    query: {
      enabled: !!id,
      queryKey: id ? getGetFarmerQueryKey(id) : ["farmer", 0]
    }
  });

  const form = useForm<z.infer<typeof farmerSchema>>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "",
      village: "",
      crop: "Paddy",
      quantity: 0,
      moisture: "",
      bankAccount: "",
    },
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
          toast({ title: "Record updated" });
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update record.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Procurement Record</DialogTitle>
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farmer Name</FormLabel>
                      <FormControl><Input {...field} data-testid="input-edit-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <FormControl><Input {...field} data-testid="input-edit-village" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop</FormLabel>
                      <FormControl><Input {...field} data-testid="input-edit-crop" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (Quintals)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} data-testid="input-edit-quantity" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="moisture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moisture %</FormLabel>
                      <FormControl><Input {...field} data-testid="input-edit-moisture" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account</FormLabel>
                      <FormControl><Input {...field} data-testid="input-edit-bank" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={updateFarmer.isPending} data-testid="button-submit-edit-farmer">
                  {updateFarmer.isPending ? "Saving..." : "Update Record"}
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
  const { data: farmers, isLoading } = useListFarmers();
  const createFarmer = useCreateFarmer();
  const deleteFarmer = useDeleteFarmer();
  const updatePayment = useUpdatePaymentStatus();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createForm = useForm<z.infer<typeof farmerSchema>>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "",
      village: "",
      crop: "Paddy",
      quantity: 0,
      moisture: "",
      bankAccount: "",
    },
  });

  const onCreateSubmit = (values: z.infer<typeof farmerSchema>) => {
    createFarmer.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Farmer recorded", description: "The procurement record has been saved." });
          setIsCreateOpen(false);
          createForm.reset();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save farmer record.", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteFarmer.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast({ title: "Record deleted" });
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
          toast({ title: "Payment status updated" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground">Procurement Register</h1>
          <p className="text-muted-foreground mt-1">Manage and track daily crop procurement from village farmers.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-farmer" size="lg" className="font-semibold shadow-sm">
              <Plus className="mr-2 h-5 w-5" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>New Procurement Record</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farmer Name</FormLabel>
                        <FormControl><Input {...field} data-testid="input-name" placeholder="Ramu" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="village"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village</FormLabel>
                        <FormControl><Input {...field} data-testid="input-village" placeholder="Kondapur" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="crop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop</FormLabel>
                        <FormControl><Input {...field} data-testid="input-crop" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (Quintals)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} data-testid="input-quantity" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="moisture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moisture %</FormLabel>
                        <FormControl><Input {...field} data-testid="input-moisture" placeholder="14%" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account</FormLabel>
                        <FormControl><Input {...field} data-testid="input-bank" placeholder="XXXX 1234" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createFarmer.isPending} data-testid="button-submit-farmer">
                    {createFarmer.isPending ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                <TableHead>Farmer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Crop Detail</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id} data-testid={`row-farmer-${farmer.id}`}>
                  <TableCell>
                    <div className="font-semibold text-card-foreground">{farmer.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">ID: {farmer.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{farmer.village}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{farmer.quantity} Qt</div>
                    <div className="flex gap-2 items-center text-xs mt-1">
                      <span className="text-muted-foreground">{farmer.crop}</span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span className="text-muted-foreground">{farmer.moisture} Moist.</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge 
                        variant={farmer.paymentStatus === "Completed" ? "default" : "secondary"}
                        className={farmer.paymentStatus === "Completed" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent"}
                      >
                        {farmer.paymentStatus}
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
                        title="Toggle Payment Status"
                      >
                        {farmer.paymentStatus === "Pending" ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <CircleDashed className="w-4 h-4 mr-1" />}
                        {farmer.paymentStatus === "Pending" ? "Pay" : "Revert"}
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
            <h3 className="text-lg font-medium text-foreground mb-1">No records yet</h3>
            <p>Add a farmer to start tracking procurement.</p>
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
