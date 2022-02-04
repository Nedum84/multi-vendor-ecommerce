import express from "express";
import validate from "../../middlewares/validate";
import appSettingsValidation from "../../validations/collection.validation";
import appSettingsController from "../../controller/collection.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/:key", validate(appSettingsValidation.findOne), appSettingsController.findOne);

//-->Authenticated route
router.use(requireAuth);
router.post("", validate(appSettingsValidation.addNew), appSettingsController.addNew);
router.patch("", validate(appSettingsValidation.update), appSettingsController.update);
export default router;
