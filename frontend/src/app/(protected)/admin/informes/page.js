'use client'

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/config/contexts/AuthContext"
import memberApi from "@/config/api/afiliadoApi"
import { aporteApi } from "@/config/api/aportesApi"
import jsPDF from 'jspdf'
import autoTable from "jspdf-autotable"
import styles from '@/styles/Reports.module.css'

export default function Reports(){
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);

    const [aportes, setAportes] = useState({})
    const [searchFilters, setSearchFilters] = useState({ ci: "", id_colegio: "", especialidad: ""})
    const [selectedYear, setSelectedYear] = useState("")
    const [availableYears, setAvailableYears] = useState([])
    const { user: currentUser } = useAuth()

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const colegios = {
        "1": "Colegio departamental de Santa Cruz",
        "2": "Colegio departamental de La Paz",
        "3": "Colegio departamental de Cochabamba",
        "4": "Colegio departamental de Oruro",
        "5": "Colegio departamental de Potosí",
        "6": "Colegio departamental de Tarija",
        "7": "Colegio departamental de Sucre",
        "8": "Colegio departamental de Pando",
        "9": "Colegio regional de El Alto",
        "10": "Colegio regional de Tupiza",
        "11": "Colegio regional de Camiri",
        "12": "Colegio regional de Catavi"
    }

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
            id_colegio:'',
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
        if (searchFilters.id_colegio && searchFilters.id_colegio.trim() !== '') {
            filtered = filtered.filter(member => {
                if (!member.id_colegio) return false
                return String(member.id_colegio) === String(searchFilters.id_colegio)
            })
        }
        return filtered.sort((a,b) => (a.apellidos || '').localeCompare(b.apellidos || ''))
    }, [members, searchFilters])

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true)
            try {
                const response = await memberApi.getAllMembers()
                if (response && response.data && Array.isArray(response.data)) {
                    setMembers(response.data)
                }else{
                    throw new Error('Formato de respuesta invalido')
                }
            } catch (error) {
                setError(error.message || String(error))
            } finally{
                setLoading(false)
            }
        }
        if (currentUser) fetchMembers()
    }, [currentUser])

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const response = await aporteApi.getYears()
                if (response?.years) {
                    setAvailableYears(response.years)
                }
            } catch (error) {
                console.error("Error al obtener los años disponibles", error)
            }
        }
        fetchYears()
    }, [])

    useEffect(() => {
        const fetchAportesForYear = async () => {
            if (!selectedYear) {
                setAportes({})
                return
            }
            try {
                const response = await aporteApi.getYearsAndAportes(selectedYear)
                const allAportesForSelectedYear = response?.data.aportes?.data || []
                const aportesPorMiembro = {}

                for (const member of members){
                    aportesPorMiembro[member.id_afiliado] = []
                }
                for (const aporte of allAportesForSelectedYear) {
                    if (aportesPorMiembro[String(aporte.id_afiliado)]) {
                        aportesPorMiembro[String(aporte.id_afiliado)].push(aporte)
                    }
                }
                setAportes(aportesPorMiembro)
            } catch (error) {
                console.error('Error al obtener aportes por año: ', error)
            }
        }
        if (members.length > 0) fetchAportesForYear()
    }, [members, selectedYear])

    const formatDateTime = (date = new Date()) => {
        return date.toLocaleString("es-BO", {
            year: 'numeric', month: 'long', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const buildTableRows = (memberList) => {
        const rows = []
        for (const member of memberList) {
            const aporteList = aportes[String(member.id_afiliado)] || []
            const mesesVals = Array(12).fill(0)
            let total = 0
            for (const a of aporteList) {
                const m = Number(a.mes)
                const monto = Number(a.monto) || 0
                if (!isNaN(m) && m >=1 && m<=12) {
                    mesesVals[m-1] += monto
                    total += monto
                } else{
                    total += monto
                }
            }
            const row = [
                member.ci || '',
                `${member.apellidos || ""} ${member.nombres || ""}`.trim(),
                ...mesesVals.map(v => v === 0 ? "-" : Number(v).toFixed(1)),
                Number(total).toFixed(1)
            ]
            rows.push(row)
        }
        return rows
    }

    const generatePDF = () => {
        if (!selectedYear) {
            alert('Debe seleccionar un año para generar el informe')
            return
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

        const title = `Informe de aportes - Año ${selectedYear}`
        const printedBy = currentUser ? `${currentUser.nombre}` : 'Usuario desconocido'
        const fechaImpresion = formatDateTime(new Date())

        // Header del documento
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text(title, 40, 40)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Impreso por: ${printedBy}`, 40, 60)
        doc.text(`Fecha: ${fechaImpresion}`, 40, 75)

        const head = [
            'CI',
            'Apellidos y Nombres',
            ...meses,
            'Total'
        ]

        const groupedByColegio = {}
        filteredAndSortedMembers.forEach(member => {
            const colegioName = colegios[member.id_colegio] || 'Colegio desconocido'
            if (!groupedByColegio[colegioName]) groupedByColegio[colegioName] = []
            groupedByColegio[colegioName].push(member)
        })

        let isFirstTable = true

        for (const colegioName in groupedByColegio) {
            const memberInColegio = groupedByColegio[colegioName]
            const rows = buildTableRows(memberInColegio)

            // Si no es la primera tabla, agregar nueva página
            if (!isFirstTable) {
                doc.addPage()
            }

            // Título del colegio
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text(colegioName, 40, isFirstTable ? 100 : 40)

            autoTable(doc, {
                head: [head],
                body: rows,
                startY: isFirstTable ? 115 : 55,
                styles: {
                    fontSize: 7,
                    halign: 'center',
                    valign: 'middle',
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [40, 116, 166],
                    textColor: 255,
                    halign: 'center',
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 50},
                    1: { halign: 'left', cellWidth: 100}
                },
                margin: { left: 40, right: 40, top: 40, bottom: 30},
                showHead: 'firstPage',
                tableLineColor: [200, 200, 200],
                tableLineWidth: 0.1,
                didDrawPage: function (data) {
                    // Footer con número de página
                    const pageSize = doc.internal.pageSize
                    const pageHeight = pageSize.height || pageSize.getHeight()
                    const pageCount = doc.internal.getNumberOfPages()
                    const currentPage = doc.internal.getCurrentPageInfo().pageNumber
                    
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(
                        `Página ${currentPage} de ${pageCount}`, 
                        doc.internal.pageSize.width / 2, 
                        pageHeight - 10, 
                        { align: 'center' }
                    )
                }
            })

            isFirstTable = false
        }

        const pdfBlob = doc.output('blob')
        const blobUrl = URL.createObjectURL(pdfBlob)
        window.open(blobUrl, '_blank')
    }

    return (
        <div className={styles.container}>
        <h2 className={styles.title}>Informes de Aportaciones</h2>

        <div className={styles.filters}>
            <label className={styles.label}>
                Año (obligatorio):
                <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className={styles.select}
                >
                    <option value="">-- Seleccione año --</option>
                    {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </label>

            <label className={styles.label}>
                Colegio:
                <select
                    value={searchFilters.id_colegio}
                    onChange={e => handleSearchChange('id_colegio', e.target.value)}
                    className={styles.select}
                >
                    <option value="">Todos</option>
                    {Object.entries(colegios).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </label>

            <label className={styles.label}>
                CI afiliado:
                <input
                    type="text"
                    value={searchFilters.ci}
                    onChange={e => handleSearchChange('ci', e.target.value)}
                    placeholder="CI exacto"
                    className={styles.input}
                />
            </label>

            <button onClick={clearSearch} className={styles.buttonSecondary}>
                Limpiar filtros
            </button>

            <button onClick={generatePDF} className={styles.buttonPrimary}>
                Generar PDF
            </button>
        </div>

        <div className={styles.preview}>
            <p className={styles.previewInfo}>
                Vista previa: {filteredAndSortedMembers.length} registros encontrados
            </p>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>CI</th>
                            <th>Apellidos y Nombres</th>
                            <th>Colegio</th>
                            <th>Total (año)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedMembers.map((m, idx) => {
                            const aporteList = aportes[String(m.id_afiliado)] || []
                            const total = aporteList.reduce((acc, a) => acc + (Number(a.monto) || 0), 0)
                            return (
                                <tr key={m.id_afiliado} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                    <td>{m.ci}</td>
                                    <td>{(m.apellidos || '') + ' ' + (m.nombres || '')}</td>
                                    <td>{colegios[String(m.id_colegio)] || m.nombre_colegio || ''}</td>
                                    <td>{total.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    )
}