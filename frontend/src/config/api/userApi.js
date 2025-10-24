import { fetchApi } from "./apiClient";

export const authApi = {
    login: (credentials) => fetchApi('users/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    register: (userData) => fetchApi('users/register',{
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    getProfile: () => fetchApi('users/profile'),

    findAll: async () => {
        try {
            const response = await fetchApi('users')
            if (response && response.data) {
                return {
                    ok: true,
                    data: Array.isArray(response.data) ? response.data : [response.data]
                }
            }

            if (Array.isArray(response)) {
                return{
                    ok: true,
                    data: response
                }
            }

            throw new Error('Formato de respuesta invalido')
        } catch (error) {
            console.error('Error en findAll: ', error)
            throw error
        }
    },

    updateUser: (userId, userData) => fetchApi(`users/${userId}`,{
        method: 'PUT',
        body: JSON.stringify(userData)
    }),

    deleteUser: async (userId) => {
    try {
        const response = await fetchApi(`users/${userId}`, {
            method: 'DELETE'
        });

        console.log('[authApi.deleteUser] response from fetchApi:', response)

        // Si el backend devuelve algo como { ok: true, msg: '...' } o similar
        const message = response?.msg || response?.message || 'Usuario eliminado con éxito'
        return {
            ok: true,
            message
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error)
        return {
            ok: false,
            message: error.message || 'No se pudo eliminar el usuario'
        }
    }
    },

    updateProfile: (userId, profileData) => fetchApi(`users/${userId}/profile`,{
        method: 'PUT',
        body: JSON.stringify(profileData)
    }),

    updatePassword: (userId, passwordData) => fetchApi(`users/${userId}/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordData)
    })
}

export default authApi