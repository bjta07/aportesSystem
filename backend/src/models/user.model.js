import { db } from "../config/db.js";

const createUser = async({
    nombre,
    email,
    password,
    rol,
    id_colegio,
    apellidos,
    usuario
}) => {
    const query = {
        text: `INSERT INTO usuarios (nombre, email, password, rol, id_colegio, apellidos, usuario) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        values: [nombre, email, password, rol, id_colegio, apellidos, usuario]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

//obtener usuario
const findOneByUsuario = async (usuario) => {
    const query = {
        text: `
            SELECT 
                u.id_usuario, 
                u.nombre, 
                u.usuario, 
                u.email, 
                u.password, 
                u.rol, 
                u.id_colegio, 
                u.apellidos,
                c.nombre AS nombre_colegio
            FROM usuarios u
            LEFT JOIN colegio c ON u.id_colegio = c.id_colegio
            WHERE usuario = $1`,
        values: [usuario]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

//obtener por id
const findOneById = async (id_usuario) => {
    const query = {
        text: `
            SELECT
                u.id_usuario,
                u.nombre,
                u.usuario,
                u.email,
                u.password,
                u.rol,
                u.id_colegio,
                u.apellidos,
                c.nombre AS nombre_colegio
            FROM
                usuarios u
            LEFT JOIN
                colegio c ON u.id_colegio = c.id_colegio
            WHERE
                u.id_usuario = $1
        `,
        values: [id_usuario]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

//Obtener a todos los usuarios
// Obtener a todos los usuarios, reemplazando id_colegio por nombre_colegio
const findAll = async () => {
    const query = {
        text: `
            SELECT 
                u.id_usuario, 
                u.nombre, 
                u.usuario, 
                u.email, 
                u.password, 
                u.rol, 
                u.apellidos,
                c.nombre AS nombre_colegio
            FROM 
                usuarios u  
            LEFT JOIN 
                colegio c ON u.id_colegio = c.id_colegio 
            ORDER BY 
                u.id_usuario DESC
        `
    }
    const { rows } = await db.query(query)
    // El resultado 'rows' ahora incluirá la columna 'nombre_colegio'
    return rows
}

//Actualizar usuario
const updateUsuario = async (id_usuario, {nombre, email, rol, id_colegio, apellidos, usuario}) => {
    const query = {
        text: `UPDATE usuarios
            SET nombre = $2, email = $3, rol = $4, id_colegio = $5, apellidos = $6, usuario = $7
            WHERE id_usuario = $1
            RETURNING id_usuario, nombre, email, rol, id_colegio, apellidos, usuario
        `,
        values: [id_usuario, nombre, email, rol, id_colegio, apellidos, usuario]
    }
    const { rows } = await db.query(query)
    return rows [0]
}

//actualizar rol de usuario
const updateRol = async (id_usuario, rol) => {
    const query = {
        text: `
            UPDATE usuarios
            SET rol = $2
            WHERE id_usuario = $1
            RETURNING id_usuario, nombre, email, rol, id_colegio, apellidos, usuario
        `,
        values: [id_usuario, rol]
    }
    const { rows } = await db.query(query)
    return rows [0]
}

//eliminar usuario
const deleteUsuario = async (id_usuario) => {
    const query = {
        text: `
            DELETE FROM usuarios
            WHERE id_usuario = $1
            RETURNING id_usuario, nombre
        `,
        values: [id_usuario]
    }
    const { rows } = await db.query(query)
    return rows [0]
}

//verificar usuario
const checkUsuario = async (usuario, excludeUsuario_id = null) => {
    let query
    if (excludeUsuario_id) {
        query = {
            text: `
                SELECT id_usuario FROM usuarios
                WHERE usuario = $1 AND id_usuario != $2
            `,
            values: [usuario, excludeUsuario_id]
        }
    } else {
        query = {
            text: `SELECT id_usuario FROM usuarios
            WHERE usuario = $1`,
            values: [usuario]
        }
    }
    const { rows } = await db.query(query)
    return rows.length > 0
}

const updateProfile = async(id_usuario, {usuario, email}) => {
    const query = {
        text: `
            UPDATE usuarios
            SET usuario = $2, email = $3
            WHERE id_usuario = $1
            RETURNING id_usuario, nombre, email, rol, id_colegio, apellidos, usuario
        `,
        values: [id_usuario, usuario, email]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const updatePassword = async (id_usuario, hashedPassword) => {
    const query = {
        text: `
            UPDATE usuarios
            SET password = $2
            WHERE id_usuario = $1
            RETURNING id_usuario, nombre, usuario, email
        `,
        values: [id_usuario, hashedPassword]
    }
    const { rows } = await db.query(query)
    return rows [0]
}

export const UserModel = {
    createUser,
    findOneByUsuario,
    findOneById,
    findAll,
    updateUsuario,
    updateRol,
    deleteUsuario,
    checkUsuario,
    updateProfile,
    updatePassword
}