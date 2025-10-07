// app/imprimir-multiples-formularios/page.tsx
export const dynamic = 'force-dynamic' // or: export const revalidate = 0

import { Suspense } from 'react'
import ImprimirMultiplesFormulariosClient from './ImprimirMultiplesFormulariosClient'

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      Cargando...
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ImprimirMultiplesFormulariosClient />
    </Suspense>
  )
}