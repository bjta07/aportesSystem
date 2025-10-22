'use client'

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/config/contexts/AuthContext"
import memberApi from "@/config/api/afiliadoApi"
import { aporteApi } from "@/config/api/aportesApi"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import styles from '@/styles/Reports.module.css'

export default function UserReportPage(){
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [aportes, setAportes] = useState({})
    const [searchFilters, setSearchFilters] = useState({ ci: ""})
    const [selectedYear, setSelectedYear] = useState("")
    const [availableYears, setAvailableYears] = useState([])
    const { user: currentUser } = useAuth

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const especialidades = {
        "1": "Licenciatura en Enfermeria",
        "2": "Master en Medico Quirurgica",
        "3": "Master en Enfermeria Quirurgica",
        "4": "Master en Enfermeria Ginecoobstetricia",
        "5": "Master en Enfermeria Pediatrica",
        "6": "Master en Enfermeria en Salud Mental",
        "7": "Master en Enfermeria en Salud Publica",
        "8": "Master en Enfermeria Administracion de Servicios de Salud",
        "9": "Master en Educacion",
        "10": "Master en Investigacion",
        "11": "Master en Enfermeria en Medicina Critica y Terapia Intensiva",
        "12": "Master en Geriatria y Gerontologia"
    }

    const handleSearchChange = (field, value) => {
        setSearchFilters(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const clearSearch = () => {
        setSearchFilters({
            ci: '',
            especialidad: ''
        })
    }

    const filteredAndSortedMembers = useMemo(() => {
        if (!Array.isArray(members)) return []
        let filtered = members.filter(member => member.ci)
        if (searchFilters.ci.trim() !== ''){
            filtered = filtered.filter(member => {
                if (!member.ci) return false
                return String(member.ci) === String(searchFilters.ci).trim()
            })
        }
        return filtered.sort((a,b) => (a.apellidos || '').localeCompare(b.apellidos || ''))
    },[members, searchFilters])

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true)
            try {
                const response = await memberApi.getByCity(currentUser.id_colegio)
            } catch (error) {
                
            }
        }
    })

}