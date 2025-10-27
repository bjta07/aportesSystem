import { Router } from "express";
import { ColegioController } from "../controllers/colegio.controller.js";
import { verifyActiveUserOrAdmin } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/', verifyActiveUserOrAdmin, ColegioController.create)
router.get('/', verifyActiveUserOrAdmin, ColegioController.getAll)
router.get('/:id',verifyActiveUserOrAdmin, ColegioController.getById)
router.get('/:id/subcolegio', verifyActiveUserOrAdmin, ColegioController.getSubColegios)

export default router