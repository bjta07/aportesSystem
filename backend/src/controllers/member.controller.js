import { MemberModel } from "../models/member.model.js";

const createMember = async (req, res) => {
    try {
        const { 
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
        } = req.body
        if (!matricula_profesional || !nro_registro_colegio || !nombres ||
    !apellidos || !ci || !fecha_afiliacion || !estado || !id_colegio || !email ||
    !celular) {
            return res.status(400).json({ ok:false, message: "Faltan datos obligatorios" })
        }
        const existCi = await MemberModel.findByCi(ci)
        if (existCi) {
            return res.status(409).json({
                ok: false,
                msg: 'Ya existe este CI'
            })
        }

        const newMember = await MemberModel.createMember({
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
        })

        return res.status(201).json({
            ok: true,
            msg:{
                matricula_profesional: newMember.matricula_profesional,
                nro_registro_colegio: newMember.nro_registro_colegio,
                nombres: newMember.nombres,
                apellidos: newMember.apellidos,
                ci: newMember.ci,
                fecha_afiliacion: newMember.fecha_afiliacion,
                estado: newMember.estado,
                id_colegio: newMember.id_colegio,
                email: newMember.email,
                celular: newMember.celular            
            }
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const findAll = async (req, res) => {
    try {
        const members = await MemberModel.findAll()
        return res.json({
            ok: true,
            data: members,
            msg: 'Lista de afiliados generada correctamente'
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const findByCi = async (req, res) => {
    try {
        const { ci } = req.params
        const member = await MemberModel.findByCi(ci)
        return res.json({
            ok: true,
            data: member,
            msg: 'Afiliado encontrado'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const findByColegio = async (req, res) => {
    try {
        const { id_colegio } = req.params
        const memberColegio = await MemberModel.findByColegio(id_colegio)
        return res.json({
            ok: true,
            data: memberColegio,
            msg: 'Afiliados del colegio encontrados'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const updateMember = async (req, res) => {
    try {
        const { id_afiliado } = req.params
        const { matricula_profesional,
                nro_registro_colegio,
                nombres,
                apellidos,
                ci,
                fecha_afiliacion,
                estado,
                id_colegio,
                email,
                celular
            } = req.body
        
        if (!id_afiliado) return res.status(400).json({ ok: false, msg: 'id_afiliado is required' })
        const member = await MemberModel.findById(id_afiliado)
        if (!member) return res.status(404).json({
            ok: false,
            msg: 'Afiliado no encontrado'
        })

        const updateMember = await MemberModel.updateMemeber(id_afiliado,{
            matricula_profesional, nro_registro_colegio, nombres, apellidos, ci, fecha_afiliacion, estado, id_colegio, email,celular
        })

        return res.json({
            ok: true,
            data: updateMember,
            msg: 'Afiliado actualizado correctamente'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const deleteMember = async (req, res) => {
    try {
        const { id_afiliado } = req.params
        const member = await MemberModel.findById(id_afiliado)
        if (!member) return res.status(404).json({
            ok: false,
            msg: 'Afiliado no encontrado'
        })

        const deleteMember = await MemberModel.deleteMember(id_afiliado)
        return res.json({
            ok: true,
            data: { id_afiliado, nombres: deleteMember.nombres,
            },
            msg: 'Afiliado eliminado correctamente'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const addEspecialidades = async (req, res) => {
    try {
        const { id_afiliado, id_especialidad, universidad, fecha_titulo} = req.body
        if (!id_afiliado || !id_especialidad || !universidad || !fecha_titulo) {
            return res.status(400).json({
                ok: false,
                msg: 'Faltan campos requeridos.'
            })
        }

        const result = await MemberModel.addEspecialidad({
            id_afiliado, 
            id_especialidad, 
            universidad, 
            fecha_titulo
        })
        return res.status(200).json({
            ok: true,
            msg: 'Especialidades asignadas correctamente al afiliado',
            data: result
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}

const getEspecialidadesByAfiliado = async (req, res) => {
    try {
        const { id_afiliado } = req.params
        const especialidades = await MemberModel.findEspecialidadesByAfiliado(id_afiliado)

        // If none found, return ok with empty array (not an error)
        if (!Array.isArray(especialidades) || especialidades.length === 0) {
            return res.json({
                ok: true,
                data: [],
                msg: 'No se encontraron especialidades para este afiliado'
            })
        }
        return res.json({
            ok: true,
            data: especialidades,
            msg: 'Especialidades obtenidas correctamente'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de Servidor'
        })
    }
}

const deleteEspecialidad = async (req, res) => {
    try {
        const { id_afiliado_especialidad } = req.params
        const result = await MemberModel.deleteEspecialidadFromAfiliado(id_afiliado_especialidad)

        if (!result) {
            return res.status(404).json({
                ok: false,
                msg: 'Especialidad no encontrada o ya eliminada'
            })
        }

        return res.json({
            ok: true,
            data: result,
            msg: 'Especialidad eliminada correctamente'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error de servidor'
        })
    }
}


export const MemberController = {
    createMember,
    findAll,
    findByCi,
    findByColegio,
    updateMember,
    deleteMember,
    addEspecialidades,
    getEspecialidadesByAfiliado,
    deleteEspecialidad
}

