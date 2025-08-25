export type Formulario = {
  id: string;
  coordinador: string;
  operador: string;
  victima: string;
  numero: string;
  dni: string;
  fecha: string;
  estado: string;
  delito: string;
  departamento: string;
  counts?: {
    derivaciones: number;
    hechos_delictivos: number;
    victimas: number;
    seguimientos: number;
  };
};
