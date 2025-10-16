'use client'
import React , { useState } from "react";
import { PublicRoute } from '@/components/UI/PublicRoute';
import { useRouter } from "next/navigation";
import { useAuth } from "@/config/contexts/AuthContext";
import styles from '@/styles/Login.module.css'

export default function LoginPage(){
    const router = useRouter()
    const { login } = useAuth()

    const [credentials, setCredentials] = useState({usuario: '', password: ''})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [focusedInputs, setFocusedInputs] = useState({
        usuario: false,
        password: false
    })

    const handleInputFocus = (inputName) => {
        setFocusedInputs(prev => ({ ...prev, [inputName]: true}))
        setError('')
    }

    const handleInputBlur = (inputName, value) => {
        if (!value) {
            setFocusedInputs(prev => ({ ...prev, [inputName]: false}))
        }
    }

    const handleInputChange = (inputName, value) => {
        setCredentials(prev => ({ ...prev, [inputName]: value}))
    }

    const handleSubmit = async (e) => {
    e.preventDefault();
        setLoading(true)
        setError('')

        try {
            const result = await login(credentials)
            console.log('Login result: ', result)

            if (!result.success) {
                setError(result.error || 'Error al iniciar sesion')
            }
        } catch (error) {
            console.error('Error de loging', error)
            setError(error.message || 'Error al iniciar sesion')
        } finally{
            setLoading(false)
        }
    }

    const getInputFieldClass = (inputName) => {
        let className = styles.inputField
        if (focusedInputs[inputName] || credentials[inputName]) {
            className += ` ${styles.focused}`
        }
        if (credentials[inputName]) {
            className += ` ${styles.hasValue}`
        }
        return className
    }
    return(
        <PublicRoute>
            <div className={styles.body}>
                <div className={styles.wrapper}>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h2 className={styles.title}>Sistema de Correspondencia</h2>
                
                <div className={getInputFieldClass('usuario')}>
                    <input 
                    type="text" 
                    required
                    value={credentials.usuario}
                    onChange={(e) => handleInputChange('usuario', e.target.value)}
                    onFocus={() => handleInputFocus('usuario')}
                    onBlur={(e) => handleInputBlur('usuario', e.target.value)}
                    disabled={loading}
                    />
                    <label>Ingrese su usuario</label>
                </div>

                <div className={getInputFieldClass('password')}>
                    <input 
                    type="password" 
                    required
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => handleInputFocus('password')}
                    onBlur={(e) => handleInputBlur('password', e.target.value)}
                    disabled={loading}
                    />
                    <label>Enter your password</label>
                </div>

                <div className={styles.forget}>
                    <label htmlFor="remember" className={styles.forgetLabel}>
                    <input 
                        type="checkbox" 
                        id="remember"
                        className={styles.checkbox}
                        disabled={loading}
                    />
                    <p>Remember me</p>
                    </label>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                    </a>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                    {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={loading}
                >
                    {loading ? 'Iniciando sesión...' : 'Log In'}
                </button>

                <div className={styles.register}>
                    <p>
                    Don't have an account? 
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        Register
                    </a>
                    </p>
                </div>
            </form>
        </div>
        </div>
    </PublicRoute>
    )
}