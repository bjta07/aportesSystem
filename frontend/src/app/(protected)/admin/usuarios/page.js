'use client'

import { useAuth } from "@/config/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Icon from "@/components/UI/Icons"
import authApi from "@/config/api/userApi"
import styles from '@/styles/UsersTable.module.css'
import UserModal from "./components/Modal"
import { toast } from 'sonner';

export default function UsersPage() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null)
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null) 
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { user: currentUser } = useAuth()
    const currentDeleteRef = useRef({ userId: null, promise: null })


    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login')
            } else if (user?.rol !== 'admin') {
                router.push('/users') 
            }
        }
    }, [loading, isAuthenticated, user, router])

    const handleEditClick = (user) => {
        setSelectedUser(user) 
        setIsModalOpen(true)
    }

    const handleSave = async(updatedUserData) => {
        const promise = (async () => {
            try {
                const response = await authApi.updateUser(selectedUser.id_usuario, updatedUserData)
                // authApi.updateUser returns parsed JSON or throws; normalize
                if (response && (response.ok || response.success || response.id_usuario)) {
                    // update local state
                    setUsers(prevUsers => prevUsers.map(u => 
                        u.id_usuario === selectedUser.id_usuario ? { ...u, ...updatedUserData } : u
                    ));
                    return `Usuario ${updatedUserData.nombre} actualizado con éxito.`
                }
                // try to extract message
                const msg = response?.message || response?.error || 'Fallo al actualizar el usuario.'
                throw new Error(msg)
            } catch (error) {
                throw new Error(error.message || 'Error de conexión al actualizar el usuario.')
            }
        })()

        toast.promise(promise, {
            loading: 'Actualizando usuario...',
            success: (message) => {
                setIsModalOpen(false);
                setSelectedUser(null);
                return message;
            },
            error: (error) => {
                return error.message;
            }
        });
    }

    const handleDelete = async (userId, userName) => {
        // If there's already a delete in progress for this user, return the same promise
        if (currentDeleteRef.current.userId === userId && currentDeleteRef.current.promise) {
            return currentDeleteRef.current.promise
        }

        console.log('handleDelete called for:', userId, userName)

        const deletePromise = (async () => {
            try {
                const response = await authApi.deleteUser(userId)
                if (response && response.ok) {
                    setUsers(prevUsers => prevUsers.filter(u => u.id_usuario !== userId))
                    return `Usuario ${userName} eliminado con exito `
                }
                const msg = response?.message || 'Fallo al eliminar el usuario'
                throw new Error(msg)
            } catch (error) {
                throw new Error(error.message || 'Error de conexion al eliminar el usuario')
            }
        })()

        // Store current deletion so repeated calls reuse the same promise
        currentDeleteRef.current = { userId, promise: deletePromise }

        toast.promise(deletePromise, {
            loading: 'Eliminando usuario...',
            success: (message) => {
                setIsModalOpen(false)
                setSelectedUser(null)
                return message
            },
            error: (error) => {
                return error.message
            }
        })

        // Clear currentDeleteRef when settled
        deletePromise.finally(() => {
            if (currentDeleteRef.current && currentDeleteRef.current.userId === userId) {
                currentDeleteRef.current = { userId: null, promise: null }
            }
        })

        return deletePromise
    }

    useEffect(() => {
        const fetchUsers = async() => {
            setLoadingUsers(true)
            try {
                const response = await authApi.findAll()

                if (response && response.data && Array.isArray(response.data)) {
                    setUsers(response.data)
                    setError(null)
                } else {
                    console.error('Estructura de respuesta inesperada: ', response)
                    throw new Error('Formato de respuesta inválido o sin datos.')
                }
            } catch (error) {
                console.error('Error al obtener usuarios: ', error)
                toast.error('Error al cargar la lista de usuarios: ' + error.message); 
                setError(error.message)
            } finally{
                setLoadingUsers(false)
            }
        }

        if(currentUser && (currentUser.rol === 'admin')){
            fetchUsers()
        }else if (!loading && isAuthenticated) {

            setError('No tienes permisos para ver esta información');
            setLoadingUsers(false);
        }
    }, [currentUser, loading, isAuthenticated])

    if(loading || loadingUsers) return <p>Cargando usuarios...</p>
    if(error && !users.length) return <p style={{ color: 'red' }}>Error: {error}</p>

    return(
        <div className={styles.tableContainer}>
            <h1 className={styles.tableTitle}>Gestión de Usuarios</h1>
            <table className={styles.table}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <th className={styles.centered}>ID</th>
                        <th className={styles.centered}>Nombres</th>
                        <th className={styles.centered}>Apellidos</th>
                        <th className={styles.centered}>Usuario</th>
                        <th className={styles.centered}>Rol</th>
                        <th className={styles.centered}>Colegio</th>
                        <th className={styles.centered}>Acciones</th> 
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map(user => (

                            <tr key={user.id_usuario} className={styles.tableRow}> 
                                <td>{user.id_usuario}</td>
                                <td>{user.nombre}</td>
                                <td>{user.apellidos}</td>
                                <td>{user.usuario}</td>
                                <td style={{textAlign: 'center'}}>
                                    <span className={user.rol === 'admin' ? styles.adminBadge : styles.userBadge}>
                                        {user.rol === 'admin' ? 'Admin': 'Usuario'}
                                    </span>
                                </td>

                                <td>{user.nombre_colegio || 'Admin'}</td> 
                                
                                <td className={styles.actionCell}>
                                    <button onClick={() => handleEditClick(user)} className={styles.editButton}>
                                        <Icon name="edit" fill/>
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ): (
                        <tr>
                            <td colSpan="7" className={styles.noData}>
                                {loadingUsers ? 'Cargando...' : 'No hay usuarios para mostrar'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <UserModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    )
}