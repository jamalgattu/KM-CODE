import { Router, type IRouter } from "express";
import healthRouter from "./health";
import filesRouter from "./files";
import executeRouter from "./execute";
import terminalRouter from "./terminal";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(filesRouter);
router.use(executeRouter);
router.use(terminalRouter);
router.use(seedRouter);

export default router;
