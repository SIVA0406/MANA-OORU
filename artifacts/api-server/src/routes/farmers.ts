import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, farmersTable } from "@workspace/db";
import {
  CreateFarmerBody,
  UpdateFarmerBody,
  GetFarmerParams,
  UpdateFarmerParams,
  DeleteFarmerParams,
  UpdatePaymentStatusParams,
  UpdatePaymentStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeFarmer(f: typeof farmersTable.$inferSelect) {
  return {
    ...f,
    paymentStatus: f.paymentStatus as "Pending" | "Completed",
    mediaUrls: f.mediaUrls ?? [],
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/farmers", async (_req, res): Promise<void> => {
  const farmers = await db.select().from(farmersTable).orderBy(farmersTable.createdAt);
  res.json(farmers.map(serializeFarmer));
});

router.post("/farmers", async (req, res): Promise<void> => {
  const parsed = CreateFarmerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [farmer] = await db.insert(farmersTable).values({
    name: parsed.data.name,
    village: parsed.data.village,
    crop: parsed.data.crop,
    quantity: parsed.data.quantity,
    moisture: parsed.data.moisture,
    bankAccount: parsed.data.bankAccount,
    paymentStatus: "Pending",
    cropGrade: parsed.data.cropGrade ?? null,
    harvestDate: parsed.data.harvestDate ?? null,
    notes: parsed.data.notes ?? null,
    profilePhotoUrl: parsed.data.profilePhotoUrl ?? null,
    mediaUrls: parsed.data.mediaUrls ?? [],
    cropStatus: parsed.data.cropStatus ?? null,
  }).returning();

  res.status(201).json(serializeFarmer(farmer));
});

router.get("/farmers/:id", async (req, res): Promise<void> => {
  const params = GetFarmerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [farmer] = await db.select().from(farmersTable).where(eq(farmersTable.id, params.data.id));

  if (!farmer) {
    res.status(404).json({ error: "Farmer not found" });
    return;
  }

  res.json(serializeFarmer(farmer));
});

router.patch("/farmers/:id", async (req, res): Promise<void> => {
  const params = UpdateFarmerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFarmerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof farmersTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.village !== undefined) updateData.village = parsed.data.village;
  if (parsed.data.crop !== undefined) updateData.crop = parsed.data.crop;
  if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
  if (parsed.data.moisture !== undefined) updateData.moisture = parsed.data.moisture;
  if (parsed.data.bankAccount !== undefined) updateData.bankAccount = parsed.data.bankAccount;
  if (parsed.data.cropGrade !== undefined) updateData.cropGrade = parsed.data.cropGrade;
  if (parsed.data.harvestDate !== undefined) updateData.harvestDate = parsed.data.harvestDate;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.profilePhotoUrl !== undefined) updateData.profilePhotoUrl = parsed.data.profilePhotoUrl;
  if (parsed.data.mediaUrls !== undefined) updateData.mediaUrls = parsed.data.mediaUrls;
  if (parsed.data.cropStatus !== undefined) updateData.cropStatus = parsed.data.cropStatus;

  const [farmer] = await db.update(farmersTable).set(updateData).where(eq(farmersTable.id, params.data.id)).returning();

  if (!farmer) {
    res.status(404).json({ error: "Farmer not found" });
    return;
  }

  res.json(serializeFarmer(farmer));
});

router.delete("/farmers/:id", async (req, res): Promise<void> => {
  const params = DeleteFarmerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [farmer] = await db.delete(farmersTable).where(eq(farmersTable.id, params.data.id)).returning();

  if (!farmer) {
    res.status(404).json({ error: "Farmer not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/farmers/:id/payment", async (req, res): Promise<void> => {
  const params = UpdatePaymentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePaymentStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [farmer] = await db
    .update(farmersTable)
    .set({ paymentStatus: parsed.data.paymentStatus })
    .where(eq(farmersTable.id, params.data.id))
    .returning();

  if (!farmer) {
    res.status(404).json({ error: "Farmer not found" });
    return;
  }

  res.json(serializeFarmer(farmer));
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const farmers = await db.select().from(farmersTable);

  const totalFarmers = farmers.length;
  const totalQuantity = farmers.reduce((sum, f) => sum + f.quantity, 0);
  const pendingPayments = farmers.filter((f) => f.paymentStatus === "Pending").length;
  const completedPayments = farmers.filter((f) => f.paymentStatus === "Completed").length;
  const villages = [...new Set(farmers.map((f) => f.village))];
  const crops = [...new Set(farmers.map((f) => f.crop))];

  res.json({ totalFarmers, totalQuantity, pendingPayments, completedPayments, villages, crops });
});

export default router;
