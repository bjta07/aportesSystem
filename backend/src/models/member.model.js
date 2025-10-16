import { db } from "../config/db.js";

const createMember = async ({
    matricula_profesional,
    nro_registro_colegio,
    nombres,
    apellidos,
    ci,
    fecha_afiliacion,
    estado,
    id_colegio,
    email,
    celular
}) => {
    const query = {
        text: `
            INSERT INTO afiliado
            (matricula_profesional, nro_registro_colegio, nombres, apellidos, ci, fecha_afiliacion, estado, id_colegio, email,celular)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
        `,
        values: [
            matricula_profesional,
            nro_registro_colegio,
            nombres,
            apellidos,
            ci,
            fecha_afiliacion,
            estado,
            parseInt(id_colegio),
            email,
            celular
        ]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const findById = async(id_afiliado) => {
    const query = {
        text: `
            SELECT id_afiliado,matricula_profesional, nro_registro_colegio, nombres, apellidos, ci, fecha_afiliacion, estado, id_colegio, email,celular
            FROM afiliado
            WHERE id_afiliado = $1
        `,
        values: [id_afiliado]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const findAll = async() => {
    const query = {
        text: `SELECT
            a.id_afiliado,
            a.ci,
            a.nombres,
            a.apellidos,
            a.id_colegio,
            c.id_colegio AS nombre
            FROM afiliado a
            JOIN colegio c ON a.id_colegio = c.id_colegio
            ORDER BY apellidos DESC
        `
    }
    const { rows } = await db.query(query)
    return rows
}

const findByCi = async(ci) => {
    const query = {
        text: `
            SELECT * from afiliado
            WHERE ci = $1
        `,
        values: [ci]
    }
    const { rows } = await db.query(query) 
    return rows [0]
}

const findByColegio = async(id_colegio) => {
    const query = {
        text: `
            SELECT ci, nombres, apellidos, estado, id_colegio, email,celular
            FROM afiliado
            WHERE id_colegio = $1
            ORDER BY apellidos DESC
        `,
        values : [id_colegio]
    }
    const { rows } = await db.query(query)
    return rows
}

const updateMemeber = async(id_afiliado, {
    matricula_profesional,
    nro_registro_colegio,
    nombres,
    apellidos,
    ci,
    fecha_afiliacion,
    estado,
    id_colegio,
    email,
    celular}) => {
        const query = {
            text: `
                UPDATE afiliado
                SET matricula_profesional = $2,
                    nro_registro_colegio = $3,
                    nombres = $4,
                    apellidos = $5,
                    ci = $6,
                    fecha_afiliacion = $7,
                    estado = $8,
                    id_colegio = $9,
                    email = $10,
                    celular = $11
                WHERE id_afiliado = $1
                RETURNING *
            `,
            values: [
                id_afiliado,
                matricula_profesional,
                nro_registro_colegio,
                nombres,
                apellidos,
                ci,
                fecha_afiliacion,
                estado,
                parseInt(id_colegio),
                email,
                celular
            ]
        }
        const rows = await db.query(query)
        return rows [0]
    }

const deleteMember = async (id_afiliado) => {
    const query = {
        text: `
            DELETE from afiliado
            WHERE id_afiliado = $1
            RETURNING id_afiliado, nombres, apellidos
        `,
        values: [id_afiliado]
    }
    const { rows } = await db.query(query)
    return rows [0]
}

const addEspecialidad = async ({ id_afiliado, id_especialidad, universidad, fecha_titulo }) => {
    const query = {
        text: `
            INSERT INTO afiliado_especialidad (id_afiliado, id_especialidad, universidad, fecha_titulo)
            VALUES ($1, $2, $3, $4)
            RETURNING id_afiliado, id_especialidad, universidad, fecha_titulo
        `,
        values: [id_afiliado, id_especialidad, universidad, fecha_titulo]
    }

    const { rows } = await db.query(query)
    return rows
}

const findEspecialidadesByAfiliado = async (id_afiliado) => {
    const query = {
        text: `
            SELECT 
                a.id_afiliado,
                a.nombres,
                a.apellidos,
                e.nombre AS especialidad,
                ae.universidad,
                ae.fecha_titulo
            FROM afiliado AS a
            INNER JOIN afiliado_especialidad AS ae ON a.id_afiliado = ae.id_afiliado
            INNER JOIN especialidad AS e ON e.id_especialidad = ae.id_especialidad
            WHERE a.id_afiliado = $1
            ORDER BY ae.fecha_titulo DESC
        `,
        values: [id_afiliado]
    }
    const result = await db.query(query)
    return result?.rows ?? []
}

const deleteEspecialidadFromAfiliado = async (id_afiliado_especialidad) => {
    const query = {
        text: `
            DELETE FROM afiliado_especialidad
            WHERE id_afiliado_especialidad = $1
            RETURNING id_afiliado_especialidad
        `,
        values: [id_afiliado_especialidad]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

export const MemberModel = {
    createMember,
    findById,
    findAll,
    findByCi,
    findByColegio,
    updateMemeber,
    deleteMember,
    addEspecialidad,
    findEspecialidadesByAfiliado,
    deleteEspecialidadFromAfiliado
}

