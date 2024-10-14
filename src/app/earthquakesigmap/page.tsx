'use client'

import dynamic from 'next/dynamic'

const EarthquakeSigMap = dynamic(() => import('@/components/EarthquakeSignificanceMap'), {
  ssr: false, // Disable server-side rendering for this component
})

export default function EarthquakeSigMapPage() {
  return (
    <div className="h-full w-full">
      <EarthquakeSigMap />
    </div>
  )
}
