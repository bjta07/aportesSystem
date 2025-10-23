'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import memberApi from "@/config/api/afiliadoApi"
import { aporteApi } from "@/config/api/aportesApi"
import Icon from "@/components/UI/Icons"
import styles from '@/styles/DetalleAfiliadoModal.module.css'
import DatosPersonalesTab from "./DatosPersonalesTab"
import AportesTab from "./AportesTab"
import EspecialidadesTab from "./EspecialidadesTab"

export default function DetalleAfiliadoModal({
    member,
    isOpen,
    onClose,
    onSave,
    onDelete,
    userRol
}) {
    const [activeTab, setActiveTab] = useState('datos')
    const [formData, setFormData] = useState({
        matricula_profesional: "",
        nro_registro_colegio: "",
        nombres: "",
        apellidos: "",
        ci: "",
        new_fecha_afiliacion: "",
        estado: "",
        id_colegio: "",
        email: "",
        celular: ""
    })
    const [especialidades, setEspecialidades] = useState([])
    const [aportes, setAportes] = useState([])

    useEffect(() => {
        if (member) {
            setFormData({
                matricula_profesional: member.matricula_profesional ?? "",
                nro_registro_colegio: member.nro_registro_colegio ?? "",
                nombres: member.nombres ?? "",
                apellidos: member.apellidos ?? "",
                ci: member.ci ?? "",
                new_fecha_afiliacion: member.new_fecha_afiliacion ?? "",
                estado: member.estado ?? "",
                id_colegio: member.id_colegio ?? "",
                email: member.email ?? "",
                celular: member.celular ?? ""
            })
            
            loadEspecialidades(member.id_afiliado)
            loadAportes(member.id_afiliado)
        }
    }, [member])

    const loadEspecialidades = async (idAfiliado) => {
        if (!idAfiliado) {
            console.warn('loadEspecialidades called with invalid idAfiliado:', idAfiliado)
            setEspecialidades([])
            return
        }
        try {
            const response = await memberApi.getEspecialidadByAfiliado(idAfiliado)
            const data = response?.data ?? response
            setEspecialidades(Array.isArray(data) ? data : (data ? [data] : []))
        } catch (error) {
            console.error("Error al cargar especialidades:", error)
            toast.error(error.message || 'Error al cargar especialidades')
            setEspecialidades([])
        }
    }

    const loadAportes = async (idAfiliado) => {
        if (!idAfiliado) {
            console.warn('loadAportes called with invalid idAfiliado:', idAfiliado)
            toast.error('Id de afiliado inválido para cargar aportes')
            setAportes([])
            return
        }
        try {
            const response = await aporteApi.getAportesByAfiliado(idAfiliado)
            const data = response?.data ?? response
            setAportes(Array.isArray(data) ? data : (data ? [data] : []))
        } catch (error) {
            console.error("Error al cargar aportes:", error)
            toast.error(error.message || 'Error al cargar aportes')
            setAportes([])
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmitDatos = (e) => {
        e.preventDefault()
        const dataToSave = { ...member, ...formData, id_colegio: member.id_colegio }
        onSave(dataToSave)
    }

    const handleDelete = () => {
        if (confirm(`¿Seguro que quiere eliminar a ${formData.nombres} ${formData.apellidos}?`)) {
            onDelete && onDelete(member.id_afiliado, `${formData.nombres} ${formData.apellidos}`)
            onClose()
        }
    }

    if (!isOpen || !member) return null

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* HEADER */}
                <div className={styles.header}>
                    <div>
                        <h2>{formData.nombres} {formData.apellidos}</h2>
                        <p className={styles.subtitle}>CI: {formData.ci} • Mat. Prof: {formData.matricula_profesional}</p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <Icon name="cancel" fill />
                    </button>
                </div>

                {/* TABS */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'datos' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('datos')}
                    >
                        <Icon name="edit" fill /> Datos Personales
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'aportes' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('aportes')}
                    >
                        <Icon name="register" fill /> Aportes
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'especialidades' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('especialidades')}
                    >
                        🎓 Especialidades
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className={styles.content}>
                    {activeTab === 'datos' && (
                        <DatosPersonalesTab
                            formData={formData}
                            handleChange={handleChange}
                            handleSubmit={handleSubmitDatos}
                            handleDelete={handleDelete}
                            userRol={userRol}
                            styles={styles}
                        />
                    )}

                    {activeTab === 'aportes' && (
                        <AportesTab
                            member={member}
                            aportes={aportes}
                            loadAportes={loadAportes}
                            styles={styles}
                        />
                    )}

                    {activeTab === 'especialidades' && (
                        <EspecialidadesTab
                            member={member}
                            especialidades={especialidades}
                            loadEspecialidades={loadEspecialidades}
                            styles={styles}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}