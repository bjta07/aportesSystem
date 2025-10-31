import pinoHttp from 'pino-http'
import { logger } from '../logger.js'

const middleware = pinoHttp({
    logger,

    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error'
        if (res.statusCode >=400) return 'warn'
        return 'info'
    },
    serializers: {
        req: (req) => {
            return {
                method: req.method,
                url: req.url,
                id: req.id
            }
        }
    }
})

export default middleware