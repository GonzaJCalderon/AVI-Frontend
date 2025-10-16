// utils/validationSchemas.ts
import * as yup from 'yup';

// Validación para crear usuario
export const createUsuarioSchema = yup.object({
  nombre: yup
    .string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  apellido: yup
    .string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  
  email: yup
    .string()
    .required('El correo electrónico es obligatorio')
    .email('Debe ser un correo electrónico válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  rol: yup
    .string()
    .required('El rol es obligatorio')
    .oneOf(['user', 'admin'], 'El rol debe ser "usuario" o "admin"'),
});

// Validación para actualizar usuario
export const updateUsuarioSchema = yup.object({
  nombre: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: yup
    .string()
    .email('Debe ser un correo electrónico válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  rol: yup
    .string()
    .oneOf(['admin', 'user'], 'El rol debe ser "admin" o "user"'),
});

// Validación para búsqueda
export const searchSchema = yup.object({
  busqueda: yup
    .string()
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ@.\s]*$/, 'La búsqueda contiene caracteres no válidos'),
});

// Tipos para validación
export type CreateUsuarioFormData = yup.InferType<typeof createUsuarioSchema>;
export type UpdateUsuarioFormData = yup.InferType<typeof updateUsuarioSchema>;
export type SearchFormData = yup.InferType<typeof searchSchema>;

// Utilidad para validar campos individuales
export const validateField = async (
  schema: yup.ObjectSchema<any>,
  field: string,
  value: any
): Promise<string | null> => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Error de validación';
  }
};

// Utilidad para validar formulario completo
export const validateForm = async <T extends yup.Maybe<yup.AnyObject>>(
  schema: yup.ObjectSchema<T>,
  data: T
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Error de validación' } };
  }
};
