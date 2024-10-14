'use client'

import dynamic from 'next/dynamic'

const EarthquakeMap = dynamic(() => import('@/components/EarthquakeMap'), {
  ssr: false, // Disable server-side rendering for this component
})

export default function EarthquakeMapPage() {
  return (
    <div className="h-full w-full">
      <EarthquakeMap />
    </div>
  )
}
