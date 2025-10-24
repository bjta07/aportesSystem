import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { aporteApi } from "@/config/api/aportesApi";
import styles from '@/styles/Chart.module.css'

export default function GraficoAportesPorDepartamento() {
  const [data, setData] = useState([]);
  const [anio, setAnio] = useState("2025");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await aporteApi.getAportesByDepartamento(anio);
        if (res.ok && res.data) {
          setData(res.data);
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
      <h2 className={styles.title}>
        Total de Aportes por Departamento ({anio})
      </h2>

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
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="departamento"
                interval={0}
                tick={({ x, y, payload }) => {
                    const words = payload.value.split(" ");
                    return (
                    <text
                        x={x}
                        y={y + 10}
                        textAnchor="middle"
                        fill="#4b5563"
                        fontSize={11}
                        transform={`rotate(-15, ${x}, ${y})`}
                    >
                        {words.map((word, index) => (
                        <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
                            {word}
                        </tspan>
                        ))}
                    </text>
                    );
                }}
                />

              <YAxis tick={{ fill: "#4b5563" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
