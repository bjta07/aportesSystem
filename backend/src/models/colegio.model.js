
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
    const query = {
        text: `SELECT * FROM colegio WHERE id_colegio_padre = $1`,
        values: [id_colegio_padre]
    }
    const { rows } = await db.query(query)
    return rows
}

export const ColegioModel = {
    createColegio,
    getAllColegios,
    getColegioById,
    getSubColegios
}