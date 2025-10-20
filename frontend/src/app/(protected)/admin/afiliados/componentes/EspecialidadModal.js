'use client'

import { useState } from "react"
import { toast } from "sonner"
import memberApi from "@/config/api/afiliadoApi"
import styles from '@/styles/RegistrarEspecialidad.module.css'

export default function RegistrarEspecialidad({
    member, isOpen, onClose, onSave
}) {
    const [especialidad, setEspecialidad] = useState("")
    const [universidad, setUniversidad] = useState("")
    const [fechaTitulo, setFechaTitulo] = useState("")

    if(!isOpen || !member) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!especialidad || !universidad || !fechaTitulo) {
            toast.error('Por favor, seleccione una especialidad y complete los campos requeridos')
            return
        }
        
            const especialidadData = {
                id_afiliado: member.id_afiliado,
                id_especialidad: especialidad,
                universidad: universidad,
                fecha_titulo: fechaTitulo
            }

            const registerPromise = new Promise(async (resolve, reject) => {
                try {
                    const response = await memberApi.registerEspecialidad(especialidadData)

                    if (response && response.ok) {
                        resolve(response.data)
                    }else {
                        const errorData = response.json ? await response.json() : { message:'Error desconocido'}
                        reject(new Error(errorData.message || 'Error al registrar la especialidad'))
                    }
                } catch (error) {
                    reject(new Error('Error de conexion con el servidor'))
                }
                
            })

            toast.promise(registerPromise, {
                loading: 'Registrando especialidad...',
                success: (data) => {
                    onSave(data)
                    setEspecialidad("") 
                    setUniversidad("")
                    setFechaTitulo("")

                    return `Especialidad registrada con exito para ${member.nombres} ${member.apellidos}`
                },
                error: (error) => {
                    console.error('Error detallado al registrar:', error)
                    return error.message
                }
            })
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Registrar Especialidad</h2>
                <p><b>Afiliado: </b> {member.nombres} {member.apellidos}</p>
                <p><b>Carnet de Identidad: </b> {member.ci}</p>
                <form onSubmit={handleSubmit} className={styles.formGroup}>
                    <label>
                        Especialidad:
                        <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
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
                    <div className={styles.inputContainer}>
                        <label>Universidad: 
                            <input
                                className={styles.input}
                                type="text"
                                value={universidad}
                                onChange={(e) => setUniversidad(e.target.value)}
                            />
                        </label>
                        <label>Fecha de la Especialidad: 
                            <input
                                className={styles.input}
                                type="text"
                                value={fechaTitulo}
                                onChange={(e) => setFechaTitulo(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.saveButton}>Guardar</button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}