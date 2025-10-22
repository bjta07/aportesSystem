'use client'

import { useState } from "react"
import { toast } from "sonner"
import memberApi from "@/config/api/afiliadoApi"

export default function EspecialidadesTab({ member, especialidades, loadEspecialidades, styles }) {
    const [showRegistrarEspecialidad, setShowRegistrarEspecialidad] = useState(false)
    const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
        id_especialidad: "",
        universidad: "",
        fecha_titulo: ""
    })

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
                // memberApi.registerEspecialidad returns parsed JSON or throws.
                // Consider success when no exception thrown.
                resolve(response?.data ?? response)
            } catch (error) {
                reject(new Error(error.message || 'Error de conexión con el servidor'))
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

    return (
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
    )
}
