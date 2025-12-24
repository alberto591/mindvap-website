import winston from 'winston';

// Custom format for browser console logging that maintains some structure
// while being readable in the console
const browserFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

const logger = winston.createLogger({
    level: import.meta.env.MODE === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                browserFormat
            )
        })
    ]
});

/**
 * Structured logger utility
 */
export const log = {
    info: (message: string, context?: Record<string, any>) => {
        logger.info(message, context);
    },
    error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
        const errorContext = error instanceof Error
            ? {
                error_name: error.name,
                error_message: error.message,
                error_stack: error.stack,
                ...context
            }
            : { error, ...context };

        logger.error(message, errorContext);
    },
    warn: (message: string, context?: Record<string, any>) => {
        logger.warn(message, context);
    },
    debug: (message: string, context?: Record<string, any>) => {
        logger.debug(message, context);
    }
};

export default log;
