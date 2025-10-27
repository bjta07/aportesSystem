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
    const { user: currentUser } = useAuth()

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

        const colegios = {
        "1": "Colegio departamental de La Paz",
        "2": "Colegio departamental de Oruro",
        "3": "Colegio departamental de Cochabamba",
        "4": "Colegio departamental de Santa Cruz",
        "5": "Colegio departamental de Tarija",
        "6": "Colegio departamental de Potosi",
        "7": "Colegio departamental de Beni",
        "8": "Colegio departamental de Pando",
        "9": "Colegio departamental de Chuquisaca",
        "10": "Colegio regional de El Alto",
        "11": "Colegio regional de Camiri",
        "12": "Colegio regional de Tupiza",
        "13": "Colegio regional de Catavi",
        "14": "Colegio regional de Riberalta",
        "15": "Colegio regional de Yacuiba"
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
    let filtered = members

    const ciFilter = String(searchFilters.ci || '').trim()
    if (ciFilter !== '') {
        filtered = filtered.filter(member => {
            const memberCi = String(member.ci || '').trim()
            // comparación parcial (contiene) y sin diferenciar espacios; si quieres exacta, usa ===
            return memberCi.includes(ciFilter)
        })
    }

    return filtered.sort((a,b) => (a.apellidos || '').localeCompare(b.apellidos || ''))
}, [members, searchFilters])

    useEffect(() => {
    const fetchMembers = async () => {
        setLoading(true)
        try {
            const response = await memberApi.getByCity(currentUser.id_colegio)

            if (response?.ok && Array.isArray(response.data)) {
                // Filtramos miembros del mismo colegio (por seguridad)
                const filtered = response.data.filter(m => m.id_colegio === currentUser.id_colegio)
                setMembers(filtered)
            } else {
                setError('No se encontraron afiliados para este colegio')
            }
        } catch (error) {
            setError('No se pudo cargar la lista de afiliados')
        } finally {
            setLoading(false)
        }
    }

    if (currentUser?.id_colegio) {
        fetchMembers()
    }
}, [currentUser?.id_colegio])

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const response = await aporteApi.getYears()
                if (response?.years){
                    setAvailableYears(response.years)
                }
            } catch (error) {
                console.error('Error al obtener los años disponibles', error)
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

                for (const member of members) {
                    aportesPorMiembro[member.id_afiliado] = []
                }
                for (const aporte of allAportesForSelectedYear) {
                    if (aportesPorMiembro[String(aporte.id_afiliado)]) {
                        aportesPorMiembro[String(aporte.id_afiliado)].push(aporte)
                    }
                }
                setAportes(aportesPorMiembro)
            } catch (error) {
                console.error('Error al obtener aportes por año', error)
            }
        }
        if (members.length > 0) fetchAportesForYear()
    }, [members, selectedYear])

    const formatDateTime = (date = new Date ()) => {
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

const generateAfiliadosPDF = async (members, currentUser) => {
  try {
    if (!members?.length) {
      alert("No hay afiliados para generar el PDF.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });

    // 🧾 Encabezado del PDF
    doc.setFontSize(16);
    doc.text("LISTADO DE AFILIADOS", 14, 15);

    doc.setFontSize(11);
    doc.text(`Colegio: ${currentUser?.nombre_colegio || 'Sin definir'}`, 14, 23);
    doc.text(`Generado por: ${currentUser?.nombre || ''}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 37);

    // 📋 Obtenemos las especialidades de cada afiliado
    const afiliadosConEspecialidades = await Promise.all(
      members.map(async (m) => {
        let especialidad = "Sin especialidad";

        try {
          const res = await memberApi.getEspecialidadByAfiliado(m.id_afiliado);

          if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
            // concatenamos todas las especialidades encontradas
            especialidad = res.data.map((e) => e.especialidad).join(", ");
          }
        } catch (error) {
          console.error(`Error al obtener especialidad de ${m.nombres}:`, error);
        }

        return {
          matricula_profesional: m.matricula_profesional || "",
          nro_registro_colegio: m.nro_registro_colegio || "",
          nombres: m.nombres || "",
          apellidos: m.apellidos || "",
          ci: m.ci || "",
          fecha_afiliacion_formateada: m.fecha_afiliacion_formateada || "",
          especialidad, // ✅ aquí guardamos la variable correcta
          email: m.email || "",
          celular: m.celular || "",
        };
      })
    );

    // 🧠 Convertimos los datos para la tabla
    const tableData = afiliadosConEspecialidades.map((a) => [
      a.matricula_profesional,
      a.nro_registro_colegio,
      a.nombres,
      a.apellidos,
      a.ci,
      a.fecha_afiliacion_formateada,
      a.especialidad, // ✅ corregido
      a.email,
      a.celular,
    ]);

    // 🧾 Generamos la tabla
    autoTable(doc, {
  startY: 45,
  head: [
    [
      "Mat-Prof",
      "N°-Reg",
      "Nombres",
      "Apellidos",
      "CI",
      "Fecha de Afiliación",
      "Especialidad",
      "Email",
      "Celular",
    ],
  ],
  body: tableData,
  styles: {
    fontSize: 9,
    cellPadding: 2,
    lineColor: [220, 220, 220],
  },
  headStyles: {
    fillColor: [41, 128, 185],
    textColor: 255,
    fontStyle: "bold",
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245],
  },
  margin: { left: 10, right: 10 },

  // 👇 Aquí defines el ancho de columnas específicas
  columnStyles: {
    0: { cellWidth: 20, halign: "center" }, // Mat-Prof
    1: { cellWidth: 20, halign: "center" },
    5: { halign: "center" }, // N°-Reg
  },
});


    // 📤 Mostrar PDF
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  } catch (error) {
    console.error("Error al generar PDF de afiliados:", error);
    alert("Ocurrió un error al generar el PDF.");
  }
};


    const generatePDF = () => {
        if (!selectedYear) {
            alert('Debe seleccionar un año para generar el informe')
            return
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4'})
        const title = `Informe de aportes del - Año ${selectedYear}`
        const printedBy = currentUser ? `${currentUser.nombre}` : 'usuario desconocido'
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
        <h2 className={styles.title}>Informes de Aportes</h2>

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

            <button
                onClick={() => generateAfiliadosPDF(members, currentUser)}
                className={styles.buttonSecondary}
            >
                Generar Lista de Afiliados
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