import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

const baseOptions = {
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
        'user.password',
        'user.ssn',
        'password'
    ],
    base: { pid: false }
}

// Crear transport solo en desarrollo
const transport = isDev 
    ? pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' }
      })
    : undefined

// Exportar logger
export const logger = transport 
    ? pino(baseOptions, transport)
    : pino(baseOptions)

export const childLogger = (bindings = {}) => logger.child(bindings)