import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'

//registrar usuario
const registrarUsuario = async (req, res) => {
    try {
        const { nombre, usuario, password, email, rol, id_colegio, apellidos} = req.body
        if (!nombre || !usuario || !password || !email || !rol || !apellidos) {
            return res.status(400).json({ ok: false, msg: 'Missing required fields'})
        }
        const exisitingUsername = await UserModel.findOneByUsuario(usuario)
        if (exisitingUsername) {
            return res.status(409).json({ ok: false, error: 'User already exists'})
        }

        if (rol === 'user' && !id_colegio) {
            return res.status(400).json({ ok: false, error: 'id_colegio es obligatorio para usuarios de tipo user' })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = await UserModel.createUser({
            nombre,
            email,
            password: hashedPassword,
            rol,
            id_colegio,
            apellidos,
            usuario
        })

        const token = jwt.sign(
            {
                id_usuario: newUser.id_usuario,
                email: newUser.email,
                usuario: newUser.usuario,
                rol: newUser.rol,
                id_colegio: newUser.id_colegio
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h'}
        )
        return res.status(201).json({
            ok: true,
            msg: {
                token,
                usuario: {
                    id_usuario: newUser.id_usuario,
                    nombre: newUser.nombre,
                    apellidos: newUser.apellidos,
                    email: newUser.email,
                    usuario: newUser.usuario,
                    rol: newUser.rol,
                    id_colegio: newUser.id_colegio
                }
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ ok: false, error: 'Server error'})
    }
}

//login usuario
const login = async (req, res) => {
    try {
        const { usuario, password } = req.body
        if (!usuario || !password) {
            return res.status(400).json({error: 'Missing required fields'})
        }

        const user = await UserModel.findOneByUsuario(usuario)
        if (!user) return res.status(404).json({ error: 'User not Found'})
        
        const isMatch = await bcryptjs.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password'})
        }

        const token = jwt.sign({
            id_usuario: user.id_usuario,
            email: user.email,
            usuario: user.usuario,
            rol: user.rol,
            id_colegio: user.id_colegio
        }, process.env.JWT_SECRET, { expiresIn: '8h'})
        return res.json({
            token,
            usuario: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                usuario: user.usuario,
                rol: user.rol,
                id_colegio: user.id_colegio
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok: false, error: 'Server error'})
    }
}

//Perfil
const profile = async (req, res) => {
    try {
        const user = await UserModel.findOneByUsuario(req.username)
        if (!user) return res.status(404).json({ ok: false, error: 'User not found'})
        return res.json({
            ok: true,
            data: user
    })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok:false, error: 'Server error'})
    }
}

//Cambiar rol
const updateRol = async (req, res) => {
    try {
        const { id_usuario } = req.params
        const { rol } = req.body

        if (!rol) {
            return res.status(400).json({ ok: false, error: 'Rol is required'})
        }

        if (req.id_usuario === parseInt(id_usuario)) {
            return res.status(400).json({ ok: false, error: 'You cannot change your own rol'})
        }

        const user = await UserModel.findOneById(id_usuario)
        if (!user) return res.status(404).json({ ok: false, error: 'User not found'})
        
        const updateUser = await UserModel.updateRol(id_usuario, rol)

        return res.json({
            ok: true,
            data: updateUser,
            msg: 'User role updated successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok:false, error: 'Server error'})
    }
}

const updateUser = async (req, res) => {
    try {
        const { id_usuario } = req.params
        const { nombre, usuario, password, email, rol, id_colegio, apellidos } = req.body

        const user = await UserModel.findOneById( id_usuario)
        if (!user) return res.status(404).json({ok: false, error: 'User not found'})
        const updateUser = await UserModel.updateUsuario( id_usuario ,{ nombre, usuario, password, email, rol, id_colegio, apellidos})
        return res.json({
            ok: true,
            data: updateUser,
            msg: 'User updated successfully'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ok: false, error: 'Server error'})
    }
}

//eliminar usuario
const deleteUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params
        
        if (req.id_usuario === parseInt(id_usuario)) {
            console.log('[deleteUsuario] attempt to delete self blocked for id:', req.id_usuario)
            return res.status(403).json({ ok: false, error: 'You cannot delete yourself'})
        }

        const user = await UserModel.findOneById(id_usuario)

        if (!user) {
            console.log('[deleteUsuario] user not found for id:', id_usuario)
            return res.status(404).json({ ok: false, error: 'User not found'})
        }
        
        const deleteUser = await UserModel.deleteUsuario(id_usuario)

        const responseBody = {
            ok: true,
            data: { id_usuario, nombre: deleteUser.nombre},
            msg: 'User deleted successfully'
        }
        return res.json(responseBody)
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok:false, error: 'Server error'})
    }
}

const findAll = async (req, res) => {
    try {
        const users = await UserModel.findAll()
        return res.json({ ok: true, data: users, msg: 'User retrieved successfully'})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ ok: false, error: 'Server error'})
    }
}

const updatePersonalProfile = async (req, res) => {
    try {
        const { id_usuario } = req.params
        const { usuario, email} = req.body

        if (req.id_usuario !== parseInt(id_usuario)) {
            return res.status(403).json({
                ok: false,
                error: 'No tienes permiso para actualizar ese perfil'
            })
        }
        const user = await UserModel.findOneById(id_usuario)
        if (!user) {
            return res.status(404).json({ok:false, error: 'Usuario no encontrado'})
        }

        const updateUser = await UserModel.updateProfile(id_usuario, {
            usuario,
            email,
            nombre: user.nombre,
            apellidos: user.apellidos
        })
        return res.json({
            ok: true,
            data: updateUser,
            msg: 'Perfil actualizado correctamente'
        })
    } catch (error) {
        return res.status(500).json({ ok: false, error: 'Error al actualizar el perfil'})
    }
}

const updatePassword = async (req, res) => {
    try {
        const { id_usuario } = req.params
        const { currentPassword, newPassword } = req.body

        if (req.id_usuario !== parseInt(id_usuario)) {
            return res.status(403).json({
                ok: false,
                error: 'No tienes permiso para cambiar esta contraseña'
            })
        }

        const user = await UserModel.findOneById(id_usuario)
        if (!user) {
            return res.status(404).json({ ok: false, error: 'Usuario no encontrado'})
        }

        const isMatch = await bcryptjs.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(401).json({ ok: false, error: 'La contraseña actual no es correcta'})
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(newPassword, salt)

        const updatedUser = await UserModel.updatePassword(id_usuario, hashedPassword)

        return res.json({
            ok: true,
            data: {
                id_usuario: updatedUser.id_usuario,
                nombre: updatedUser.nombre
            },
            msg: 'Contraseña actualizada correctamente'
        })
    } catch (error) {
        return res.status(500).json({ ok: false, error: 'Error al actualizar la contraseña'})
    }
}

export const UserController = {
    registrarUsuario,
    login,
    profile,
    updateRol,
    deleteUsuario,
    findAll,
    updateUser,
    updatePersonalProfile,
    updatePassword,
}

