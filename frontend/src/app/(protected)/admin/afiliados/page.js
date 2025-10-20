'use client'

import { useEffect, useState, useMemo } from "react"
import memberApi from "@/config/api/afiliadoApi"
import { useAuth } from "@/config/contexts/AuthContext"
import { toast } from "sonner"
import Icon from "@/components/UI/Icons"
import styles from '@/styles/MemberPage.module.css'
import DetalleAfiliadoModal from "./componentes/DetalleAfiliadoModal"

export default function MemberList(){
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedMember, setSelectedMember] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchFilters, setSearchFilters] = useState({
        ci:'',
        id_colegio:''
    })
    const { user: currentUser } = useAuth()

    const handleVerDetalle = (member) => {
        setSelectedMember(member)
        setIsModalOpen(true)
    }

    const handleSave = async(updateMemberData) => {
        const memberId = selectedMember.id_afiliado
        const savePromise = new Promise(async (resolve, reject) => {
            try {
                const response = await memberApi.updateMember(selectedMember.id_afiliado, updateMemberData)
                
                if (response.ok) {
                    setMembers(prevMembers => prevMembers.map(member =>
                        member.id_afiliado === memberId ? { ...member, ...updateMemberData } : member
                    ))
                    resolve('Afiliado actualizado correctamente')
                } else{
                    const errorData = await response.json()
                    reject(new Error(errorData.message || 'Error al actualizar los datos del afiliado'))
                }
            } catch (error) {
                reject(new Error('Error en la conexion con el servidor'))
            }
        })

        toast.promise(savePromise, {
            loading: 'Guardando cambios...',
            success: (message) => {
                setIsModalOpen(false)
                setSelectedMember(null)
                return message
            },
            error: (error) => {
                return error.message
            } 
        })
    }

    const handleSearchChange = (field, value) => {
        setSearchFilters(prev => ({...prev, [field]: value}))
    }

    const clearSearch = () => {
        setSearchFilters({
            ci: '',
            id_colegio: ''
        })
    }

    const filteredAndSortedMembers = useMemo(() => {
        if (!Array.isArray(members)) return []
        let filtered = members.filter(member => member.ci)
        if (searchFilters.ci.trim() !== '') {
            filtered = filtered.filter(member => {
                if (!member.ci) return false
                return String(member.ci).includes(searchFilters.ci.trim())
            })
        }
        if (searchFilters.id_colegio.trim() !== '') {
            filtered = filtered.filter(member => {
                if (!member.id_colegio) return false
                return String(member.id_colegio) === searchFilters.id_colegio
            })
        }

        return filtered.sort((a,b) => a.apellidos.localeCompare(b.apellidos))
    }, [members, searchFilters])

    const handleDelete = async (memberId, memberName) => {
        toast.warning(`¿Está seguro de eliminar a ${memberName || 'este afiliado'}?`,{
            duration: Infinity,
            action: {
                label:'Sí, eliminar',
                onClick: async () => {
                    const deletePromise = new Promise(async (resolve, reject) => {
                        try {
                            const response = await memberApi.deleteMember(memberId)
                            if (response.ok) {
                                setMembers(prevMembers => prevMembers.filter(member => member.id_afiliado !== memberId))
                                resolve('Afiliado eliminado correctamente')
                            }else {
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
                        error: (error) => {
                            return error.message
                        }
                    })
                }
            },
            cancel: {
                label: 'Cancelar',
                onClick: () => toast.info('Operación cancelada')
            }
        })
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedMember(null)
    }

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true)
            try {
                const response = await memberApi.getAllMembers()
                if (response && response.data && Array.isArray(response.data)) {
                    setMembers(response.data)
                    setError(null)
                }else{
                    throw new Error('Formato de respuesta inválido')
                }
            } catch (error) {
                console.error('Error al obtener a los afiliados: ', error)
                toast.error('Error al cargar lista de afiliados')
                setError(error.message)
            } finally{
                setLoading(false)
            }
        }

        if (currentUser) fetchMembers()
    }, [currentUser])

    if (loading) {
        return(
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando afiliados...</p>
            </div>
        )
    }

    if (error && members.length === 0) {
        return <p className={styles.errorMessage}>Error: {error}</p>
    }

    return(
        <div className={styles.tableContainer}>
            <h2>Lista de afiliados</h2>
            <div className={styles.searchContainer}>
                <div className={styles.searchGroup}>
                    <label className={styles.searchLabel}>Buscar afiliados por Carnet de Identidad
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
                    <label className={styles.searchLabel}>Buscar afiliados por Colegio:
                        <select
                            id="id_colegio"
                            value={searchFilters.id_colegio}
                            onChange={(e) => handleSearchChange('id_colegio', e.target.value)}
                            className={styles.searchInput}
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
                    <button onClick={clearSearch} className={styles.clearButton}>
                        <Icon name="erase" fill/>Limpiar filtros
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
                        <th>COLEGIO</th>
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
                                <td>{member.nombre_colegio}</td>
                                <td>{member.fecha_afiliacion_formateada}</td>
                                <td className={styles.actionsCell}>
                                    {/* 🎯 BOTÓN PRINCIPAL: Ver Detalle */}
                                    <button
                                        onClick={() => handleVerDetalle(member)}
                                        className={styles.detailButton}
                                        title="Ver detalle completo del afiliado"
                                    >
                                        <Icon name="see" fill/>
                                        Ver Detalle
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className={styles.noData}>
                                {searchFilters.ci || searchFilters.id_colegio ?
                                    'No se encontraron resultados con los filtros aplicados' : 
                                    'No hay afiliados para mostrar'
                                }
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 🚀 MODAL MAESTRO ÚNICO */}
            <DetalleAfiliadoModal
                member={selectedMember}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                onDelete={handleDelete}
                userRol={currentUser?.rol}
            />
        </div>
    )
}