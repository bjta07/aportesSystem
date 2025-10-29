'use client'

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/config/contexts/AuthContext"
import { toast } from "sonner"
import Icon from "@/components/UI/Icons"
import memberApi from "@/config/api/afiliadoApi"
import { colegioApi } from "@/config/api/colegioApi"
import styles from '@/styles/MemberPage.module.css'
import DetalleAfiliadoModal from "./componentes/DetalleAfiliadoModal"

export default function AfiliadosPage() {
    const { user } = useAuth()
    const params = useParams()
    const id_colegio_actual = params?.id_colegio || user?.id_colegio

    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedMember, setSelectedMember] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchFilters, setSearchFilters] = useState({ ci: '' })
    const [nombreColegio, setNombreColegio] = useState('') // ✅ nuevo estado

    // 🏫 Obtener nombre del colegio (principal o subcolegio)
    useEffect(() => {
        const fetchColegioNombre = async () => {
            try {
                const data = await colegioApi.getColegioById(id_colegio_actual)
                console.log(`Data: ${data.nombre}`)
                if (data && data.nombre) {
                    setNombreColegio(data.nombre)
                } else {
                    setNombreColegio('Colegio desconocido')
                }
            } catch (error) {
                console.error('Error al obtener nombre del colegio:', error)
                setNombreColegio('Colegio no encontrado')
            }
        }

        if (id_colegio_actual) {
            fetchColegioNombre()
        }
    }, [id_colegio_actual])

    // 👥 Obtener afiliados
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true)
                const response = await memberApi.getByCity(id_colegio_actual)
                console.log('📦 Respuesta completa de getByCity:', response)

                if (response?.ok && Array.isArray(response.data)) {
                    setMembers(response.data)
                } else {
                    setError('No se encontraron afiliados para este colegio')
                }
            } catch (err) {
                console.error('Error cargando afiliados:', err)
                setError('No se pudo cargar la lista de afiliados')
            } finally {
                setLoading(false)
            }
        }

        if (id_colegio_actual) {
            fetchMembers()
        }
    }, [id_colegio_actual])

    const handleVerDetalle = (member) => {
        setSelectedMember(member)
        setIsModalOpen(true)
    }

    const handleSave = async (updateMemberData) => {
        const memberId = selectedMember.id_afiliado
        const savePromise = new Promise(async (resolve, reject) => {
            try {
                const response = await memberApi.updateMember(memberId, updateMemberData)
                if (response.ok) {
                    setMembers(prevMembers =>
                        prevMembers.map(member =>
                            member.id_afiliado === memberId
                                ? { ...member, ...updateMemberData }
                                : member
                        )
                    )
                    resolve('Afiliado actualizado correctamente')
                } else {
                    const errorData = await response.json()
                    reject(new Error(errorData.message || 'Error al actualizar los datos del afiliado'))
                }
            } catch (error) {
                reject(new Error('Error de conexión al servidor'))
            }
        })

        toast.promise(savePromise, {
            loading: 'Guardando cambios...',
            success: (message) => {
                setIsModalOpen(false)
                setSelectedMember(null)
                return message
            },
            error: (error) => error.message
        })
    }

    const handleDelete = async (memberId, memberName) => {
        toast.warning(`¿Está seguro de eliminar a ${memberName || 'este afiliado'}?`, {
            duration: Infinity,
            action: {
                label: 'Sí, eliminar',
                onClick: async () => {
                    const deletePromise = new Promise(async (resolve, reject) => {
                        try {
                            const response = await memberApi.deleteMember(memberId)
                            if (response.ok) {
                                setMembers(prevMembers =>
                                    prevMembers.filter(member => member.id_afiliado !== memberId)
                                )
                                resolve('Afiliado eliminado correctamente')
                            } else {
                                const errorData = await response.json()
                                reject(new Error(errorData.message || 'Fallo al eliminar al afiliado'))
                            }
                        } catch (error) {
                            reject(new Error('Error de conexión al eliminar al afiliado'))
                        }
                    })
                    toast.promise(deletePromise, {
                        loading: 'Eliminando afiliado...',
                        success: (message) => {
                            setIsModalOpen(false)
                            setSelectedMember(null)
                            return message
                        },
                        error: (error) => error.message
                    })
                }
            },
            cancel: {
                label: 'Cancelar',
                onClick: () => toast.info('Operación cancelada')
            }
        })
    }

    const handleSearchChange = (field, value) => {
        setSearchFilters(prev => ({ ...prev, [field]: value }))
    }

    const clearSearch = () => {
        setSearchFilters({ ci: '' })
    }

    const filteredAndSortedMembers = useMemo(() => {
        if (!Array.isArray(members)) return []
        let filtered = members.filter(member => member.ci)
        if (searchFilters.ci.trim() !== '') {
            filtered = filtered.filter(member =>
                String(member.ci).includes(searchFilters.ci.trim())
            )
        }
        return filtered.sort((a, b) => a.apellidos.localeCompare(b.apellidos))
    }, [members, searchFilters])

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando afiliados...</p>
            </div>
        )
    }

    if (error && members.length === 0) {
        return <p className={styles.errorMessage}>Error: {error}</p>
    }

    return (
        <div className={styles.tableContainer}>
            <h2>Lista de afiliados — {nombreColegio}</h2>

            <div className={styles.searchContainer}>
                <div className={styles.searchGroup}>
                    <label className={styles.searchLabel}>
                        Buscar afiliados por Carnet de Identidad
                        <input
                            id="ci"
                            name="ci"
                            type="text"
                            placeholder="Carnet de Identidad"
                            value={searchFilters.ci}
                            onChange={(e) => handleSearchChange("ci", e.target.value)}
                            className={styles.searchInput}
                        />
                    </label>
                    <button onClick={clearSearch} className={styles.clearButton}>
                        <Icon name="erase" fill /> Limpiar filtros
                    </button>
                </div>
                <div className={styles.resultsInfo}>
                    <p>Mostrando {filteredAndSortedMembers.length} de {members.length} afiliados</p>
                </div>
            </div>

            <table className={styles.table}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <th>MAT-PROF</th>
                        <th>REG-COLEGIO</th>
                        <th>NOMBRES</th>
                        <th>APELLIDOS</th>
                        <th>CI</th>
                        <th>FECHA-AFILIACIÓN</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    {filteredAndSortedMembers.length > 0 ? (
                        filteredAndSortedMembers.map(member => (
                            <tr key={member.id_afiliado} className={styles.tableRow}>
                                <td>{member.matricula_profesional}</td>
                                <td>{member.nro_registro_colegio}</td>
                                <td>{member.nombres}</td>
                                <td>{member.apellidos}</td>
                                <td>{member.ci}</td>
                                <td>{member.fecha_afiliacion_formateada}</td>
                                <td className={styles.actionsCell}>
                                    <button
                                        onClick={() => handleVerDetalle(member)}
                                        className={styles.detailButton}
                                        title="Ver detalle completo del afiliado"
                                    >
                                        <Icon name="see" fill />
                                        Ver Detalle
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className={styles.noData}>
                                {searchFilters.ci
                                    ? 'No se encontraron resultados con los filtros aplicados'
                                    : 'No hay afiliados para mostrar'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <DetalleAfiliadoModal
                member={selectedMember}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedMember(null)
                }}
                onSave={handleSave}
                onDelete={handleDelete}
                userRol={user?.rol}
            />
        </div>
    )
}
