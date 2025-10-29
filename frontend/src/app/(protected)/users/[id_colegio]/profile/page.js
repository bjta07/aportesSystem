'use client'

import { use, useEffect, useState } from "react"
import authApi from "@/config/api/userApi"
import { useAuth } from "@/config/contexts/AuthContext"
import Icon from "@/components/UI/Icons"
import styles from '@/styles/Profile.module.css'

export default function ProfilePage() {
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const [profileData, setProfileData] = useState({
        usuario: user?.usuario || '',
        email: user?.email || ''
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        })
    }

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        })
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            const response = await authApi.updateProfile(user.id_usuario, {
                usuario: profileData.usuario,
                email: profileData.email,
                apellidos: user.apellidos,
                nombre: user.nombre
            })

            if (response && response.ok) {
                updateUser(response.data)
                setSuccess('Perfil actualizado correctamente')
                setIsEditing(false)
            }
        } catch (error) {
            setError(error.message || 'Error al actualizar el perfil')
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas nuevas no coinciden')
            return
        }

        try {
            const response = await authApi.updatePassword(user.id_usuario, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            if (response && response.ok) {
                setSuccess('Contraseña actualizada correctamente')
                setIsChangingPassword(false)
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            }
        } catch (error) {
            setError(error.message || 'Error al actualizar la contraseña')
        }
    }

    return(
        <div className={styles.profileContainer}>
            <h2 className={styles.title}>Mi Perfil</h2>
            
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.infoSection}>
                <div className={styles.field}>
                    <label>Nombre</label>
                    <span>{user?.nombre}</span>
                </div>
                <div className={styles.field}>
                    <label>apellidos</label>
                    <span>{user?.apellidos}</span>
                </div>
            </div>

            {isEditing ? (
                <form onSubmit={handleProfileSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Nombre de usuario:</label>
                        <input
                            type="text"
                            name="usuario"
                            value={profileData.usuario}
                            onChange={handleProfileChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.saveButton}>
                            <Icon name="save" fill/>
                            Guardar Cambios
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className={styles.cancelButton}
                        >
                            <Icon name="cancel" fill/>
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                >
                    <Icon name="edit" fill/>
                    Editar Perfil
                </button>
            )}

            <div className={styles.passwordSection}>
                {isChangingPassword ? (
                    <form onSubmit={handlePasswordSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Contraseña Actual:</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nueva Contraseña:</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Confirmar Nueva Contraseña:</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.saveButton}>
                                <Icon name="savePassword" fill/>
                                Cambiar Contraseña
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                                className={styles.cancelButton}
                            >
                                <Icon name="cancel" fill/>
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsChangingPassword(true)}
                        className={styles.passwordButton}
                    >
                        <Icon name="editPassword" fill/>
                        Cambiar Contraseña
                    </button>
                )}
            </div>
        </div>
    )
}