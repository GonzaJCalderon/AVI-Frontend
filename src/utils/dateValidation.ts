// utils/dateValidation.ts

interface DateValidationOptions {
  value: string;
  min?: string;
  max?: string;
  fieldKey: string;
  setData: (value: string) => void;
  setErrors: (errors: any) => void;
  allowFuture?: boolean;
  allowEmpty?: boolean;
  minAge?: number; // en años, para fechas de nacimiento
}

export const validateDateInput = ({
  value,
  min = '1900-01-01',
  max,
  fieldKey,
  setData,
  setErrors,
  allowFuture = false,
  allowEmpty = true,
  minAge = 0
}: DateValidationOptions) => {
  // Si está vacío y se permite
  if (!value && allowEmpty) {
    setData(value);
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[fieldKey];
      return newErrors;
    });
    return;
  }

  // Validar formato básico de fecha
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    setErrors((prev: any) => ({
      ...prev,
      [fieldKey]: 'Formato de fecha inválido'
    }));
    return;
  }

  const inputDate = new Date(value + 'T00:00:00'); // Agregar hora para evitar problemas de zona horaria
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Resetear hora para comparación exacta

  // Verificar que la fecha sea válida (no permite fechas como 2024-02-30)
  if (isNaN(inputDate.getTime()) || inputDate.toISOString().split('T')[0] !== value) {
    setErrors((prev: any) => ({
      ...prev,
      [fieldKey]: 'Fecha inexistente'
    }));
    return;
  }

  // Validar fecha mínima
  if (min) {
    const minDate = new Date(min + 'T00:00:00');
    if (inputDate < minDate) {
      setErrors((prev: any) => ({
        ...prev,
        [fieldKey]: `La fecha no puede ser anterior a ${min}`
      }));
      return;
    }
  }

  // Validar fecha máxima
  if (max) {
    const maxDate = new Date(max + 'T00:00:00');
    if (inputDate > maxDate) {
      setErrors((prev: any) => ({
        ...prev,
        [fieldKey]: `La fecha no puede ser posterior a ${max}`
      }));
      return;
    }
  }

  // Validar futuro si no se permite
  if (!allowFuture && inputDate > today) {
    setErrors((prev: any) => ({
      ...prev,
      [fieldKey]: 'No se permiten fechas futuras'
    }));
    return;
  }

  // Validar edad mínima (para fechas de nacimiento)
  if (minAge > 0) {
    const minBirthDate = new Date();
    minBirthDate.setFullYear(minBirthDate.getFullYear() - minAge);
    minBirthDate.setHours(0, 0, 0, 0);
    
    if (inputDate > minBirthDate) {
      setErrors((prev: any) => ({
        ...prev,
        [fieldKey]: `La persona debe tener al menos ${minAge} año${minAge > 1 ? 's' : ''} de edad`
      }));
      return;
    }
  }

  // Si pasó todas las validaciones
  setData(value);
  setErrors((prev: any) => {
    const newErrors = { ...prev };
    delete newErrors[fieldKey];
    return newErrors;
  });
};

// Función específica para validar fechas de intervención
export const validateInterventionDate = (
  value: string,
  fieldKey: string,
  setData: (value: string) => void,
  setErrors: (errors: any) => void
) => {
  const today = new Date().toISOString().split('T')[0];
  
  validateDateInput({
    value,
    min: '1900-01-01',
    max: today,
    fieldKey,
    setData,
    setErrors,
    allowFuture: false,
    allowEmpty: false
  });
};

// Función específica para validar fechas de nacimiento
export const validateBirthDate = (
  value: string,
  fieldKey: string,
  setData: (value: string) => void,
  setErrors: (errors: any) => void,
  minAge: number = 1
) => {
  const today = new Date().toISOString().split('T')[0];
  
  validateDateInput({
    value,
    min: '1900-01-01',
    max: today,
    fieldKey,
    setData,
    setErrors,
    allowFuture: false,
    allowEmpty: false,
    minAge
  });
};

// Función específica para validar fechas de hechos delictivos
export const validateIncidentDate = (
  value: string,
  fieldKey: string,
  setData: (value: string) => void,
  setErrors: (errors: any) => void
) => {
  const today = new Date().toISOString().split('T')[0];
  
  validateDateInput({
    value,
    min: '1900-01-01',
    max: today,
    fieldKey,
    setData,
    setErrors,
    allowFuture: false,
    allowEmpty: false
  });
};

// Función para validar datetime-local (con hora)
export const validateDateTimeInput = ({
  value,
  min,
  max,
  fieldKey,
  setData,
  setErrors,
  allowFuture = false
}: {
  value: string;
  min?: string;
  max?: string;
  fieldKey: string;
  setData: (value: string) => void;
  setErrors: (errors: any) => void;
  allowFuture?: boolean;
}) => {
  if (!value) {
    setData(value);
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[fieldKey];
      return newErrors;
    });
    return;
  }

  // Validar formato datetime-local
  const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!datetimeRegex.test(value)) {
    setErrors((prev: any) => ({
      ...prev,
      [fieldKey]: 'Formato de fecha y hora inválido'
    }));
    return;
  }

  const inputDateTime = new Date(value);
  const now = new Date();

  // Verificar que la fecha/hora sea válida
  if (isNaN(inputDateTime.getTime())) {
    setErrors((prev: any) => ({
      ...prev,
      [fieldKey]: 'Fecha y hora inexistente'
    }));
    return;
  }

  // Validar mínimo
  if (min) {
    const minDateTime = new Date(min);
    if (inputDateTime < minDateTime) {
      setErrors((prev: any) => ({
        ...prev,
        [fieldKey]: 'Fecha y hora muy antigua'
      }));
      return;
    }
  }

  // Validar máximo
  if (max) {
    const maxDateTime = new Date(max);
    if (inputDateTime > maxDateTime) {
      setErrors((prev: any) => ({
        ...prev,
        [fieldKey]: 'Fecha y hora muy futura'
      }));
      return;
    }
  }

  // Validar futuro si no se permite
  if (!allowFuture && inputDateTime > now) {
    setErrors((prev: any) => ({
      ...prev,
      [fieldKey]: 'No se permiten fechas y horas futuras'
    }));
    return;
  }

  // Si pasó todas las validaciones
  setData(value);
  setErrors((prev: any) => {
    const newErrors = { ...prev };
    delete newErrors[fieldKey];
    return newErrors;
  });
};