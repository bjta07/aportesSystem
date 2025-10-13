import { Router } from "express";
import { MemberController } from "../controllers/member.controller.js";

const router = Router();

router.post('/', MemberController.createMember)

router.get('/', MemberController.findAll)
router.get('/ci/:ci', MemberController.findByCi)
router.get('/colegio/:id_colegio', MemberController.findByColegio)

router.put('/:id_afiliado', MemberController.updateMember)
router.delete('/:id_afiliado', MemberController.deleteMember)

router.post('/especialidades', controller.addEspecialidades)
router.get('/especialidades/:id', controller.getEspecialidadesByAfiliado)

export default router