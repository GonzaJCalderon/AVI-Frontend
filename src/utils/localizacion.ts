// utils/localizacion.ts

type Departamento = { id: number; nombre: string };
type Localidad = { id: number; nombre: string; departamento_id: number };

export function getNombreDepartamento(id: number, departamentos: Departamento[]): string {
  const dep = departamentos.find((d) => d.id === id);
  return dep ? dep.nombre : '';
}

export function getNombreLocalidad(id: number, localidades: Localidad[]): string {
  const loc = localidades.find((l) => l.id === id);
  return loc ? loc.nombre : '';
}
