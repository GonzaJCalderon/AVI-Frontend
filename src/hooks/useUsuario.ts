// src/hooks/useUsuario.ts
export type Usuario = {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'user'
}

export default function useUsuario(): Usuario {
  return {
    id: 1,
    nombre: 'Gonzalo',
    email: 'gonza@example.com',
    rol: 'admin' // o 'user'
  }
}
