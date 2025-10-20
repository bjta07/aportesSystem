'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import memberApi from "@/config/api/afiliadoApi"
import { aporteApi } from "@/config/api/aportesApi"
import Icon from "@/components/UI/Icons"
import styles from '@/styles/DetalleAfiliadoModal.module.css'

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
        fecha_afiliacion: "",
        estado: "",
        id_colegio: "",
        email: "",
        celular: ""
    })
    const [especialidades, setEspecialidades] = useState([])
    const [aportes, setAportes] = useState([])
    const [showRegistrarEspecialidad, setShowRegistrarEspecialidad] = useState(false)
    const [showRegistrarAporte, setShowRegistrarAporte] = useState(false)
    const [years, setYears] = useState([])
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    // Formulario de especialidad
    const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
        id_especialidad: "",
        universidad: "",
        fecha_titulo: ""
    })

    // Formulario de aporte
    const [nuevoAporte, setNuevoAporte] = useState({
        anio: "",
        mes: "",
        monto: "",
        fecha_registro: ""
    })

    useEffect(() => {
        if (member) {
            setFormData({
                matricula_profesional: member.matricula_profesional ?? "",
                nro_registro_colegio: member.nro_registro_colegio ?? "",
                nombres: member.nombres ?? "",
                apellidos: member.apellidos ?? "",
                ci: member.ci ?? "",
                fecha_afiliacion: member.fecha_afiliacion ?? "",
                estado: member.estado ?? "",
                id_colegio: member.id_colegio ?? "",
                email: member.email ?? "",
                celular: member.celular ?? ""
            })
            
            // Cargar especialidades y aportes del afiliado
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
            setEspecialidades(response.data || [])
        } catch (error) {
            console.error("Error al cargar especialidades:", error)
            toast.error(error.message || 'Error al cargar especialidades')
            setEspecialidades([])
        }
    }

    useEffect(() => {
        const loadYears = async () => {
            try {
                const res = await aporteApi.getYears()
                if (res.ok) {
                    setYears(res.years)
                }else{
                    console.error('error al obtener años')
                }
            } catch (error) {
                console.error(error)
            }
        }
        loadYears()
    }, [])

    const loadAportes = async (idAfiliado) => {
        if (!idAfiliado) {
            console.warn('loadAportes called with invalid idAfiliado:', idAfiliado)
            toast.error('Id de afiliado inválido para cargar aportes')
            setAportes([])
            return
        }
        try {
            const response = await aporteApi.getAportesByAfiliado(idAfiliado)
            setAportes(response.data || [])
        } catch (error) {
            console.error("Error al cargar aportes:", error)
            toast.error(error.message || 'Error al cargar aportes')
            setAportes([])
        }
    }

    if (!isOpen || !member) return null

    const aportesPorAnio = {}
    aportes.forEach(aporte => {
        if (!aportesPorAnio[aporte.anio]) {
            aportesPorAnio[aporte.anio] = {}
        }
        aportesPorAnio[aporte.anio] [aporte.mes] = parseFloat(aporte.monto)
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmitDatos = (e) => {
        e.preventDefault()
        const dataToSave = { ...member, ...formData }
        onSave(dataToSave)
    }

    const handleDelete = () => {
        if (confirm(`¿Seguro que quiere eliminar a ${formData.nombres} ${formData.apellidos}?`)) {
            onDelete && onDelete(member.id_afiliado, `${formData.nombres} ${formData.apellidos}`)
            onClose()
        }
    }

    const handleRegistrarEspecialidad = async (e) => {
        e.preventDefault()
        
        if (!nuevaEspecialidad.id_especialidad || !nuevaEspecialidad.universidad || !nuevaEspecialidad.fecha_titulo) {
            toast.error('Por favor, complete todos los campos')
            return
        }

        const especialidadData = {
            id_afiliado: member.id_afiliado,
            ...nuevaEspecialidad
        }

        const registerPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await memberApi.registerEspecialidad(especialidadData)
                if (response && response.ok) {
                    resolve(response.data)
                } else {
                    const errorData = response.json ? await response.json() : { message: 'Error desconocido' }
                    reject(new Error(errorData.message || 'Error al registrar la especialidad'))
                }
            } catch (error) {
                reject(new Error('Error de conexión con el servidor'))
            }
        })

        toast.promise(registerPromise, {
            loading: 'Registrando especialidad...',
            success: (data) => {
                setNuevaEspecialidad({ id_especialidad: "", universidad: "", fecha_titulo: "" })
                setShowRegistrarEspecialidad(false)
                loadEspecialidades(member.id_afiliado)
                return 'Especialidad registrada con éxito'
            },
            error: (error) => error.message
        })
    }

    const handleRegistrarAporte = async (e) => {
        e.preventDefault()

        if (!nuevoAporte.monto || !nuevoAporte.anio || !nuevoAporte.mes|| !nuevoAporte.fecha_registro) {
            toast.error('Por favor, complete todos los campos')
            return
        }

        const aporteData = {
            // Backend expects id_afiliado for afiliado PK; ensure we send correct field
            afiliado_id: member.id_afiliado ?? member.afiliado_id,
            ...nuevoAporte
        }
        const registerPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await aporteApi.createAporte(aporteData)
                if (response && response.ok) {
                    resolve(response.data)
                }else{
                    const errorData = response.json ? await response.json() : { message: 'Error desconocido'}
                        reject(new Error(errorData.message || 'Error al registrar el aporte'))
                    }
            } catch (error) {
                reject(new Error('Error de conexion con el servidor'))
            }
        })
        toast.promise(registerPromise, {
            loading: 'Registrando aporte...',
            success: (data) =>{
                setNuevoAporte({ monto: "", fecha_registro: "", mes: "", anio: "" })
                setShowRegistrarAporte(false)
                // reload using the correct id field
                loadAportes(member.id_afiliado ?? member.afiliado_id)
                return 'Aporte registrada con éxito'
            },
            error: (error) => error.message
            
        })
    }

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
                    
                    {/* TAB: DATOS PERSONALES */}
                    {activeTab === 'datos' && (
                        <form onSubmit={handleSubmitDatos} className={styles.form}>
                            <div className={styles.inputContainer}>
                                <label className={styles.label}>
                                    Matricula Profesional:
                                    <input
                                        type="text"
                                        name="matricula_profesional"
                                        value={formData.matricula_profesional}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                                <label className={styles.label}>
                                    N° de Registro:
                                    <input
                                        type="text"
                                        name="nro_registro_colegio"
                                        value={formData.nro_registro_colegio}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                                <label className={styles.label}>
                                    Carnet de Identidad:
                                    <input
                                        type="text"
                                        name="ci"
                                        value={formData.ci}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                            </div>
                            
                            <div className={styles.inputContainer}>
                                <label className={styles.label}>
                                    Nombres:
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={formData.nombres}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                                <label className={styles.label}>
                                    Apellidos:
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                            </div>

                            <div className={styles.inputContainer}>
                                <label className={styles.label}>
                                    Celular:
                                    <input
                                        type="text"
                                        name="celular"
                                        value={formData.celular}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                                <label className={styles.label}>
                                    Email:
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                                <label className={styles.label}>
                                    Estado:
                                    <input
                                        type="text"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                            </div>

                            <div className={styles.inputContainer}>
                                <label className={styles.label}>
                                    Fecha de Afiliación:
                                    <input
                                        type="date"
                                        name="fecha_afiliacion"
                                        value={formData.fecha_afiliacion}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </label>
                                <label className={styles.label}>
                                    Colegio:
                                    <select
                                        name="id_colegio"
                                        value={formData.id_colegio}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        <option value="">Seleccione...</option>
                                        <optgroup label="Colegios Departamentales">
                                            <option value="1">Colegio departamental de La Paz</option>
                                            <option value="2">Colegio departamental de Oruro</option>
                                            <option value="3">Colegio departamental de Cochabamba</option>
                                            <option value="4">Colegio departamental de Santa Cruz</option>
                                            <option value="5">Colegio departamental de Tarija</option>
                                            <option value="6">Colegio departamental de Potosi</option>
                                            <option value="7">Colegio departamental de Beni</option>
                                            <option value="8">Colegio departamental de Pando</option>
                                            <option value="9">Colegio departamental de Chuquisaca</option>
                                        </optgroup>
                                        <optgroup label="Colegios Regionales">
                                            <option value="10">Colegio regional de El Alto</option>
                                            <option value="11">Colegio regional de Camiri</option>
                                            <option value="12">Colegio regional de Tupiza</option>
                                            <option value="13">Colegio regional de Catavi</option>
                                            <option value="14">Colegio regional de Riberalta</option>
                                            <option value="15">Colegio regional de Yacuiba</option>
                                        </optgroup>
                                    </select>
                                </label>
                            </div>

                            <div className={styles.actions}>
                                <button type="submit" className={styles.saveBtn}>
                                    <Icon name="save" fill /> Guardar Cambios
                                </button>
                                {userRol === 'admin' && (
                                    <button type="button" onClick={handleDelete} className={styles.deleteBtn}>
                                        <Icon name="delete" fill /> Eliminar Afiliado
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    {/* TAB: APORTES */}
                    {activeTab === 'aportes' && (
                        <div className={styles.tabContent}>
                            <div className={styles.sectionHeader}>
                                <h3>Historial de Aportes</h3>
                                {!showRegistrarAporte && (
                                    <button
                                        onClick={() => setShowRegistrarAporte(true)}
                                        className={styles.addBtn}
                                    >
                                        <Icon name="register" fill /> Registrar Nuevo Aporte
                                    </button>
                                )}
                            </div>

                            {showRegistrarAporte && (
                                <form onSubmit={handleRegistrarAporte} className={styles.formInline}>
                                    <h4>Nuevo Aporte</h4>
                                    <div className={styles.inputContainer}>
                                        <label className={styles.label}>
                                            Monto:
                                            <input
                                                type="number"
                                                value={nuevoAporte.monto}
                                                onChange={(e) => setNuevoAporte({...nuevoAporte, monto: e.target.value})}
                                                className={styles.input}
                                                placeholder="Ej: 100"
                                            />
                                        </label>
                                        <label className={styles.label}>
                                            Fecha de Aporte:
                                            <input
                                                type="date"
                                                value={nuevoAporte.fecha_registro}
                                                onChange={(e) => setNuevoAporte({...nuevoAporte, fecha_registro: e.target.value})}
                                                className={styles.input}
                                            />
                                        </label>
                                        <label className={styles.label}>
                                            Mes:
                                            <select
                                                value={nuevoAporte.mes}
                                                onChange={(e) => setNuevoAporte({...nuevoAporte, mes: e.target.value})}
                                                className={styles.select}
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="1">Enero</option>
                                                <option value="2">Febrero</option>
                                                <option value="3">Marzo</option>
                                                <option value="4">Abril</option>
                                                <option value="5">Mayo</option>
                                                <option value="6">Junio</option>
                                                <option value="7">Julio</option>
                                                <option value="8">Agosto</option>
                                                <option value="9">Septiembre</option>
                                                <option value="10">Octubre</option>
                                                <option value="11">Noviembre</option>
                                                <option value="12">Diciembre</option>
                                            </select>
                                        </label>
                                        <label className={styles.label}>
                                            Gestión:
                                            <select
                                                value={nuevoAporte.anio}
                                                onChange={(e) => setNuevoAporte({...nuevoAporte, anio: e.target.value})}
                                                className={styles.select}
                                            >
                                                <option value="">Seleccione un año</option>
                                                {years.map((year) => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                    <div className={styles.actions}>
                                        <button type="submit" className={styles.saveBtn}>Guardar Aporte</button>
                                        <button type="button" onClick={() => setShowRegistrarAporte(false)} className={styles.cancelBtn}>
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.listContainer}>
                                {aportes.length > 0 ? (
                                    <table className={styles.dataTable}>
                                        <thead>
                                            <tr>
                                                <th>Año</th>
                                                {meses.map(mes => (
                                                    <th key={mes}>{mes}</th>
                                                ))}
                                                <th>total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(aportesPorAnio).map(anio => {
                                                const aportesAnio = aportesPorAnio[anio]
                                                const totalAnio = Object.values(aportesAnio).reduce((sum, val) => sum + val ,0)
                                                return (
                                                    <tr  key={anio}>
                                                        <td>{anio}</td>
                                                        {meses.map((_, idx) => (
                                                            <td key={idx}>
                                                                {aportesAnio[idx + 1] ? aportesAnio[idx + 1].toFixed(1): "-"}
                                                            </td>
                                                        ))}
                                                        <td><strong>{totalAnio.toFixed(1)}</strong></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className={styles.emptyState}>No hay aportes registrados</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ESPECIALIDADES */}
                    {activeTab === 'especialidades' && (
                        <div className={styles.tabContent}>
                            <div className={styles.sectionHeader}>
                                <h3>Especialidades Registradas</h3>
                                {!showRegistrarEspecialidad && (
                                    <button
                                        onClick={() => setShowRegistrarEspecialidad(true)}
                                        className={styles.addBtn}
                                    >
                                        🎓 Registrar Especialidad
                                    </button>
                                )}
                            </div>

                            {showRegistrarEspecialidad && (
                                <form onSubmit={handleRegistrarEspecialidad} className={styles.formInline}>
                                    <h4>Nueva Especialidad</h4>
                                    <div className={styles.inputContainer}>
                                        <label className={styles.label}>
                                            Especialidad:
                                            <select
                                                value={nuevaEspecialidad.id_especialidad}
                                                onChange={(e) => setNuevaEspecialidad({...nuevaEspecialidad, id_especialidad: e.target.value})}
                                                className={styles.select}
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="1">Licenciatura en Enfermeria</option>
                                                <option value="2">Master en Medico Quirurgica</option>
                                                <option value="3">Master en Enfermeria Quirurgica</option>
                                                <option value="4">Master en Enfermeria Ginecoobstetricia</option>
                                                <option value="5">Master en Enfermeria Pediatrica</option>
                                                <option value="6">Master en Enfermeria en Salud Mental</option>
                                                <option value="7">Master en Enfermeria en Salud Publica</option>
                                                <option value="8">Master en Enfermeria Administracion de Servicios de Salud</option>
                                                <option value="9">Master en Educacion</option>
                                                <option value="10">Master en Investigacion</option>
                                                <option value="11">Master en Enfermeria en Medicina Critica y Terapia Intensiva</option>
                                                <option value="12">Master en Geriatria y Gerontologia</option>
                                            </select>
                                        </label>
                                        <label className={styles.label}>
                                            Universidad:
                                            <input
                                                type="text"
                                                value={nuevaEspecialidad.universidad}
                                                onChange={(e) => setNuevaEspecialidad({...nuevaEspecialidad, universidad: e.target.value})}
                                                className={styles.input}
                                            />
                                        </label>
                                        <label className={styles.label}>
                                            Fecha de Título:
                                            <input
                                                type="date"
                                                value={nuevaEspecialidad.fecha_titulo}
                                                onChange={(e) => setNuevaEspecialidad({...nuevaEspecialidad, fecha_titulo: e.target.value})}
                                                className={styles.input}
                                            />
                                        </label>
                                    </div>
                                    <div className={styles.actions}>
                                        <button type="submit" className={styles.saveBtn}>Guardar Especialidad</button>
                                        <button type="button" onClick={() => setShowRegistrarEspecialidad(false)} className={styles.cancelBtn}>
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.listContainer}>
                                {especialidades.length > 0 ? (
                                    <div className={styles.cardGrid}>
                                        {especialidades.map((esp, i) => (
                                            <div key={esp.id_afiliado ? `${esp.id_afiliado}-${esp.id_especialidad || i}` : `esp-${i}`} className={styles.card}>
                                                <h4>{esp.especialidad}</h4>
                                                <p><strong>Institucion:</strong> {esp.universidad}</p>
                                                <p><strong>Fecha:</strong> {esp.new_fecha_titulo}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.emptyState}>No hay especialidades registradas</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}