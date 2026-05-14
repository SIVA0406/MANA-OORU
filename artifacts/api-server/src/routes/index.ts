import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import farmersRouter from "./farmers";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(farmersRouter);
router.use(storageRouter);

export default router;
