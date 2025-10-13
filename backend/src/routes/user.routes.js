import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const router = Router()

router.post('/register', UserController.registrarUsuario)
router.get('/login', UserController.login)
router.get('/user', UserController.findAll)

export default router