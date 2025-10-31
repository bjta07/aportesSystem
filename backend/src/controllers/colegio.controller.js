import { ColegioModel } from "../models/colegio.model.js";

const getAll = async (req, res) => {
    try {
        const colegios = await ColegioModel.getAllColegios()
        return res.status(200).json({ ok: true, data: colegios})
    } catch (error) {
        console.error('Error en colegio controller.getAll', error)
        return res.status(500).json({ ok:false, error: 'Error al obtener colegios'})
    }
}

const getById = async (req, res) => {
    try {
        const { id } = req.params
        const colegio = await ColegioModel.getColegioById(id)
        if (!colegio) {
            return res.status(404).json({ ok: false, error:'Colegio no encontrado'})
        }
        return res.status(200).json({ok:true, data: colegio})
    } catch (error) {
        console.error('Error en ColegioController .getById', error)
        return res.status(500).json({ ok: false, error: 'Error al obtener colegio'})
    }
}

const getSubColegios = async (req, res) => {
    try {
        const { id } = req.params
        const subColegios = await ColegioModel.getSubColegios(id)
        return res.status(200).json({ ok: true, data: subColegios})
    } catch (error) {
        console.error('Error en .getSubColegios', error)
        return res.status(500).json({ok: false, error: 'Error al obtener sub colegios'})
    }
}

const create = async (req, res) => {
    try {
        const { nombre, tipo, departamento, ciudad, id_colegio_padre } = req.body
        if (!nombre || !tipo || !departamento || !ciudad) {
            return res.status(400).json({ ok: false, error:'Faltan datos obligatorios'})
        }

        const colegio = await ColegioModel.createColegio({nombre, tipo, departamento, ciudad, id_colegio_padre})
        return res.status(201).json({ok: true, data: colegio})
    } catch (error) {
        console.error('Error en .create', error)
        return res.status(500).json({ ok:false, error: 'Error al crear colegio'})
    }
}

export const ColegioController = {
    getAll,
    getById,
    getSubColegios,
    create
}
