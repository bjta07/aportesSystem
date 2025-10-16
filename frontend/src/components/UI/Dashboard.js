'use client'

import { useAuth } from "@/config/contexts/AuthContext"
import Link from "next/link"
import styles from '@/styles/Dashboard.module.css'

export default function UserDashboard(){
    const { user } = useAuth()

    return (
        <div className={styles.main}>
            <h1 className={styles.title}>Panel de usuario</h1>
            <div className={styles.userCard}>
                <div className={styles.userInfoLeft}>
                    <h2>👋 !Bienvenido, {user.nombre}</h2>
                    <p>
                        <span>Usuario: </span> {user.usuario}
                    </p>
                </div>
                <div className={styles.userInfoRight}>
                    <p>
                        <span className={styles.label}>Rol:</span> {user?.rol == 'admin' ? 'Administrador': 'usuario'}
                    </p>
                    <p>
                        <span className={styles.label}>Colegio:</span> {user.rol == 'admin' ? `Todos los Colegios`: `${user.id_colegio.nombre}`}
                    </p>
                </div>
            </div>
        </div>
    )
}