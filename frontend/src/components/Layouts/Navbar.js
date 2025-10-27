'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/config/contexts/AuthContext";
import Icon from "../UI/Icons";
import styles from '@/styles/Navbar.module.css';
import { colegioApi } from "@/config/api/colegioApi";

export default function Navbar({ collapsed }) {
    const { user, logout } = useAuth();
    const [subColegios, setSubColegios] = useState([]);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    if (!user) return null;

    const basePath = user.rol === 'admin' ? '/admin' : '/users';

    const adminLinks = [
        { href: `${basePath}`, label: 'Dashboard', icon: 'dashboard' },
        { href: `${basePath}/usuarios`, label: 'Usuarios', icon: 'user' },
        { href: `${basePath}/usuarios/nuevo`, label: 'Crear usuario', icon: 'addUser' },
        { href: `${basePath}/afiliados`, label: 'Afiliados', icon: 'users' },
        { href: `${basePath}/afiliados/nuevo`, label: 'Registrar Afiliado', icon: 'addUser' },
        { href: `${basePath}/informes`, label: 'Informes', icon: 'report' }
    ];

    const userLinks = [
        { href: `${basePath}/`, label: 'Dashboard', icon: 'user' },
        { href: `${basePath}/${user.id_colegio}/afiliados/nuevo`, label: 'Registrar Afiliado', icon: 'addUser' },
        { href: `${basePath}/${user.id_colegio}/afiliados`, label: 'Afiliados', icon: 'users' },
        { href: `${basePath}/${user.id_colegio}/aportes`, label: 'Aportes', icon: 'editCash' },
        { href: `${basePath}/${user.id_colegio}/reports`, label: 'Informes', icon: 'report' }
    ];

    const links = user.rol === 'admin' ? adminLinks : userLinks;

    // 🔹 Obtener subcolegios del usuario
    useEffect(() => {
        const fetchSubColegios = async () => {
            if (user?.id_colegio) {
                try {
                    // Pass only the parent colegio id; the API helper builds the /subcolegio path
                    const response = await colegioApi.getSubColegios(user.id_colegio);
                    setSubColegios(response.data || []);
                } catch (error) {
                    console.error("Error al obtener subcolegios:", error);
                }
            }
        };
        fetchSubColegios();
    }, [user?.id_colegio]);

    const toggleSubmenu = (id) => {
        setOpenSubmenu(openSubmenu === id ? null : id);
    };

    return (
        <div className={`${styles.navContainer} ${collapsed ? styles.collapsed : ""}`}>
            <nav className={styles.nav}>
                <section className={styles.adminLinks}>
                    {!collapsed && <p>{user.rol === 'admin' ? 'General (Admin)' : 'General (Usuario)'}</p>}
                    <ul className={styles.linkContainer}>
                        {links.map(link => (
                            <li key={link.href} className={styles.linkItem}>
                                <Icon name={link.icon} fill />
                                {!collapsed && <Link href={link.href}>{link.label}</Link>}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 🔹 Submenú de colegios */}
                {user.rol !== 'admin' && subColegios.length > 0 && (
                    <section className={styles.submenuSection}>
                        {!collapsed && <p>Subcolegios</p>}
                        <ul className={styles.linkContainer}>
                            {subColegios.map(sub => (
                                <li key={sub.id_colegio} className={styles.linkItem}>
                                    <div onClick={() => toggleSubmenu(sub.id_colegio)} className={styles.submenuHeader}>
                                        <Icon name='folder' fill />
                                        {!collapsed && <span>{sub.nombre}</span>}
                                    </div>
                                    {openSubmenu === sub.id_colegio && !collapsed && (
                                        <ul className={styles.submenu}>
                                            <li>
                                                <Link href={`${basePath}/${sub.id_colegio}/afiliados`}>
                                                    <Icon name='users' /> Afiliados
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`${basePath}/${sub.id_colegio}/aportes`}>
                                                    <Icon name='editCash' /> Aportes
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`${basePath}/${sub.id_colegio}/reports`}>
                                                    <Icon name='report' /> Informes
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className={styles.settings}>
                    {!collapsed && <p>Administra tu Perfil</p>}
                    <ul className={styles.linkContainer}>
                        <li className={styles.linkItem}>
                            <Icon name='profile' fill />
                            {!collapsed && <Link href={`${basePath}/profile`}>Profile</Link>}
                        </li>
                        <li className={styles.linkItem} onClick={logout}>
                            <Icon name='logout' fill />
                            {!collapsed && "Log Out"}
                        </li>
                    </ul>
                </section>
            </nav>
        </div>
    );
}
