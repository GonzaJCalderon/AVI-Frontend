export type Localidad = {
  id: string; // ID único (usado como clave en Selects)
  nombre: string;
  departamento_id: string;
  localidad_censal_id: string; // ✅ Este es el valor que llega desde backend
};
