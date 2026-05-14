import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Trash2, CheckCircle2, CircleDashed, Plus, Edit,
  Users, Wheat, IndianRupee, Camera, Video, X, ImageIcon, Loader2, UserCircle2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/language";

const farmerSchema = z.object({
  name: z.string().min(1),
  village: z.string().min(1),
  crop: z.string().min(1),
  quantity: z.coerce.number().min(0.1),
  moisture: z.string().min(1),
  bankAccount: z.string().min(5),
  cropGrade: z.string().optional(),
  harvestDate: z.string().optional(),
  notes: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

type FarmerFormValues = z.infer<typeof farmerSchema>;

function isVideoPath(path: string) {
  return /\.(mp4|mov|avi|webm|mkv)$/i.test(path) || path.includes("video");
}

function MediaPreview({ objectPath, className = "" }: { objectPath: string; className?: string }) {
  const src = `/api/storage${objectPath}`;
  if (isVideoPath(objectPath)) {
    return (
      <video
        src={src}
        className={`object-cover rounded ${className}`}
        muted
        preload="metadata"
      />
    );
  }
  return (
    <img
      src={src}
      alt="crop photo"
      className={`object-cover rounded ${className}`}
      loading="lazy"
    />
  );
}

function MediaUploadSection({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    setUploadingCount(files.length);
    const newPaths: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const res = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
        });
        if (!res.ok) throw new Error("Failed to get upload URL");
        const { uploadURL, objectPath } = await res.json();

        const putRes = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!putRes.ok) throw new Error("Upload failed");

        newPaths.push(objectPath as string);
      } catch {
        toast({ title: t.toastError, description: t.toastUploadFailed, variant: "destructive" });
      }
    }

    onChange([...value, ...newPaths]);
    setUploading(false);
    setUploadingCount(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeMedia = (path: string) => {
    onChange(value.filter((p) => p !== path));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((path) => (
          <div key={path} className="relative group w-20 h-20 shrink-0">
            <MediaPreview objectPath={path} className="w-20 h-20" />
            {isVideoPath(path) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                <Video className="w-6 h-6 text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={() => removeMedia(path)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted/30 transition-colors text-muted-foreground shrink-0"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[10px]">{uploadingCount}</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span className="text-[10px] text-center leading-tight px-1">{t.uploadMedia}</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}

function FarmerPhotoUpload({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (url: string | null) => void;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ? `/api/storage${value}` : null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await res.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      onChange(objectPath as string);
    } catch {
      toast({ title: t.toastError, description: t.toastUploadFailed, variant: "destructive" });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-primary/40 hover:border-primary transition-colors bg-muted flex items-center justify-center group shrink-0"
      >
        {preview ? (
          <img src={preview} alt="farmer" className="w-full h-full object-cover" />
        ) : (
          <UserCircle2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        <div className="absolute bottom-0 right-0 bg-primary rounded-full p-0.5">
          <Camera className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
      </button>
      <div className="flex-1">
        <p className="text-xs font-medium text-foreground">{t.fieldFarmerPhoto}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t.farmerPhotoHint}</p>
        {preview && (
          <button
            type="button"
            onClick={() => { setPreview(null); onChange(""); }}
            className="text-xs text-destructive hover:underline mt-1"
          >
            {t.removeMedia}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

function FarmerFormFields({
  form,
  isCreate = false,
}: {
  form: ReturnType<typeof useForm<FarmerFormValues>>;
  isCreate?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 py-4">
      <FormField control={form.control} name="profilePhotoUrl" render={({ field }) => (
        <FormItem>
          <FormControl>
            <FarmerPhotoUpload
              value={field.value}
              onChange={(url) => field.onChange(url ?? "")}
            />
          </FormControl>
        </FormItem>
      )} />

      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldFarmerName}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={isCreate ? "Ramu" : undefined} data-testid={isCreate ? "input-name" : "input-edit-name"} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="village" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldVillage}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={isCreate ? "Kondapur" : undefined} data-testid={isCreate ? "input-village" : "input-edit-village"} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="crop" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldCrop}</FormLabel>
            <FormControl>
              <Input {...field} data-testid={isCreate ? "input-crop" : "input-edit-crop"} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="quantity" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldQuantity}</FormLabel>
            <FormControl>
              <Input type="number" step="0.1" {...field} data-testid={isCreate ? "input-quantity" : "input-edit-quantity"} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="moisture" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldMoisture}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={isCreate ? "14%" : undefined} data-testid={isCreate ? "input-moisture" : "input-edit-moisture"} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="bankAccount" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldBankAccount}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={isCreate ? "XXXX 1234" : undefined} data-testid={isCreate ? "input-bank" : "input-edit-bank"} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="cropGrade" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldCropGrade}</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} placeholder={t.cropGradePlaceholder} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="harvestDate" render={({ field }) => (
          <FormItem>
            <FormLabel>{t.fieldHarvestDate}</FormLabel>
            <FormControl>
              <Input type="date" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <FormField control={form.control} name="notes" render={({ field }) => (
        <FormItem>
          <FormLabel>{t.fieldNotes}</FormLabel>
          <FormControl>
            <Textarea {...field} value={field.value ?? ""} placeholder={t.notesPlaceholder} rows={2} className="resize-none" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="mediaUrls" render={({ field }) => (
        <FormItem>
          <FormLabel>{t.fieldMedia}</FormLabel>
          <FormControl>
            <MediaUploadSection
              value={field.value ?? []}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
}

function EditFarmerDialog({ id, open, onOpenChange }: { id: number | null; open: boolean; onOpenChange: (open: boolean) => void }) {
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

  const form = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "", village: "", crop: "Paddy", quantity: 0,
      moisture: "", bankAccount: "", cropGrade: "", harvestDate: "", notes: "", profilePhotoUrl: "", mediaUrls: [],
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
        cropGrade: farmer.cropGrade ?? "",
        harvestDate: farmer.harvestDate ?? "",
        notes: farmer.notes ?? "",
        profilePhotoUrl: farmer.profilePhotoUrl ?? "",
        mediaUrls: farmer.mediaUrls ?? [],
      });
    }
  }, [farmer, form, open]);

  const onSubmit = (values: FarmerFormValues) => {
    if (!id) return;
    updateFarmer.mutate(
      {
        id, data: {
          ...values,
          cropGrade: values.cropGrade || undefined,
          harvestDate: values.harvestDate || undefined,
          notes: values.notes || undefined,
          mediaUrls: values.mediaUrls ?? [],
        }
      },
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
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FarmerFormFields form={form} />
              <div className="pt-2 flex justify-end">
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

function MediaViewDialog({ farmer, open, onOpenChange }: {
  farmer: { name: string; mediaUrls: string[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{farmer.name} — Media</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {farmer.mediaUrls.map((path) => (
            <a key={path} href={`/api/storage${path}`} target="_blank" rel="noreferrer" className="block">
              {isVideoPath(path) ? (
                <video
                  src={`/api/storage${path}`}
                  controls
                  className="w-full rounded-lg object-cover max-h-60"
                />
              ) : (
                <img
                  src={`/api/storage${path}`}
                  alt="crop"
                  className="w-full rounded-lg object-cover max-h-60"
                />
              )}
            </a>
          ))}
        </div>
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
  const [viewingMedia, setViewingMedia] = useState<{ name: string; mediaUrls: string[] } | null>(null);

  const createForm = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "", village: "", crop: "Paddy", quantity: 0,
      moisture: "", bankAccount: "", cropGrade: "", harvestDate: "", notes: "", profilePhotoUrl: "", mediaUrls: [],
    },
  });

  const onCreateSubmit = (values: FarmerFormValues) => {
    createFarmer.mutate(
      {
        data: {
          ...values,
          cropGrade: values.cropGrade || undefined,
          harvestDate: values.harvestDate || undefined,
          notes: values.notes || undefined,
          profilePhotoUrl: values.profilePhotoUrl || undefined,
          mediaUrls: values.mediaUrls ?? [],
        }
      },
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
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.newRecord}</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
                <FarmerFormFields form={createForm} isCreate />
                <div className="pt-2 flex justify-end">
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
              {farmers.map((farmer) => {
                const hasMedia = farmer.mediaUrls && farmer.mediaUrls.length > 0;
                const imageUrls = (farmer.mediaUrls ?? []).filter((p) => !isVideoPath(p));
                const videoUrls = (farmer.mediaUrls ?? []).filter((p) => isVideoPath(p));

                return (
                  <TableRow key={farmer.id} data-testid={`row-farmer-${farmer.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {farmer.profilePhotoUrl ? (
                          <img
                            src={`/api/storage${farmer.profilePhotoUrl}`}
                            alt={farmer.name}
                            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">
                              {farmer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-card-foreground">{farmer.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{t.idLabel} {farmer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{farmer.village}</div>
                      {farmer.harvestDate && (
                        <div className="text-xs text-muted-foreground mt-1">{farmer.harvestDate}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{farmer.quantity} {t.qt}</div>
                      <div className="flex flex-wrap gap-2 items-center text-xs mt-1">
                        <span className="text-muted-foreground">{farmer.crop}</span>
                        <span className="text-muted-foreground">&middot;</span>
                        <span className="text-muted-foreground">{farmer.moisture} {t.moist}</span>
                        {farmer.cropGrade && (
                          <>
                            <span className="text-muted-foreground">&middot;</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {t.gradeLabel}: {farmer.cropGrade}
                            </Badge>
                          </>
                        )}
                      </div>
                      {farmer.notes && (
                        <div className="text-xs text-muted-foreground mt-1 italic line-clamp-1">{farmer.notes}</div>
                      )}
                      {hasMedia && (
                        <button
                          type="button"
                          onClick={() => setViewingMedia({ name: farmer.name, mediaUrls: farmer.mediaUrls ?? [] })}
                          className="flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
                        >
                          {imageUrls.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <ImageIcon className="w-3 h-3" />
                              {imageUrls.length}
                            </span>
                          )}
                          {videoUrls.length > 0 && (
                            <span className="flex items-center gap-0.5 ml-1">
                              <Video className="w-3 h-3" />
                              {videoUrls.length}
                            </span>
                          )}
                          <span className="ml-0.5">{t.viewMedia}</span>
                        </button>
                      )}
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
                );
              })}
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

      {viewingMedia && (
        <MediaViewDialog
          farmer={viewingMedia}
          open={!!viewingMedia}
          onOpenChange={(open) => !open && setViewingMedia(null)}
        />
      )}
    </div>
  );
}
