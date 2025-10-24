import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { aporteApi } from "@/config/api/aportesApi";
import styles from "@/styles/Chart.module.css"

export default function GraficoAportesPorMes() {
  const [data, setData] = useState([]);
  const [anio, setAnio] = useState("2025");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await aporteApi.getAportesByMes(anio);
        if (res.ok && res.data) {
          const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ];
          const formatted = res.data.map(item => ({
            mes: meses[item.mes - 1],
            total: Number(item.total)
          }));
          setData(formatted);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error al obtener los datos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [anio]);

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>Total de Aportes por Mes ({anio})</h2>

      <div className={styles.controls}>
        <label className={styles.label}>Año:</label>
        <select
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          className={styles.select}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando datos...</p>
      ) : data.length === 0 ? (
        <p className={styles.noData}>No hay datos disponibles para este año.</p>
      ) : (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
