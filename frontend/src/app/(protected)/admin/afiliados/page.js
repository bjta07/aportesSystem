'use client'

import { useEffect, useState, useMemo } from "react"
import memberApi from "@/config/api/afiliadoApi"
import { useAuth } from "@/config/contexts/AuthContext"
import Icon from "@/components/UI/Icons"
import next from "next"

export default function MemberList(){
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedMember, setSelectedMember] = useState(null)
    const [searchFilters, setSearchFilters] = useState({
        ci:'',
        id_colegio:''
    })
    const { user: currentUser } = useAuth()

    const handleEditClick = (member) => {
        setSelectedMember(member)
    }

    const handleSave = async(updateMemberData) => {
        try {
            setLoading(true)
            const response = await memberApi.updateMember(selectedMember.id_afiliado, updateMemberData)
            setMembers(members.map(member => member.id_afiliado === selectedMember.id_afiliado ? { ...member, ...updateMemberData} : member))
            setSelectedMember(null)
        } catch (error) {
            setError('Error al actualizar los datos ' + error.message)
        } finally {
            setLoading(false)
        }
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
                return member.ci === searchFilters.ci
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

    const handleDelete = async (memberId) => {
        try {
            setLoading(true)
            await memberApi.deleteMember(memberId)
            setMembers(members.filter(member => member.id_afiliado !== memberId))
            setSelectedMember(null)
        } catch (error) {
            setError('Error al eliminar al afiliado ' + error.message)
        } finally{
            setLoading(false)
        }
    }

    //handle modals

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await memberApi.getAllMembers()
                if (response && Array.isArray(response.data)) {
                    setMembers(response.data)
                }else{
                    throw new Error('Formato de respuesta invalido')
                }
            } catch (error) {
                console.error('Error al obtener a los afiliados: ', error)
                setError(error.message)
            } finally{
                setLoading(false)
            }
        }

        if (currentUser) fetchMembers()
    }, [currentUser])

    if (loading) {
        return(
            <p>Cargando afiliados</p>
        )
    }

    if (error) {
        return(
            <span>{error}</span>
        )
    }

    return(
        <div>
            <h2>Lista de afiliados</h2>
            <div>
                <div>
                    <label>Buscar afiliados por Carnet de Identidad
                        <input
                            id="ci"
                            name="ci"
                            type="text"
                            placeholder="Carnet de Identidad"
                            value={searchFilters.ci}
                            onChange={(e) => handleSearchChange("ci", e.target.value)}
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}