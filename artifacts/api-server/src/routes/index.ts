import { Router, type IRouter } from "express";
import healthRouter from "./health";
import farmersRouter from "./farmers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(farmersRouter);

export default router;
