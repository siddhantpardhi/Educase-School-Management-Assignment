import { Router } from "express";
import { addSchool, listSchools } from "./database/database.js";
import { validateLocation, validateSchool } from "./middleware/validation.middleware.js";

const router = Router()

router.route("/addschool").post(validateSchool, addSchool)
router.route("/listschool").get(validateLocation, listSchools)

export default router