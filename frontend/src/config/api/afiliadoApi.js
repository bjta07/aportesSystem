import { fetchApi } from "./apiClient";
import { fetchApiUpload } from "./apiClient";

export const memberApi = {
    registerMember: async(memberData) => fetchApi('members',{
        method: 'POST',
        body: JSON.stringify(memberData)
    }),

    updateMember: async(id, memberData) => fetchApi(`members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData)
    }),

    getAllMembers: async() => {
        try {
            const response = await fetchApi('members')

            if (response && response.data) {
                console.log(response)
                return{
                    ok: true,
                    data: Array.isArray(response.data) ? response.data : [response.data]
                    
                }
            }

            if (Array.isArray(response)) {
                return {
                    ok: true,
                    data: response
                }
            }
            throw new Error('Formato de respuesta invalido')
        } catch (error) {
            console.error('Error en findAll', error)
            throw error
        }
    },

    getByCi: async(ci) => {
        try {
            const response = await fetchApi(`members/ci/${ci}`)

            if (response && response.data) {
                return{
                    ok: true,
                    data: response.data
                }
            }

            if (response) {
                return{
                    ok: true,
                    data: response
                }
            }
            throw new Error('No se encontro ningun afiliado')
        } catch (error) {
            console.error('Error en getByCi', error)
            throw error
        }
    },

    getByCity: async(id_colegio) => {
        try {
            const response = await fetchApi(`members/colegio/${id_colegio}`)
            if (response && response.data) {
                return{
                    ok: true,
                    data: response.data
                }
            }

            if (response) {
                return{
                    ok: true,
                    data: response
                }
            }
            throw new Error('No se encontro el colegio')
        } catch (error) {
            console.error('Error en getByCity', error)
            throw error
        }
    },

    registerEspecialidad: async(especialidadData) => fetchApi('members/especialidades', {
        method: 'POST',
        body: JSON.stringify(especialidadData)
    }),

    getEspecialidadByAfiliado: async(id_afiliado) => {
        try {
            const response = await fetchApi(`members/especialidades/${id_afiliado}`)

            if (response && response.data) {
                return {
                    ok: true,
                    data: response.data
                };
            }

            if (response) {
                return {
                    ok: true,
                    data: response
                };
            }

            throw new Error('No se encontró ningua especialidad para este afiliado');
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    deleteMember: async(id_afiliado) => {
        try {
            const response = await fetchApi(`members/${id_afiliado}`,{
                method: 'DELETE'
            })
            const message = response?.msg || response?.message || 'Afiliado eliminado correctamente'
            return {
                ok: true,
                message
            }
        } catch (error) {
            console.error('Error al eliminar afiliado', error)
            return {
                ok: false,
                message: error.message || 'No se pudo eliminar al usuario'
            }
        }
    },

    deleteEspecialidad: async(id_afiliado_especialidad) => {
        try {
            const response = await fetchApi(`members/especialidades/${id_afiliado_especialidad}`,{
                method: 'DELETE'
            })
            const message = response?.msg || response?.message || 'Afiliado eliminado correctamente'
            return {
                ok: true,
                message
            }
        } catch (error) {
            console.error('Error al eliminar afiliado', error)
            return {
                ok: false,
                message: error.message || 'No se pudo eliminar al usuario'
            }
        }
    },

    uploadMember: async(formData) => {
        return fetchApiUpload('members/bulk-upload', formData)
    }
}

export default memberApi