/**
 * Input validation utilities for the Prime3 application
 */

// Maximum lengths for task fields
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;

// Backup password requirements
export const MIN_BACKUP_PASSWORD_LENGTH = 12;

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates a task title
 * @param title The title to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateTaskTitle(title: string): ValidationResult {
    if (!title || title.trim().length === 0) {
        return {
            isValid: false,
            error: 'Title is required'
        };
    }

    if (title.length > MAX_TITLE_LENGTH) {
        return {
            isValid: false,
            error: `Title must be ${MAX_TITLE_LENGTH} characters or less`
        };
    }

    return { isValid: true };
}

/**
 * Validates a task description
 * @param description The description to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateTaskDescription(description: string): ValidationResult {
    // Description is optional, but if provided, check length
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
        return {
            isValid: false,
            error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
        };
    }

    return { isValid: true };
}

/**
 * Sanitizes user input by trimming whitespace and normalizing spaces
 * @param input The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
}

/**
 * Truncates a string to a maximum length
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength);
}

/**
 * Validates a backup password for encryption
 * @param password The password to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateBackupPassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
        return {
            isValid: false,
            error: 'Password is required'
        };
    }

    if (password.length < MIN_BACKUP_PASSWORD_LENGTH) {
        return {
            isValid: false,
            error: `Password must be at least ${MIN_BACKUP_PASSWORD_LENGTH} characters`
        };
    }

    // Check for complexity requirements
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    const complexityCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (complexityCount < 3) {
        return {
            isValid: false,
            error: 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters'
        };
    }

    return { isValid: true };
}

/**
 * Validates and sanitizes a task title
 * @param title The title to validate and sanitize
 * @returns Object with sanitized title and validation result
 */
export function validateAndSanitizeTitle(title: string): {
    sanitized: string;
    validation: ValidationResult;
} {
    const sanitized = truncate(sanitizeInput(title), MAX_TITLE_LENGTH);
    const validation = validateTaskTitle(sanitized);

    return { sanitized, validation };
}

/**
 * Validates and sanitizes a task description
 * @param description The description to validate and sanitize
 * @returns Object with sanitized description and validation result
 */
export function validateAndSanitizeDescription(description: string): {
    sanitized: string;
    validation: ValidationResult;
} {
    const sanitized = truncate(sanitizeInput(description), MAX_DESCRIPTION_LENGTH);
    const validation = validateTaskDescription(sanitized);

    return { sanitized, validation };
}
