import Link from "next/link";
import { useAuth } from "@/config/contexts/AuthContext";
import Icon from "../UI/Icons";
import styles from '@/styles/Navbar.module.css'

export default function Navbar({ collapsed }){
    const { user, logout } = useAuth()

    if (!user) return null

    const basePath = user.rol === 'admin' ? '/admin' : '/users'

    const adminLinks = [
        { href: `${basePath}`, label: 'Dashboard', icon: 'dashboard'},
        { href: `${basePath}/usuarios`, label: 'Usuarios', icon: 'user'},
        { href: `${basePath}/usuarios/nuevo`, label: 'Crear usuario', icon: 'addUser'},
        { href: `${basePath}/afiliados`, label: 'Afiliados', icon: 'users'},
        { href: `${basePath}/afiliados/nuevo`, label: 'Registrar Afiliado', icon: 'addUsers'},
        { href: `${basePath}/informes`, label: 'Informes', icon: 'editCash'}
    ]

    const userLinks = [
        { href: `${basePath}/${user.id_colegio}`, label: 'Dashboard', icon: 'user'},
        { href: `${basePath}/${user.id_colegio}/afiliados/nuevo`, label: 'Registrar Afiliado', icon: 'users'},
        { href: `${basePath}/${user.id_colegio}/afiliados`, label: 'Afiliados', icon: 'users'},
        { href: `${basePath}/${user.id_colegio}/aportes`, label: 'Aportes', icon: 'editCash'},
        { href: `${basePath}/${user.id_colegio}/reports`, label: 'Informes', icon: 'report'}
    ]

    const links = user.rol === 'admin' ? adminLinks : userLinks

    return (
        <div className={`${styles.navContainer} ${collapsed ? styles.collapsed : ""}`}>
            <nav className={styles.nav}>
                <section className={styles.adminLinks}>
                    {!collapsed && <p>{user.rol === 'admin' ? 'General (Admin)' : 'General (usuario)'}</p>}
                    <ul className={styles.linkContainer}>
                        {links.map(link => (
                            <li key={link.href} className={styles.linkItem}>
                                <Icon name={link.icon} fill/>
                                {!collapsed && <Link href={link.href}>{link.label}</Link>}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className={styles.settings}>
                    {!collapsed && <p>Administra tu Perfil</p>}
                    <ul className={styles.linkContainer}>
                        <li className={styles.linkItem}>
                            <Icon name='profile' fill/>
                            {!collapsed && <Link href={`${basePath}/profile`}>Profile</Link>}
                        </li>
                        <li className={styles.linkItem} onClick={logout}>
                            <Icon name='logout' fill/>
                            {!collapsed && "Log Out"}
                        </li>
                    </ul>
                </section>
            </nav>

        </div>
    )
}