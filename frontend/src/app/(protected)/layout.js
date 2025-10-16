'use client'

import { useAuth } from "@/config/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "@/components/Layouts/Header"
import Navbar from "@/components/Layouts/Navbar"
import Icon from "@/components/UI/Icons"
import styles from '@/styles/Layout.module.css'

export default function ProtectedLayout({ children}) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        // If not loading and there's no user, redirect to login
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div>
                <p>Cargando...</p>
            </div>
        )
    }

    if(!user) return null

    return (
        <div className={styles.main} style={{ gridTemplateColumns: collapsed ? '70px 1fr' : '250px 1fr'}}>
            <div className={styles.header}>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <Icon name='expand' fill /> : <Icon name='collapse' fill />}
                </button>
                <Header/>
            </div>
            <div className={styles.sidebar}>
                <Navbar collapsed={collapsed}/>
            </div>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    )

}
