
import { db } from "../config/db.js";

const createColegio = async ({
    nombre,
    tipo,
    departamento,
    ciudad,
    id_colegio_padre = null
}) => {
    const query = {
        text: `
            INSERT INTO colegio (nombre, tipo, departamento, ciudad, id_colegio_padre)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `,
        values: [nombre, tipo, departamento, ciudad, id_colegio_padre]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const getAllColegios = async () => {
    const query = {
        text: 'SELECT * FROM colegio ORDER BY id_colegio'
    }
    const { rows } = await db.query(query)
    return rows
}

const getColegioById = async (id_colegio) => {
    const query = {
        text: `SELECT * FROM colegio WHERE id_colegio = $1`,
        values: [id_colegio]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const getSubColegios = async (id_colegio_padre) => {
    try {
        if (!id_colegio_padre) return []

        const query = {
            text: `
                SELECT id_colegio, nombre, id_colegio_padre
                FROM colegio 
                WHERE id_colegio_padre = $1
                ORDER BY nombre ASC
                `,
            values: [id_colegio_padre]
        }
        const { rows } = await db.query(query)
        return rows || []
    } catch (error) {
        console.error('Error en getSubcolegios', error)
        throw new Error('Error al obtener los subcolegios')
    }
}

export const ColegioModel = {
    createColegio,
    getAllColegios,
    getColegioById,
    getSubColegios
}