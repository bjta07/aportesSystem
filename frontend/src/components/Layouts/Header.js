import Image from "next/image"
import styles from '@/styles/Header.module.css'

export default function Header(){
    return(
        <header className={styles.header}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>
                    SISTEMA DE APORTES<br />
                    COLEGIO NACIONAL DE ENFERMERAS DE BOLIVIA
                </h1>
            </div>
            <Image
                src='/logos/logo.png'
                width={90}
                height={90}
                alt="Logo"
                className={styles.logo}
            />
        </header>
    )
}
