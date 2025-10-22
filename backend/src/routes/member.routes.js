import { Router } from "express";
import { MemberController } from "../controllers/member.controller.js";
import { verifyActiveUserOrAdmin, verifyActiveAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', verifyActiveUserOrAdmin, MemberController.createMember)

router.get('/', verifyActiveAdmin, MemberController.findAll)
router.get('/ci/:ci', MemberController.findByCi)
router.get('/colegio/:id_colegio', MemberController.findByColegio)

router.put('/:id_afiliado', verifyActiveUserOrAdmin, MemberController.updateMember)
router.delete('/:id_afiliado', verifyActiveUserOrAdmin, MemberController.deleteMember)

router.post('/especialidades', verifyActiveUserOrAdmin, MemberController.addEspecialidades)
router.get('/especialidades/:id_afiliado', MemberController.getEspecialidadesByAfiliado)
router.delete('/especialidades/:id_afiliado_especialidad', verifyActiveUserOrAdmin, MemberController.deleteEspecialidad)

export default router