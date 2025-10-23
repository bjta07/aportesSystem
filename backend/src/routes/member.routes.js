import { Router } from "express";
import { MemberController } from "../controllers/member.controller.js";
import { verifyActiveUserOrAdmin, verifyActiveAdmin } from "../middlewares/auth.middleware.js";
import multer from 'multer'

const router = Router();
const upload = multer({ dest: 'documents/'})

router.post('/', verifyActiveUserOrAdmin, MemberController.createMember)
router.post('/bulk-upload', verifyActiveAdmin, upload.single('file'), MemberController.bulkUpload)

router.get('/', verifyActiveAdmin, MemberController.findAll)
router.get('/ci/:ci', MemberController.findByCi)
router.get('/colegio/:id_colegio', MemberController.findByColegio)

router.put('/:id_afiliado', verifyActiveUserOrAdmin, MemberController.updateMember)
router.delete('/:id_afiliado', verifyActiveUserOrAdmin, MemberController.deleteMember)

router.post('/especialidades', verifyActiveUserOrAdmin, MemberController.addEspecialidades)
router.get('/especialidades/:id_afiliado',verifyActiveUserOrAdmin, MemberController.getEspecialidadesByAfiliado)
router.delete('/especialidades/:id_afiliado_especialidad', verifyActiveAdmin, MemberController.deleteEspecialidad)

export default router