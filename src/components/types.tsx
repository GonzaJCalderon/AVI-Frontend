// src/components/types.ts
export type Usuario = {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
}

export type BooleanMap = {
  [key: string]: boolean;
};

export type VictimFormState = {
  // DATOS DE LA INTERVENCIÓN
  fecha: string;
  coordinador: string;
  nroFicha: string;
  operador: string;
  resenaHecho: string;

  // DERIVACIÓN
  derivador: string;
  hora: string;
  tipoDerivacion: string;
  municipio: string;
  otroDerivacion: string;

  // HECHO DELICTIVO
  expediente: string;
  numAgresores: string;
  tipoDelito: BooleanMap;
  otrosDelito: string;
  ubicacionCalle: string;
  ubicacionDepartamento: string;
  fechaHecho: string;
  horaHecho: string;

  // ACCIONES
  accionesPrimeraLinea: string;

  // ABUSO SEXUAL
  kitAplicacion: string;
  relacionAgresor: string;
  otroRelacion: string;
  tipoLugar: string;
  otroLugar: string;

  // VÍCTIMA
  cantidadVictimas: string;
  dni: string;
  apellido: string;
  nombres: string;
  genero: string;
  fechaNacimiento: string;
  telefono: string;
  direccionVictima: string;
  departamentoVictima: string;
  ocupacion: string;

  // PERSONA ENTREVISTADA
  nombreEntrevistado: string;
  direccionEntrevistado: string;
  departamentoEntrevistado: string;
  relacionVictima: string;

  // INTERVENCIÓN
  tipoIntervencion: BooleanMap;
  detalleIntervencion: string;
  seguimientoRealizado: string;
  tipoSeguimiento: BooleanMap;
};
