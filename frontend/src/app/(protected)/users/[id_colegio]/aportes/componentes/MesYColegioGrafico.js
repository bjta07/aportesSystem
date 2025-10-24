import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { aporteApi } from "@/config/api/aportesApi";
import { useAuth } from "@/config/contexts/AuthContext";
import styles from "@/styles/Chart.module.css";

export default function GraficoAportesPorMesYColegio() {
    const { user } = useAuth()
    const initialColegio = user?.id_colegio ? String(user.id_colegio): "1"
  const [data, setData] = useState([]);
  const [anio, setAnio] = useState("2025");
  const [idColegio, setIdColegio] = useState(initialColegio);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        if (!idColegio) return
        setLoading(true);
      try {
        const res = await aporteApi.getAportesByMesYColegio(anio, idColegio);
        if (res.ok && res.data) {
          const formatted = res.data.map(item => ({
            mes: item.mes,
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
  }, [anio, idColegio]);

  return (
    <div className={styles.chartContainer}>
      <h2 className={styles.title}>Aportes Mensuales ({anio}) - {user.nombre_colegio}</h2>

      <div className={styles.controls}>
        <label className={styles.label}>Año:</label>
        <select value={anio} onChange={(e) => setAnio(e.target.value)} className={styles.select}>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
      </div>
        {user?.rol !== 'admin' && <p>Colegio: {idColegio} </p>}
      {loading ? (
        <p className={styles.loading}>Cargando datos...</p>
      ) : (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
