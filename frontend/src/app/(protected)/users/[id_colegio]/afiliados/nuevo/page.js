'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import memberApi from "@/config/api/afiliadoApi"
import { colegioApi } from "@/config/api/colegioApi"
import { useAuth } from "@/config/contexts/AuthContext"
import Icon from "@/components/UI/Icons"
import { ProtectedRoute } from "@/components/UI/ProtectedRoute"
import styles from '@/styles/CreateMembers.module.css'

export default function RegistrarAfiliado(){
    const { user } = useAuth()
    const params = useParams()
    const id_colegio_actual = params?.id_colegio || user?.id_colegio
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [colegiosDisponibles, setColegiosDisponibles] = useState([])

    const [formData, setFormData] = useState({
        matricula_profesional: "",
        nro_registro_colegio: "",
        nombres: "",
        apellidos: "",
        ci: "",
        fecha_afiliacion: "",
        estado: "",
        id_colegio: user.id_colegio,
        email: "",
        celular: ""
    })

    useEffect(() => {
        const fetchColegios = async () => {
            try {
                const response = await colegioApi.getSubColegios(user.id_colegio)
                const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : []
                if (data.length > 0) {
                    setColegiosDisponibles([
                        { id_colegio: user.id_colegio, nombre: user.nombre_colegio},
                        ...data
                    ])
                }else {
                    setColegiosDisponibles([
                        { id_colegio: user.id_colegio, nombre: user.nombre_colegio}
                    ])
                }
            } catch (error) {
                console.error('Error al obtener colegios: ', error)
                setColegiosDisponibles([{id_colegio: user.id_colegio, nombre: user.nombre_colegio}])
            }
        }
        if (user?.id_colegio) fetchColegios()
    }, [user])

    const handleChange = (e) => {
        const { id, value} = e.target
        let newValue = value

        const fieldsToUppercase = ['nombres', 'apellidos', 'matricula_profesional', 'nro_registro_colegio']
        if (fieldsToUppercase.includes(id)) {
            newValue = value.toUpperCase()
        }
        else if(id === 'email'){
            newValue = value.toLowerCase()
        }

        setFormData(prev => ({
            ...prev,
            [id]: newValue
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const memberData = {...formData}
        const registerPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await memberApi.registerMember(memberData)
                if (response.ok) {
                    resolve('Afiliado registrado con exito')
                }else{
                    const errorData = await response.json()
                    if (response.status === 409) {
                        reject(new Error(errorData.message || 'El afiliado ya se encuentra registrado'))
                    } else{
                        reject(new Error(errorData.message || 'No se pudo registrar al afiliado'))
                    }
                }
            } catch (error) {
                console.error('Error en la conexion: ', error)
                reject(new Error('Error en la conexion con el servidor'))
            }
        })

        toast.promise(registerPromise, {
            loading: 'Registrando afiliado...',
            success: (message) => {
                setFormData({
                    matricula_profesional: "",
                    nro_registro_colegio: "",
                    nombres: "",
                    apellidos: "",
                    ci: "",
                    fecha_afiliacion: "",
                    estado: "",
                    id_colegio: user.id_colegio,
                    email: "",
                    celular: ""
                })
                return message
            },
            error: (error) => {
                return error.message
            }
        })
    }
    return (
        <ProtectedRoute>
            <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Registrar nuevo afiliado</h2>
                <div className={styles.itemContainer}>
                    <div className={styles.inputContainer}>
                        <input
                            required
                            className={styles.input}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Matricula Profesional"
                            id="matricula_profesional"
                            value={formData.matricula_profesional}
                        />
                        <input
                            required
                            className={styles.input}
                            onChange={handleChange}
                            type="text" 
                            placeholder="N° Registro Colegio"
                            id="nro_registro_colegio"
                            value={formData.nro_registro_colegio}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            required
                            className={styles.input}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Nombres"
                            id="nombres"
                            value={formData.nombres}
                        />
                        <input
                            required
                            className={styles.input}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Apellidos"
                            id="apellidos"
                            value={formData.apellidos}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <input
                            required
                            className={styles.input}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Carnet de Identidad"
                            id="ci"
                            value={formData.ci}
                        />
                        <input
                            required
                            className={styles.input}
                            onChange={handleChange}
                            type="text" 
                            placeholder="N° Celular"
                            id="celular"
                            value={formData.celular}
                        />
                    </div>
                    <div  className={styles.mailContainer}>
                        <input
                            required
                            className={styles.mail}
                            onChange={handleChange}
                            type="email" 
                            placeholder="Correo Electronico"
                            id="email"
                            value={formData.email}
                            style={{height:"44px"}}
                        />
                            <label className={styles.label}>Fecha de Afiliacion</label>
                            <input
                                required
                                className={styles.date}
                                onChange={handleChange}
                                type="date" 
                                id="fecha_afiliacion"
                                value={formData.fecha_afiliacion}
                            />
                    </div>
                    <div className={styles.mailContainer}>
                        <input
                            className={styles.mail}
                            type="text"
                            id="estado"
                            placeholder="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            style={{width: "120px", height:"44px"}}
                        />
                    <label>Colegio</label>
                    {Array.isArray(colegiosDisponibles) && colegiosDisponibles.length > 1 ? (
                        <select
                            id="id_colegio"
                            className={styles.date}
                            value={formData.id_colegio}
                            onChange={handleChange}
                            required
                        >
                            {colegiosDisponibles.map((colegio) => (
                                <option key={colegio.id_colegio} value={colegio.id_colegio}>
                                    {colegio.nombre}
                                </option>
                            ))}
                        </select>
                    ) : (
                    <>
                        <div
                            className={styles.date}
                            style={{
                                backgroundColor: "#f5f5f5",
                                cursor: "default",
                            }}
                        >
                            {user.nombre_colegio || "Sin colegio asignado"}
                        </div>

                        {/* Mantener el ID oculto para el formulario */}
                        <input
                            type="hidden"
                            id="id_colegio"
                            name="id_colegio"
                            value={formData.id_colegio}
                            onChange={handleChange}
                        />
                    </>
                )}
                    </div>
                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        <Icon name="save" fill/>
                        {loading? "Registrando..." : "Registrar"}
                    </button>
                    {message && <p>{message}</p>}
                </div>
            </form>
        </div>
        </ProtectedRoute>
    )
}