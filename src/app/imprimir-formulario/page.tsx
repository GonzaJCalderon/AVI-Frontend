import { Suspense } from 'react'
import ImprimirFormularioClient from './ImprimirFormularioClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <ImprimirFormularioClient />
    </Suspense>
  )
}
