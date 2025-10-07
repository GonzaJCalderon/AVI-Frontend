
import { Suspense } from 'react'
import EditarFormularioClient from './EditarFormularioClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditarFormularioClient />
    </Suspense>
  )
}
