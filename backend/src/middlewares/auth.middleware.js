import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'
import { MemberModel } from '../models/member.model.js'

//Verificar token
export const verifyToken = async (req, res, next) => {
    let token = req.headers.authorization

    if (!token) {
        return res.status(401).json({ ok: false, error: 'Token not provided' })
    }

    token = token.split(' ')[1]

    if (!token) {
        return res.status(401).json({ ok: false, error: 'Token format is invalid' })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        // Token might contain different key names depending on where it was created
        const id_usuario = payload.id_usuario || payload.uid || payload.sub || payload.id

        if (!id_usuario) {
            return res.status(401).json({ ok: false, error: 'Token does not contain user id' })
        }

        // Fetch full user from DB to get id_colegio and role
        const user = await UserModel.findOneById(id_usuario)
        if (!user) {
            return res.status(401).json({ ok: false, error: 'User not found' })
        }

        // Attach both convenience fields and full user object
        req.user = user
        req.uid = user.id_usuario
        req.username = user.usuario || user.nombre || payload.usuario || payload.username
        req.role = user.rol || payload.rol

        return next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ ok: false, error: 'Token has expired' })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ ok: false, error: 'Invalid token' })
        }
        console.error('Token verification error:', error)
        return res.status(401).json({ ok: false, error: 'Token verification failed' })
    }
}

// Verificar usuario admin
export const verifyAdmin = (req, res, next) => {
    if(!req.role){
        return res.status(401).json({
            ok: false,
            error: 'Authentication required'
        })
    }

    if(req.role === 'admin'){
        return next()
    }

    return res.status(403).json({
        ok: false,
        error: 'Access denied. Admin role required'
    })
}

//Verificar usuario y admin
export const verifyUserOrAdmin = (req, res, next) => {
    if ((!req.role)) {
        return res.status(401).json({
            ok: false,
            error: 'Authentication required'
        })
    }

    if (req.role === 'user' || req.role === 'admin') {
        return next()
    }
    return res.status(403).json({
        ok: false,
        error: 'Access denied. User or Admin role required'
    })
}

//Verificar usuario
export const verifyUser = (req, res, next) => {
    if (!req.role) {
        return res.status(401).json({
            ok: false,
            error: 'Authentication required'
        })
    }
    if (req.role === 'user'|| req.role === 'admin') {
        return next()
    }
    return res.status(403).json({
        ok: false,
        error: 'Access denied. Valid user role required'
    })
}

//Verificar cuenta
export const verifyOwner = async (req, res, next) => {
    try {
        if ((!req.uid)) {
            return res.status(401).json({
                ok: false,
                error: 'Authentication required'
            })
        }
        // If we reach here, ownership/authentication is satisfied
        // Continue to the next middleware or controller
        return next()
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            error: 'Server error verifying ownership'
        })
    }
}

export const verifyActiveUser = async (req, res, next) => {
    try {
        // Prefer checking the attached user object
        if (!req.user && !req.username) {
            return res.status(401).json({ ok: false, error: 'Authentication required' })
        }

        return next()
    } catch (error) {
        console.error('verifyActiveUser error:', error)
        return res.status(500).json({ ok: false, error: 'Server error during verification' })
    }
}

export const restrictToColegio = (req, res, next) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(401).json({ ok: false, msg: 'Authentication required' })
        }

        const { rol, id_colegio } = user

        // Detecta de dónde viene el id_colegio directamente
        let idColegioDestino = req.body.id_colegio || req.params.id_colegio || req.query.id_colegio

        // Si no viene id_colegio, tal vez vienen ids de afiliado (afiliado_id, id_afiliado, id)
        if (!idColegioDestino) {
            const afiliadoId = req.body.afiliado_id || req.params.id_afiliado || req.params.id || req.body.id_afiliado || req.query.afiliado_id || req.query.id_afiliado
            if (afiliadoId) {
                // Buscar afiliado y extraer su id_colegio
                return MemberModel.findById(afiliadoId).then(afiliado => {
                    if (!afiliado) {
                        return res.status(404).json({ ok: false, msg: 'Afiliado no encontrado' })
                    }
                    idColegioDestino = afiliado.id_colegio

                    // Admin puede todo
                    if (rol === 'admin') return next()

                    // Users responsible for a colegio can only access their own colegio
                    if ((rol === 'responsable' || rol === 'user') && Number(id_colegio) === Number(idColegioDestino)) {
                        return next()
                    }

                    return res.status(403).json({ ok: false, msg: 'No tiene permisos para registrar o ver datos de otros colegios' })
                }).catch(err => {
                    console.error('Error fetching afiliado in restrictToColegio:', err)
                    return res.status(500).json({ ok: false, msg: 'Server error' })
                })
            }
        }

        if (!idColegioDestino) {
            return res.status(400).json({ ok: false, msg: 'No se especificó el id del colegio destino' })
        }

        // Admin puede todo
        if (rol === 'admin') return next()

        // Users responsible for a colegio can only access their own colegio
        if ((rol === 'responsable' || rol === 'user') && Number(id_colegio) === Number(idColegioDestino)) {
            return next()
        }

        return res.status(403).json({ ok: false, msg: 'No tiene permisos para registrar o ver datos de otros colegios' })
    } catch (error) {
        console.error('restrictToColegio error:', error)
        return res.status(500).json({ ok: false, msg: 'Server error' })
    }
}


export const verifyActiveToken = [verifyToken]
export const verifyActiveAdmin = [verifyToken, verifyActiveUser, verifyAdmin]
export const verifyActiveUserOrAdmin = [
    verifyToken,
    verifyActiveUser,
    verifyUserOrAdmin,
    restrictToColegio
]