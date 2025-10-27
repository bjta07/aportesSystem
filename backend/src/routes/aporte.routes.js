import { Router } from "express";
import { AportesController } from "../controllers/aportes.controller.js";
import { verifyActiveAdmin, verifyActiveUserOrAdmin } from "../middlewares/auth.middleware.js";
import multer from "multer"

const router = Router()
const upload = multer({ dest: "documents/" })

router.post('/', verifyActiveUserOrAdmin, AportesController.create)
router.post('/uploadAporte',  upload.single("file"), verifyActiveAdmin, AportesController.bulkUploadAportes)

router.get('/', verifyActiveAdmin, AportesController.getAll)
router.get('/afiliado/:id', verifyActiveUserOrAdmin, AportesController.getByAfiliado)
router.get('/anios-aportes', verifyActiveUserOrAdmin,  AportesController.getYearsAndAportes)
router.get('/anios', verifyActiveUserOrAdmin, AportesController.getAllYears)
router.get('/departamentos', verifyActiveAdmin, AportesController.getByDepartamento)
router.get('/meses', verifyActiveUserOrAdmin, AportesController.getAportesByMes)
router.get('/meses-colegio', verifyActiveUserOrAdmin, AportesController.getAportesByMesYColegio)


router.put('/:id', verifyActiveAdmin,  AportesController.update)
router.delete('/:id', verifyActiveAdmin, AportesController.remove)

export default router