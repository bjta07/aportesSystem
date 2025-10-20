import { useState, useEffect } from "react";
import Icon from "@/components/UI/Icons";
import styles from '@/styles/EditModal.module.css'

export default function MemberModal({
    member, isOpen, onClose, onSave, onDelete, userRol
}){
    const initialFormState = {
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
    }

    const [formData, setFormData] = useState(initialFormState)
    
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
        } else {
            setFormData(initialFormState)
        }
    }, [member])

    if (!isOpen) return null
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value})
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Antes de guardar: ", formData)

        const dataToSave = {
            ...member,
            ...formData,
            matricula_profesional: formData.matricula_profesional,
            nro_registro_colegio: formData.nro_registro_colegio,
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            ci: formData.ci,
            fecha_afiliacion: formData.fecha_afiliacion,
            estado: formData.estado,
            id_colegio: formData.id_colegio,
            email: formData.email,
            celular: formData.celular,        
        }
        if (dataToSave) onSave(dataToSave)
    }
    const handleDelete = () => {
        if (confirm('Seguro que quiere eliminar a este afiliado?')) {
            onDelete && onDelete(member.id_afiliado)
        }
    }

    return(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Afiliado: {formData.nombres} {formData.apellidos}</h2>
                    <h3>Carnet: {formData.ci}</h3>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>
                        Matricula Profesional:
                        <input
                            type="text"
                            name="matricula_profesional"
                            value={formData.matricula_profesional}
                            onChange={handleChange}
                            className={styles.input}
                            style={{width: "145px"}}
                        /></label>
                        <label className={styles.label}>
                        N° de Registro:
                        <input
                            type="text"
                            name="nro_registro_colegio"
                            value={formData.nro_registro_colegio}
                            onChange={handleChange}
                            className={styles.input}
                            style={{width: "145px"}}
                        /></label>
                        <label className={styles.label}>
                        Carnet de Identidad:
                        <input
                            type="text"
                            name="ci"
                            value={formData.ci}
                            onChange={handleChange}
                            className={styles.input}
                            style={{width:"125px"}}
                        /></label>
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
                            /></label>
                            <label className={styles.label}>
                            Apellidos:
                            <input
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                className={styles.input}
                            /></label>
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>
                        celular:
                        <input
                            type="text"
                            name="celular"
                            value={formData.celular}
                            onChange={handleChange}
                            className={styles.input}
                            style={{width: "150px"}}
                        /></label>
                        <label className={styles.label}>
                        email
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                        /></label>
                        <label className={styles.label}>
                        estado:
                        <input
                            type="text"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className={styles.input}
                            style={{width: "90px"}}
                        /></label>
                    </div>

                    <div className={styles.inputContainer}>
                        <label className={styles.label}>
                            Fecha de Afiliacion
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
                            id="id_colegio"
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
                                    <option value="13">Colegio regional de Riberalta</option>
                                    <option value="13">Colegio regional de Yacuiba</option>
                                </optgroup>
                        </select>
                        </label>
                    </div>
                    <div className={styles.actions}>
                        <button type="submit" className={styles.saveBtn}><Icon name="save" fill/> Guardar</button>
                        {userRol === 'admin' && (
                            <button type="button" onClick={handleDelete} className={styles.deleteBtn}>
                                <Icon name="delete" fill/>
                                Eliminar
                            </button>
                        )}
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            <Icon name="cancel" fill/>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}