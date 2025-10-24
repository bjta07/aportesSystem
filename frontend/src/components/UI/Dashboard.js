'use client'

import { useAuth } from "@/config/contexts/AuthContext"
import Link from "next/link"
import styles from '@/styles/Dashboard.module.css'
import authApi from "@/config/api/userApi"
import GraficoAportesPorDepartamento from "@/app/(protected)/admin/afiliados/componentes/Graficos"
import GraficoAportesPorMes from "@/app/(protected)/users/[id_colegio]/aportes/componentes/Graficos"
import GraficoAportesPorMesYColegio from "@/app/(protected)/users/[id_colegio]/aportes/componentes/MesYColegioGrafico"
import { useEffect, useState } from "react"

export default function UserDashboard() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)

    // 🔹 Obtenemos el perfil completo del usuario (si lo necesitas)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authApi.getProfile()
                if (res.ok && res.data) {
                    setProfile(res.data)
                }
            } catch (error) {
                console.error("Error al obtener perfil:", error)
            }
        }
        fetchProfile()
    }, [])

    // 🔹 Render condicional según el rol
    const renderCharts = () => {
        if (user?.rol === "admin") {
            return (
                <>
                    <div className={styles.chartSection}>
                        <GraficoAportesPorDepartamento />
                    </div>
                    <div className={styles.chartSection}>
                        <GraficoAportesPorMes />
                    </div>
                </>
            )
        } else if (user?.rol === "user") {
            return (
                <div className={styles.chartSection}>
                    <GraficoAportesPorMesYColegio />
                </div>
            )
        } else {
            return <p className={styles.infoText}>Rol no reconocido.</p>
        }
    }

    return (
        <div className={styles.main}>
            <h1 className={styles.title}>Panel de usuario</h1>

            <div className={styles.userCard}>
                <div className={styles.userInfoLeft}>
                    <h2>👋 ¡Bienvenido, {user?.nombre}!</h2>
                    <p>
                        <span>Usuario:</span> {user?.usuario}
                    </p>
                </div>
                <div className={styles.userInfoRight}>
                    <p>
                        <span className={styles.label}>Rol:</span>{" "}
                        {user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                    </p>
                    <p>
                        <span className={styles.label}>Colegio:</span>{" "}
                        {user?.rol === 'admin'
                            ? "Todos los colegios"
                            : profile?.nombre_colegio || "Sin asignar"}
                    </p>
                </div>
            </div>

            {/* 🔹 Gráficos según el rol */}
            {renderCharts()}
        </div>
    )
}
