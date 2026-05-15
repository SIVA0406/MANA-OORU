import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateFarmer,
  useListFarmers,
  getListFarmersQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import type { FarmerInputCropStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Camera, Video, X, Plus, CheckCircle2, Wheat, ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useBuyerProfile } from "@/lib/buyer-profile";
import { motion, AnimatePresence } from "framer-motion";

const submitSchema = z.object({
  crop: z.string().min(1),
  quantity: z.coerce.number().min(0.1),
  moisture: z.string().min(1),
  village: z.string().min(1),
  bankAccount: z.string().min(5),
  ifscCode: z.string().optional(),
  cropGrade: z.string().optional(),
  harvestDate: z.string().optional(),
  notes: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  cropStatus: z.string().optional(),
});

type SubmitFormValues = z.infer<typeof submitSchema>;

function isVideoPath(path: string) {
  return /\.(mp4|mov|avi|webm|mkv)$/i.test(path) || path.includes("video");
}

function MediaUploadSection({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
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
        const { uploadURL, objectPath } = await res.json();
        await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
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

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((path) => (
        <div key={path} className="relative group w-16 h-16 shrink-0">
          {isVideoPath(path) ? (
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
              <Video className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : (
            <img src={`/api/storage${path}`} alt="" className="w-16 h-16 object-cover rounded-lg border" />
          )}
          <button
            type="button"
            onClick={() => onChange(value.filter((p) => p !== path))}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted/30 transition-colors text-muted-foreground shrink-0"
      >
        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[9px]">{uploadingCount}</span></> : <><Camera className="w-4 h-4" /><span className="text-[9px]">Photo</span></>}
      </button>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
    </div>
  );
}

export default function FarmerSubmitPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { profile } = useBuyerProfile();
  const queryClient = useQueryClient();
  const createFarmer = useCreateFarmer();
  const { data: mySubmissions } = useListFarmers();
  const [submitted, setSubmitted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const myRecords = mySubmissions?.filter((f) => f.name === profile?.name) ?? [];

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      crop: "Paddy",
      quantity: 0,
      moisture: "",
      village: profile?.village ?? "",
      bankAccount: profile?.bankAccount ?? "",
      ifscCode: (profile as { ifscCode?: string })?.ifscCode ?? "",
      cropGrade: "",
      harvestDate: "",
      notes: "",
      mediaUrls: [],
      cropStatus: "",
    },
  });

  const onSubmit = (values: SubmitFormValues) => {
    createFarmer.mutate(
      {
        data: {
          name: profile?.name ?? "Farmer",
          village: values.village,
          crop: values.crop,
          quantity: values.quantity,
          moisture: values.moisture,
          bankAccount: values.bankAccount,
          cropGrade: values.cropGrade || undefined,
          harvestDate: values.harvestDate || undefined,
          notes: values.notes || undefined,
          profilePhotoUrl: profile?.photoUrl || undefined,
          mediaUrls: values.mediaUrls ?? [],
          cropStatus: (values.cropStatus || undefined) as FarmerInputCropStatus | undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFarmersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: t.cropSubmitted, description: t.cropSubmittedDesc });
          setSubmitted(true);
          setIsFormOpen(false);
          form.reset();
          setTimeout(() => setSubmitted(false), 4000);
        },
        onError: () => {
          toast({ title: t.toastError, description: t.toastSaveFailed, variant: "destructive" });
        },
      }
    );
  };

  const getCropStatusStyle = (status: string | null | undefined) => {
    switch (status) {
      case "On Hold": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Partially Sold": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fully Sold": return "bg-green-100 text-green-800 border-green-200";
      case "Sold Out": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-muted text-muted-foreground border-transparent";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          {profile?.photoUrl ? (
            <img src={`/api/storage${profile.photoUrl}`} alt={profile.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/40 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-2xl font-bold">
              {profile?.name?.charAt(0).toUpperCase() ?? "F"}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{t.farmerWelcome}, {profile?.name ?? t.roleFarmer}!</h1>
            <p className="text-green-100 text-sm mt-0.5">{t.farmerSubmitSubtitle}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-800 text-sm">{t.cropSubmitted}</p>
              <p className="text-green-700 text-xs">{t.cropSubmittedDesc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border rounded-xl shadow-sm p-4">
        {!isFormOpen ? (
          <Button onClick={() => setIsFormOpen(true)} size="lg" className="w-full bg-green-700 hover:bg-green-800 font-semibold">
            <Plus className="w-5 h-5 mr-2" />
            {t.submitCrop}
          </Button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-base">{t.submitCropTitle}</h2>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="crop" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t.fieldCrop} *</FormLabel>
                      <FormControl><Input {...field} placeholder="Paddy" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t.fieldQuantity} *</FormLabel>
                      <FormControl><Input type="number" step="0.1" min="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="moisture" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t.fieldMoisture} *</FormLabel>
                      <FormControl><Input {...field} placeholder="14%" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="village" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t.fieldVillage} *</FormLabel>
                      <FormControl><Input {...field} placeholder="Kondapur" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="cropGrade" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t.fieldCropGrade}</FormLabel>
                      <FormControl><Input {...field} value={field.value ?? ""} placeholder="A, B..." /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="harvestDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t.fieldHarvestDate}</FormLabel>
                      <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="cropStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t.cropStatusLabel}</FormLabel>
                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t.cropStatusNone} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t.cropStatusNone}</SelectItem>
                        <SelectItem value="On Hold">{t.cropStatusOnHold}</SelectItem>
                        <SelectItem value="Partially Sold">{t.cropStatusPartiallySold}</SelectItem>
                        <SelectItem value="Fully Sold">{t.cropStatusFullySold}</SelectItem>
                        <SelectItem value="Sold Out">{t.cropStatusSoldOut}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="bankAccount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t.bankAccountNumber}</FormLabel>
                    <FormControl><Input {...field} inputMode="numeric" className="font-mono" placeholder="12345678901" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t.fieldNotes}</FormLabel>
                    <FormControl><Textarea {...field} value={field.value ?? ""} rows={2} className="resize-none" placeholder={t.notesPlaceholder} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="mediaUrls" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t.fieldMedia}</FormLabel>
                    <FormControl>
                      <MediaUploadSection value={field.value ?? []} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">{t.back}</Button>
                  <Button type="submit" disabled={createFarmer.isPending} className="flex-1 bg-green-700 hover:bg-green-800">
                    {createFarmer.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wheat className="w-4 h-4 mr-2" />}
                    {t.submitCropBtn}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>

      {myRecords.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-base text-foreground">{t.mySubmissions} ({myRecords.length})</h2>
          {myRecords.map((r) => (
            <div key={r.id} className="bg-card border rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Wheat className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{r.crop} — {r.quantity} {t.qt}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.village} {r.harvestDate ? `· ${r.harvestDate}` : ""}</div>
                  {r.mediaUrls?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <ImageIcon className="w-3 h-3" />
                      <span>{r.mediaUrls.length} media</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge variant={r.paymentStatus === "Completed" ? "default" : "secondary"} className={r.paymentStatus === "Completed" ? "bg-green-600 text-white text-[10px]" : "bg-amber-100 text-amber-800 border-transparent text-[10px]"}>
                  {r.paymentStatus === "Completed" ? t.completed : t.pending}
                </Badge>
                {r.cropStatus && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${r.paymentStatus === "Completed" ? "bg-green-100 text-green-800 border-green-200" : r.cropStatus === "On Hold" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : r.cropStatus === "Partially Sold" ? "bg-blue-100 text-blue-800 border-blue-200" : r.cropStatus === "Sold Out" ? "bg-gray-100 text-gray-600 border-gray-200" : "bg-muted text-muted-foreground"}`}>
                    {r.cropStatus}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
