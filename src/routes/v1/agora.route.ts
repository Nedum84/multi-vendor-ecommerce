import express from "express";
import agoraController from "../../controller/cart.controller";

const router = express.Router();

router.post("/generatetoken", agoraController.create);
export default router;
