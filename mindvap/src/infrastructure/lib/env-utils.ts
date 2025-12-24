// Safe environment variable access for both Vite and Jest
export const getEnvVariable = (key: string): string | undefined => {
    // In Jest/Node environment, use process.env
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        return process.env[key];
    }

    try {
        // Use dynamic evaluation to hide import.meta from the parser in non-ESM environments (like Jest)
        // This prevents SyntaxError: Cannot use 'import.meta' outside a module
        const getMeta = new Function('return import.meta');
        const meta = getMeta();
        if (meta && meta.env) {
            return meta.env[key];
        }
    } catch (e) {
        // Ignore errors in environments where import.meta is not supported
    }

    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }

    return undefined;
};
