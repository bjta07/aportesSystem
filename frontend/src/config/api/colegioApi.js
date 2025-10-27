import { fetchApi } from "./apiClient";

const getAllColegios = async () => {
    return await fetchApi('colegio', {method: 'GET'})
}

const getColegioById = async (id_colegio) => {
    return await fetchApi(`colegio/${id_colegio}`, { method: 'GET'})
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