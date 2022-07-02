import express from "express";
import { refreshVariables } from "./refresh.variables";
import { generateBodyPayload } from "./generate.body.payload";

const router = express.Router();

router.post("/generate-body", generateBodyPayload);
router.post("/refresh", refreshVariables);

export default router;
