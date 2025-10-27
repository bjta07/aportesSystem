import { fetchApi } from "./apiClient";
import { fetchApiUpload } from "./apiClient";

export const aporteApi = {
    createAporte: async (aporteData) => {
        const token = localStorage.getItem('token')
        if (!token) {
            throw new Error('No hay sesion activa, inicie sesion')
        }
        return fetchApi('aportes', {
            method: 'POST',
            body: JSON.stringify(aporteData)
        })
    },

    uploadAporte: async (aporteData) => {
        return fetchApiUpload('aportes/uploadAporte', aporteData)
    },

    updateAporte: (aporteId, aporteData) => fetchApi(`aportes/${aporteId}`, {
        method: 'PUT',
        body: JSON.stringify(aporteData)
    }),

    getAllAportes: async (page = 1, limit = 10) => {
        return fetchApi(`aportes?page=${page}&limit=${limit}`, {
            method: 'GET'
        })
    },

    getAportesByAfiliado: async (afiliadoId, { page = 1, limit = 10}= {}) => {
        if (!afiliadoId || afiliadoId === 'undefined' || afiliadoId === 'null') {
            throw new Error('Id de afiliado no valido')
        }
        return fetchApi(`aportes/afiliado/${afiliadoId}?page=${page}&limit=${limit}`,{
            method: 'GET'
        })
    },

    getYearsAndAportes: async (anio) => {
        const url = anio 
        ? `aportes/anios-aportes?anio=${anio}`
        : `aportes/anios-aportes`
        return fetchApi(url, { method: 'GET' })
    },

    getYears: async() => {
        return fetchApi(`aportes/anios`, {
            method: 'GET'
        })
    },

    removeAporte: async (aporteId) => {
        return fetchApi(`aportes/${aporteId}`, {
            method: 'DELETE'
        });
    },

    getAportesByDepartamento: async (anio) => {
        const url = anio
        ? `aportes/departamentos?anio=${anio}`
        : 'aportes/departamentos'
        return fetchApi(url, { method: 'GET' })
    },

    getAportesByMes: async (anio) => {
        const url = anio
            ? `aportes/meses?anio=${anio}`
            : 'aportes/meses'
        return fetchApi(url, { method: 'GET' })
    },

    getAportesByMesYColegio: async (anio, id_colegio) => {
        const url = `aportes/meses-colegio?anio=${anio}&id_colegio=${id_colegio}`
        return fetchApi(url, { method: 'GET'})
    }
}