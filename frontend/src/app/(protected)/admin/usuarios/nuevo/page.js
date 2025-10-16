'use client'

import { useState } from "react"
import { toast } from 'sonner'; 
import authApi from "@/config/api/userApi"
import styles from '@/styles/CreateUserForm.module.css'
import Icon from "@/components/UI/Icons"

export default function CreateUserPage(){
    const [rol, setRol] = useState('user')
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        rol: "",
        id_colegio: "",
        apellidos: "",
        usuario: ""
    })

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const userData = { ...formData, rol }
        const registerPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await authApi.register(userData)
                
                if (response.ok) {
                    resolve('Usuario creado con éxito'); 
                } else {
                    const errorData = await response.json()

                    if (response.status === 409) { 
                        reject(new Error(errorData.message || 'El usuario ya se encuentra registrado.'));
                    } else {
                        reject(new Error(errorData.message || 'No se pudo crear el usuario.'));
                    }
                }
            } catch (error) {
                console.error("Error en la conexión:", error);
                reject(new Error("Error en la conexión con el servidor."));
            }
        });

        toast.promise(registerPromise, {
            loading: 'Creando usuario...', 
            success: (message) => {

                setFormData({
                    nombre: "",
                    email: "",
                    password: "",
                    rol: "",
                    id_colegio: "",
                    apellidos: "",
                    usuario: ""
                })
                setRol('user')
                return message;
            },
            error: (error) => {
                
                return error.message;
            },
        });
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Crear usuario</h2>

                <div className={styles.div}>
                    <input className={styles.input} type="text" placeholder="Nombre" id="nombre" value={formData.nombre} onChange={handleChange} required/>
                    <input className={styles.input} type="text" placeholder="Apellidos" id="apellidos" value={formData.apellidos} onChange={handleChange} required/>
                </div>

                <div>
                    <input className={styles.input} type="email" placeholder="Email" id="email" value={formData.email} onChange={handleChange} required/>
                </div>

                <div>
                    <input className={styles.input} type="text" placeholder="Usuario" id="usuario" value={formData.usuario} onChange={handleChange} required/>
                    <input className={styles.input} type="password" placeholder="Contraseña" id="password" value={formData.password} onChange={handleChange} required/>
                </div>

                <div className={styles.divRole}>
                    <label className={styles.label}>Rol de Usuario</label>
                    <div className={styles.switch}>
                        <span className={rol === 'user' ? styles.active : ""}>User</span>
                        <label className={styles.toggle}>
                            <input type="checkbox" checked={rol === 'admin'} onChange={() => setRol(rol ==='user' ? 'admin' : 'user')}
                            />
                            <span className={styles.slider}></span>
                        </label>
                            <span className={rol === 'admin' ? styles.active: ""}>Admin</span>
                    </div>
                </div>
                {rol === 'user' && (
                    <div className={styles.div}>
                        <label className={styles.label} htmlFor="id_colegio">Procedencia</label>
                        <select 
                            id="id_colegio"
                            value={formData.id_colegio}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Seleccione...</option>
                            <optgroup label="Departamentales">
                                <option value="2">Colegio departamental de Santa Cruz</option>
                                <option value="3">Colegio departamental de La Paz</option>
                                <option value="4">Colegio departamental de Cochabamba</option>
                                <option value="5">Colegio departamental de Oruro</option>
                                <option value="6">Colegio departamental de Potosí</option>
                                <option value="7">Colegio departamental de Tarija</option>
                                <option value="8">Colegio departamental de Sucre</option>
                                <option value="9">Colegio departamental de Pando</option>
                            </optgroup>
                            <optgroup label="Regionales">
                                <option value="10">Colegio regional de El Alto</option>
                                <option value="11">Colegio regional de Tupiza</option>
                                <option value="12">Colegio regional de Camiri</option>
                                <option value="13">Colegio regional de Catavi</option>
                            </optgroup>
                        </select>
                    </div>
                )}
                <button 
                    type="submit" 
                    className={styles.button}
                >
                    <Icon name="save" fill/>
                    Crear usuario
                </button>
            </form>
        </div>
    )
}