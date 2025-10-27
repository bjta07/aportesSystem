const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:4000';

export async function fetchApi(url, options = {}){
    if (!API_HOST) {
        throw new Error('API_HOST no esta definido')
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const defaultHeaders = {
        'Content-Type' : 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}`})
    }
    const apiUrl = `${API_HOST}/api/${url}`.replace(/([^:]\/)\/+/g, "$1")
    console.log('🚀 Fetching: ', apiUrl)
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    }

    console.log('[apiClient] Request config:', { method: config.method || 'GET', headers: config.headers })

    try {
        // Wrap fetch with a timeout so we can detect hangs
        const fetchPromise = fetch(apiUrl, config)
        const timeoutMs = 12000
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
        let response
        try {
            response = await Promise.race([fetchPromise, timeoutPromise])
        } catch (err) {
            console.error('[apiClient] fetch error or timeout:', err)
            throw err
        }
        console.log('[apiClient] fetch resolved for:', apiUrl)
        // Try to parse JSON when possible. Some endpoints may return 204 or
        // omit content-type; handle both cases gracefully and include raw
        // text in the error diagnostics when JSON parsing fails.
        let data = null
        try {
            // If no content (204) fetch.json() may throw; handle it.
            data = await response.json()
        } catch (err) {
            // Attempt to get raw text to aid debugging
            try {
                const text = await response.text()
                data = text || null
                console.warn('[apiClient] Response is not JSON, raw text:', text)
            } catch (textErr) {
                data = null
            }
        }

        console.log('[apiClient] Response status:', response.status, 'data:', data)

        if (!response.ok) {
            const errorMsg = (data && typeof data === 'object' && (data.error || data.message)) ||
                (typeof data === 'string' ? data : 'Error en la solicitud')
            console.error('Error de API', { status: response.status, message: errorMsg, data })
            const err = new Error(errorMsg)
            err.status = response.status
            err.data = data
            throw err
        }

        return data
    } catch (error) {
        console.error('Error en fetchApi', error)
        throw error
    }
}

export async function fetchApiUpload(url, formData) {
    if (!API_HOST) {
        throw new Error('API_HOST no esta definido')
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const defaultHeaders = {
        ...(token && { Authorization: `Bearer ${token}`})
    }

        const apiUrl = `${API_HOST}/api/${url}`.replace(/([^:]\/)\/+/g, "$1")
    console.log('🚀 Uploading to: ', apiUrl)

    const config = {
        method: 'POST',
        headers: defaultHeaders,
        body: formData
    }

    try {
        const response = await fetch(apiUrl, config)
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text()
            console.error('Respuesta no-JSON', text)
            throw new Error('El servidor no respondio con JSON valido')
        }
        const data = await response.json()

        if (!response.ok) {
            const errorMsg = data.error || data.message || 'Error en la solicitu'
            console.error('Error de Api', errorMsg)
            throw new Error(errorMsg)
        }

        return data
    } catch (error) {
        console.error('Error en fetchApiUpload: ', error)
        throw error
    }
}

