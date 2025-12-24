/**
 * Structured logger utility for Browser environment
 * Replaces winston which is Node.js only
 */

const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
};

export const log = {
    info: (message: string, context?: Record<string, any>) => {
        const timestamp = getTimestamp();
        if (context && Object.keys(context).length > 0) {
            console.info(`[${timestamp}] [INFO]: ${message}`, context);
        } else {
            console.info(`[${timestamp}] [INFO]: ${message}`);
        }
    },
    error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
        const timestamp = getTimestamp();
        const errorContext = error instanceof Error
            ? {
                error_name: error.name,
                error_message: error.message,
                error_stack: error.stack,
                ...context
            }
            : { error, ...context };

        console.error(`[${timestamp}] [ERROR]: ${message}`, errorContext);
    },
    warn: (message: string, context?: Record<string, any>) => {
        const timestamp = getTimestamp();
        if (context && Object.keys(context).length > 0) {
            console.warn(`[${timestamp}] [WARN]: ${message}`, context);
        } else {
            console.warn(`[${timestamp}] [WARN]: ${message}`);
        }
    },
    debug: (message: string, context?: Record<string, any>) => {
        // Only log debug in development
        if (import.meta.env.MODE !== 'production') {
            const timestamp = getTimestamp();
            if (context && Object.keys(context).length > 0) {
                console.debug(`[${timestamp}] [DEBUG]: ${message}`, context);
            } else {
                console.debug(`[${timestamp}] [DEBUG]: ${message}`);
            }
        }
    }
};

export default log;
