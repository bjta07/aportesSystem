import { useState } from "react";
import styles from '@/styles/BulkUploadModal.module.css'
import { aporteApi } from "@/config/api/aportesApi";

export default function SubirAportes({
    isOpen, onClose
}){
    const [file, setFile] = useState(null)
  const [resultados, setResultados] = useState([])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) {
      alert("Seleccione un archivo")
      return
    }

    const aporteData = new FormData()
    aporteData.append("file", file)

    try {
      const data = await aporteApi.uploadAporte(aporteData)
      
      if (data.ok) {
        setResultados(data.resultados)
        alert("Aportes cargados exitosamente")
      } else {
        alert(`Error en la carga: ${data.error}`)
      }
    } catch (err) {
      console.error("Error al subir archivo:", err)
      alert(`Error al subir archivo: ${err.message}`)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Subir Aportes desde Excel/CSV</h2>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className={styles.input} />
        <div className={styles.modalActions}>
          <button onClick={handleUpload} className={styles.saveButton}>Subir</button>
          <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
        </div>

        {resultados.length > 0 && (
          <div className={styles.results}>
            <h3>Resultados:</h3>
            <ul>
              {resultados.map((r, idx) => (
                <li key={idx}>
                  CI: {r.ci} {r.nombres} {r.apellidos} - {r.status} {r.message && `(${r.message})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
