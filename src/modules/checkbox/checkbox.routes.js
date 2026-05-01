import { Router } from "express";
import {authenticated} from "../../common/middleware/auth.middleware.js"
import * as controller from "./checkbox.controller.js"

const router = Router();

router.get("/", controller.checkboxes);

export default router