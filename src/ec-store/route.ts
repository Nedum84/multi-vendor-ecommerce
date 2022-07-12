import express from "express";
import storeController from "./controller";
import { requireAuth } from "../ec-middlewares/auth.middleware";
import { validateReq } from "../ec-middlewares/validate.req";
import storeValidation from "./validation";

const router = express.Router();

router.get("/", validateReq(storeValidation.findAll), storeController.findAll);
router.get("/:store_id", validateReq(storeValidation.findById), storeController.findById);

//Auth Routes...
router.use(requireAuth);
router.get(
  "/user/stores", //?=user_id,verified
  validateReq(storeValidation.findUserStores),
  storeController.findUserStores
);
router.get(
  "/balance/:store_id",
  validateReq(storeValidation.storeBalance),
  storeController.storeBalance
);
//....
router.post("/", validateReq(storeValidation.create), storeController.create);
router.patch("/:store_id", validateReq(storeValidation.update), storeController.update);
router.patch(
  "/admin-update/:store_id",
  validateReq(storeValidation.adminUpdateStore),
  storeController.adminUpdateStore
);
router.patch(
  "/verify/:store_id",
  validateReq(storeValidation.adminVerifyStore),
  storeController.adminVerifyStore
);
export default router;
