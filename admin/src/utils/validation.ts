import { message } from 'antd';

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSize: number = 5 * 1024 * 1024): boolean => {
  if (file.size > maxSize) {
    message.error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    return false;
  }
  return true;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!allowedTypes.includes(file.type)) {
    message.error(`File type must be one of: ${allowedTypes.join(', ')}`);
    return false;
  }
  return true;
};

/**
 * Validate required fields
 */
export const validateRequired = (values: Record<string, any>, fields: string[]): boolean => {
  for (const field of fields) {
    if (!values[field] || (typeof values[field] === 'string' && !values[field].trim())) {
      message.error(`${field} is required`);
      return false;
    }
  }
  return true;
};
