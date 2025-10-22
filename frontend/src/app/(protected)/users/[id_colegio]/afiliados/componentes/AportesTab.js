'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { aporteApi } from "@/config/api/aportesApi"
import Icon from "@/components/UI/Icons"

export default function AportesTab({ member, aportes, loadAportes, styles }) {
    const [showRegistrarAporte, setShowRegistrarAporte] = useState(false)
    const [years, setYears] = useState([])
    const [nuevoAporte, setNuevoAporte] = useState({
        anio: "",
        mes: "",
        monto: "",
        fecha_registro: ""
    })

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    useEffect(() => {
        const loadYears = async () => {
            try {
                const res = await aporteApi.getYears()
                if (res.ok) {
                    setYears(res.years)
                } else {
                    console.error('error al obtener años')
                }
            } catch (error) {
                console.error(error)
            }
        }
        loadYears()
    }, [])

    const aportesPorAnio = {}
    aportes.forEach(aporte => {
        if (!aportesPorAnio[aporte.anio]) {
            aportesPorAnio[aporte.anio] = {}
        }
        aportesPorAnio[aporte.anio][aporte.mes] = parseFloat(aporte.monto)
    })

    const handleRegistrarAporte = async (e) => {
        e.preventDefault()

        if (!nuevoAporte.monto || !nuevoAporte.anio || !nuevoAporte.mes || !nuevoAporte.fecha_registro) {
            toast.error('Por favor, complete todos los campos')
            return
        }

        const aporteData = {
            afiliado_id: member.id_afiliado ?? member.afiliado_id,
            monto: Number(nuevoAporte.monto),
            mes: Number(nuevoAporte.mes),
            anio: Number(nuevoAporte.anio),
            fecha_registro: nuevoAporte.fecha_registro
        }

        const registerPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await aporteApi.createAporte(aporteData)
                // aporteApi.createAporte returns parsed JSON or throws
                resolve(response?.data ?? response)
            } catch (error) {
                reject(new Error(error.message || 'Error de conexion con el servidor'))
            }
        })

        toast.promise(registerPromise, {
            loading: 'Registrando aporte...',
            success: (data) => {
                setNuevoAporte({ monto: "", fecha_registro: "", mes: "", anio: "" })
                setShowRegistrarAporte(false)
                loadAportes(member.id_afiliado ?? member.afiliado_id)
                return 'Aporte registrado con éxito'
            },
            error: (error) => error.message
        })
    }

    return (
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
                                {meses.map((mes, idx) => (
                                    <option key={idx} value={idx + 1}>{mes}</option>
                                ))}
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
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(aportesPorAnio).map(anio => {
                                const aportesAnio = aportesPorAnio[anio]
                                const totalAnio = Object.values(aportesAnio).reduce((sum, val) => sum + val, 0)
                                return (
                                    <tr key={anio}>
                                        <td>{anio}</td>
                                        {meses.map((_, idx) => (
                                            <td key={idx}>
                                                {aportesAnio[idx + 1] ? aportesAnio[idx + 1].toFixed(1) : "-"}
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
    )
}