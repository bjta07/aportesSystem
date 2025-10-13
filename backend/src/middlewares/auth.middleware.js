import jwt from 'jsonwebtoken'

//Verificar token
export const verifyToken = (req, res, next) => {
    let token = req.headers.authorization

    if (!token) {
        return res.status(401).json({
            ok: false,
            error: 'Token not provided'
        })
    }

    token = token.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            ok: false,
            error: 'Token format is invalid'
        })
    }

    try {
        const { uid, username, role } = jwt.verify(
            token,
            process.env.JWT_SECRET
        )
        req.uid = uid
        req.username = username
        req.role = role
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                ok: false,
                error: 'Token has expired'
            })
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                ok: false,
                error:'Invalid token'
            })
        }
        return res.status(401).json({
            ok: false,
            error: 'Token verification failed'
        })
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
        if (!req.username) {
            return res.status(401).json({
                ok: false,
                error: 'Authentication required'
            })
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            error: 'Server error during verification'
        })
    }
}

export const verifyActiveToken = [verifyToken, verifyActiveUser]
export const verifyActiveAdmin = [verifyToken, verifyActiveUser, verifyAdmin]
export const verifyActiveUserOrAdmin = [
    verifyToken,
    verifyActiveUser,
    verifyUserOrAdmin
]