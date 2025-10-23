'use client'

import { useState } from "react"
import { toast } from "sonner"
import memberApi from "@/config/api/afiliadoApi"
import Icon from "@/components/UI/Icons"
import styles from '@/styles/CreateMembers.module.css'

export default function CreateMemberPage(){
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
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleChange = (e) => {
    const { id, value, type } = e.target;
    let newValue = value;

    const fieldsToUppercase = ['nombres', 'apellidos', 'matricula_profesional', 'nro_registro_colegio'];

    if (fieldsToUppercase.includes(id)) {
        newValue = value.toUpperCase();
    } 
    
    else if (id === 'email') {
        
        newValue = value.toLowerCase();
    }
    
    setFormData(prev => ({
        ...prev, 
        [id]: newValue
    }));
}

    const handleSubmit = async (e) => {
        e.preventDefault()

        const memberData = {...formData}
        const registerPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await memberApi.registerMember(memberData)
    
                if (response.ok) {
                    resolve("Afiliado creado con exito")
                } else{
                    const errorData = await response.json()
                    if (response.status === 409) {
                        reject(new Error(errorData.message || 'El usuario ya se encuentra registrado.'))
                    } else {
                        reject(new Error(errorData.message || 'No se pudo crear el usuario.'));
                    }
                }
            } catch (error) {
                console.error("Error en la conexión:", error);
                reject(new Error("Error en la conexión con el servidor."));
            }
        })

        toast.promise(registerPromise, {
            loading: 'Creando Afiliado...',
            success: (message) => {
                setFormData({
                        matricula_profesional:"",
                        nro_registro_colegio:"",
                        nombres:"",
                        apellidos:"",
                        ci:"",
                        fecha_afiliacion:"",
                        estado:"",
                        id_colegio:"",
                        email:"",
                        celular:""
                    })
                    return message
            },
            error: (error) => {
                return error.message
            }
        })

    }

    return (
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
                            style={{width: "120px", height:"44px", marginLeft:"22px"}}
                        />
                        <label>Colegio</label>
                        <select
                            id="id_colegio"
                            value={formData.id_colegio}
                            onChange={handleChange}
                            className={styles.date}
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
                    </div>
                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        <Icon name="save" fill/>
                        {loading? "Registrando..." : "Registrar"}
                    </button>
                    {message && <p>{message}</p>}
                </div>
            </form>
        </div>
    )
}