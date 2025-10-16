import { useState, useEffect } from "react";
import Icon from "@/components/UI/Icons";
import styles from '@/styles/UserModal.module.css'
// toast is handled in the page; do not show toast from the modal to avoid duplicates

export default function UserModal ({ user, isOpen, onClose, onSave, onDelete }){
  const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        rol: "",
        id_colegio: "",
        apellidos: "",
        usuario: ""
    })

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre|| "",
                email: user.email|| "",
                password: user.password|| "",
                rol: user.rol|| "",
                id_colegio: user.id_colegio|| "",
                apellidos: user.apellidos|| "",
                usuario: user.usuario|| ""            })
        }
    }, [user])

    if (!isOpen) return null
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked: value})
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

  const handleDeleteClick = async () => {
    if (!user || isDeleting) return

    const ok = window.confirm(`¿Estás seguro de eliminar a ${user.nombre} ${user.apellidos || ''}? Esta acción es irreversible.`)
    if (!ok) return

    try {
      setIsDeleting(true)
      // onDelete is expected to return a promise handled by the page (which will manage the toast)
      await onDelete(user.id_usuario, user.nombre)
    } catch (err) {
      // noop: page handles toast/errores. Keep modal open so user sees result.
      console.error('Error eliminando usuario desde modal:', err)
    } finally {
      setIsDeleting(false)
    }
  }


    return(
        <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Editar Usuario</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Nombre:
            <input className={styles.input} type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
          </label>
          <label className={styles.label}>
          <label className={styles.label}>
            Apellidos:
            <input className={styles.input} type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} />
          </label>
            Usuario:
            <input className={styles.input} type="text" name="usuario" value={formData.usuario} onChange={handleChange} />
          </label>
          <label className={styles.label}>
            Email:
            <input className={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} />
          </label>
          <label className={styles.label}>
            Rol:
            <select name="rol" value={formData.rol} onChange={handleChange} className={styles.select}>
              <option value="">Seleccionar...</option>
              <option value="admin">Admin</option>
              <option value="user">Usuario</option>
            </select>
          </label>
          <div className={styles.div}>
                        <label className={styles.label} htmlFor="id_colegio">Procedencia</label>
                        <select 
                            name="id_colegio"
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
          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}><Icon name="save" fill/> Guardar</button>
      <button type="button" className={styles.deleteBtn} onClick={handleDeleteClick} disabled={isDeleting}>
        <Icon name="delete" fill />
        {isDeleting ? 'Eliminando...' : 'Eliminar'}
      </button>
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