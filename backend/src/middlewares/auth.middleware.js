import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'


//Verificar token
export const verifyToken = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ ok: false, error: 'Token not provided' })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ ok: false, error: 'Token format is invalid' })
    }

    const token = parts[1]

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ ok: false, error: 'Token has expired' })
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ ok: false, error: 'Invalid token' })
      }
      return res.status(401).json({ ok: false, error: 'Token verification failed' })
    }

    const id_usuario = payload.id_usuario || payload.uid || payload.sub || payload.id
    if (!id_usuario) {
      // Intentamos con username si existe (caso raro)
      const usernameFromToken = payload.usuario || payload.username
      if (!usernameFromToken) {
        return res.status(401).json({ ok: false, error: 'Token does not contain user id or username' })
      }
      // Si tenemos username, podemos intentar buscarlo por username
      const userByName = await UserModel.findOneByUsuario(usernameFromToken)
      if (!userByName) {
        return res.status(401).json({ ok: false, error: 'User not found by username in token' })
      }
      req.user = userByName
      req.uid = userByName.id_usuario
      req.username = userByName.usuario || userByName.nombre
      req.role = userByName.rol
      return next()
    }

    // Buscar el usuario completo en BD
    let user = null
    try {
      user = await UserModel.findOneById(id_usuario)
    } catch (err) {
      console.error('Error al consultar UserModel.findOneById:', err)
    }

    if (user) {
      req.user = user
      req.uid = user.id_usuario
      req.username = user.usuario || user.nombre || payload.usuario || payload.username
      req.role = user.rol || payload.rol
      return next()
    }

    const fallbackUser = {
      id_usuario: id_usuario,
      usuario: payload.usuario || payload.username || null,
      nombre: payload.nombre || null,
      rol: payload.rol || 'user',
      id_colegio: payload.id_colegio ?? null
    }

    // Attach fallback to request so downstream middlewares can use it
    req.user = fallbackUser
    req.uid = id_usuario
    req.username = fallbackUser.usuario || fallbackUser.nombre
    req.role = fallbackUser.rol
    return next()
  } catch (error) {
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

        return next()
    } catch (error) {
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
        return res.status(500).json({ ok: false, error: 'Server error during verification' })
    }
}

export const restrictToColegio = async (req, res, next) => {
  try {
    const { user, uid } = req

    // Si no hay usuario, error inmediato
    if (!user && !uid) {
      return res.status(401).json({ ok: false, error: 'Usuario no autenticado' })
    }

    // Asegurar que tenemos user desde DB o el request
    const dbUser = user || (await UserModel.findOneById(uid))
    if (!dbUser) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado en BD' })
    }
    
    // Si el usuario es admin, lo dejamos pasar
    if (dbUser.rol === 'admin' || dbUser.rol === 'superadmin') {
      return next()
    }

    // Asegurar que el usuario tiene id_colegio
    if (!dbUser.id_colegio) {
      return res.status(403).json({ ok: false, error: 'El usuario no pertenece a ningún colegio' })
    }

    const userColegio = String(dbUser.id_colegio)
    const targetColegio =
      String(req.body?.id_colegio ?? req.query?.id_colegio ?? req.params?.id_colegio ?? '')


    // ✅ Si la ruta contiene id_colegio, verificar coincidencia
    if (targetColegio && targetColegio !== userColegio) {

      return res.status(403).json({
        ok: false,
        error: 'No tienes permiso para acceder a este colegio'
      })
    }

    // ✅ Adjuntar el id_colegio del usuario al request para futuras queries
    req.id_colegio = dbUser.id_colegio

    // ✅ Todo OK
    return next()
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Error interno en restrictToColegio',
      details: error.message
    })
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