import { fetchApi } from "./apiClient";

const getAllColegios = async () => {
    return await fetchApi('colegio', {method: 'GET'})
}

const getColegioById = async (id_colegio) => {
    try {
            const response = await fetchApi(`/colegio/${id_colegio}`)

            // ⚠️ Si fetchApi ya devuelve JSON, response será el objeto de datos directamente
            // Si fetchApi devuelve Response (de fetch), parseamos a JSON aquí
            if (response && response.ok === false) {
                throw new Error('Error al obtener el colegio')
            }

            // Si el backend devuelve { ok: true, data: { ... } }
            if (response?.data) {
                return response.data
            }

            // Si el backend devuelve directamente el objeto del colegio
            return response
        } catch (error) {
            console.error("Error en getColegioById:", error)
            throw error
        }
}

const getSubColegios = async (id_colegio_padre) => {
    return await fetchApi(`colegio/${id_colegio_padre}/subcolegio`, { method: 'GET'})
}

const createColegio = async (data) => {
    return await fetchApi('colegio', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export const colegioApi = {
    getAllColegios,
    getColegioById,
    getSubColegios,
    createColegio
}