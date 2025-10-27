'use client'

import Icon from "@/components/UI/Icons"

export default function DatosPersonalesTab({
    formData,
    handleChange,
    handleSubmit,
    handleDelete,
    userRol,
    styles
}) {
    return (
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
                        readOnly
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
                        readOnly
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
                type="text"
                name="fecha_afiliacion"
                value={
                formData.fecha_afiliacion
                    ? new Date(formData.fecha_afiliacion).toLocaleDateString('es-BO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })
                    : ''
                }
                className={styles.input}
                disabled
            />
            </label>

                <label className={styles.label}>
                    Colegio:
                    <select
                        name="id_colegio"
                        value={formData.id_colegio}
                        onChange={handleChange}
                        className={styles.select}
                        disabled
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
    )
}