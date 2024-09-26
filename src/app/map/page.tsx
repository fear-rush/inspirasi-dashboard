import dynamic from 'next/dynamic'

const EarthquakeMap = dynamic(() => import('@/components/EarthquakeMap'), { ssr: false })

export default function MapPage() {
  return (
    <div className="h-full w-full">
      <EarthquakeMap />
    </div>
  )
}