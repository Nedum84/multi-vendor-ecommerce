import express from "express";
import { productVariables } from "./product.variables";
import { allVariables } from "./all.variables";
import { generateBodyPayload } from "./generate.body.payload";

const router = express.Router();

router.post("/product", productVariables);
router.post("/generate-body", generateBodyPayload);
router.post("/", allVariables);

export default router;
