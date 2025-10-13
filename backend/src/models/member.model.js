import { text } from "express";
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
            a.id,
            a.ci,
            a.nombres,
            a.apellidos,
            a.id_colegio,
            c.colegio AS nombre
            FROM afiliado a
            JOIN colegio c ON a.id_colegio = c.id_colegio
            ORDER BY apellidos DESC
        `
    }
    const { rows } = await db.query(query)
    return rows
}

