import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { verifyActiveAdmin, verifyActiveToken, verifyOwner } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/login', UserController.login)
router.post('/register',verifyActiveAdmin, UserController.registrarUsuario)
router.get('/profile', verifyActiveToken, UserController.profile)

router.get('/', verifyActiveAdmin, UserController.findAll)
router.put('/:id_usuario', verifyActiveAdmin, UserController.updateUser)

router.put('/:uid/rol', verifyActiveAdmin, UserController.updateRol)
router.delete('/:id_usuario', verifyActiveAdmin, verifyOwner, UserController.deleteUsuario)

router.put('/:id_usuario/profile', verifyActiveToken, verifyOwner, UserController.updatePersonalProfile)
router.put('/:id_usuario/password', verifyActiveToken, verifyOwner, UserController.updatePassword)

export default router