import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEarthquakeData } from "@/hooks/useEarthquakeData";
import { toast } from "./ui/use-toast";
import { SpinnerCircular } from "spinners-react";

interface Earthquake {
  datetime: string; // Date as string
  magnitude: string; // Magnitude as string
  lintang: string; // Latitude as string
  bujur: string; // Longitude as string
}

interface Cluster {
  lat: number;
  lon: number;
  magnitudes: number[];
  count: number;
  totalMagnitude: number;
}

const EarthquakeSignificanceMap = () => {
  const { data: earthquakes, isLoading, error } = useEarthquakeData();
  const [week, setWeek] = useState(0); // To track the selected week
  const startOfData = new Date("2024-09-01"); // Start date for the earthquake data
  const currentDate = new Date(); // Current date to calculate dynamic total weeks

  // Calculate total weeks dynamically based on the current date and start date
  const totalWeeks = Math.ceil(
    (currentDate.getTime() - startOfData.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const radiusKm = 200; // 200 km radius for clustering

  // Function to calculate distance between two points using Haversine formula
  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert to radians
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Function to extract and clean the latitude/longitude from the earthquake response
  const parseCoordinates = (latStr: string, lonStr: string) => {
    const lat = parseFloat(latStr.replace(" LS", "").replace("S", "-")); // Handle "LS" and "S" for South
    const lon = parseFloat(lonStr.replace(" BT", "").replace("E", "")); // Handle "BT" for East
    return { lat, lon };
  };

  // Function to filter earthquakes by week
  const filterEarthquakesByWeek = (
    earthquakes: Earthquake[],
    selectedWeek: number
  ) => {
    const startOfWeek = new Date(startOfData);
    startOfWeek.setDate(startOfWeek.getDate() + selectedWeek * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return {
      startOfWeek,
      endOfWeek,
      filteredEarthquakes: earthquakes.filter((quake) => {
        const quakeDate = new Date(quake.datetime);
        return quakeDate >= startOfWeek && quakeDate <= endOfWeek;
      }),
    };
  };

  // Function to aggregate earthquakes within a given radius
  const aggregateEarthquakesByRadius = (
    earthquakes: Earthquake[],
    radiusKm: number
  ) => {
    const clusters: Cluster[] = [];

    earthquakes.forEach((quake) => {
      const { lat: quakeLat, lon: quakeLon } = parseCoordinates(
        quake.lintang,
        quake.bujur
      );

      if (isNaN(quakeLat) || isNaN(quakeLon)) {
        console.warn(
          "Invalid earthquake coordinates:",
          quake.lintang,
          quake.bujur
        );
        return; // Skip invalid coordinates
      }

      let addedToCluster = false;

      for (const cluster of clusters) {
        const distance = haversineDistance(
          quakeLat,
          quakeLon,
          cluster.lat,
          cluster.lon
        );

        if (distance <= radiusKm) {
          // Add this earthquake to the existing cluster
          cluster.magnitudes.push(parseFloat(quake.magnitude));
          cluster.count += 1;
          cluster.totalMagnitude += parseFloat(quake.magnitude);
          cluster.lat =
            (cluster.lat * (cluster.count - 1) + quakeLat) / cluster.count; // Update cluster center
          cluster.lon =
            (cluster.lon * (cluster.count - 1) + quakeLon) / cluster.count; // Update cluster center
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        // If no nearby cluster found, create a new one
        clusters.push({
          lat: quakeLat,
          lon: quakeLon,
          magnitudes: [parseFloat(quake.magnitude)],
          count: 1,
          totalMagnitude: parseFloat(quake.magnitude),
        });
      }
    });

    return clusters;
  };

  // Function to generate a color scale based on magnitude (darkens with higher magnitudes)
  const getCircleColor = (meanMagnitude: number) => {
    // Base color in light tan (low magnitude)
    const baseColor = [210, 180, 140]; // RGB for tan
    const darkeningFactor = Math.min(meanMagnitude / 10, 1); // Cap darkening at magnitude 10
    const darkenedColor = baseColor.map((channel) =>
      Math.round(channel * (1 - darkeningFactor))
    );
    return `rgb(${darkenedColor.join(",")})`;
  };

  // Filter earthquakes by selected week and aggregate them by radius
  const { startOfWeek, endOfWeek, filteredEarthquakes } = earthquakes
    ? filterEarthquakesByWeek(earthquakes, week)
    : {
        startOfWeek: new Date(),
        endOfWeek: new Date(),
        filteredEarthquakes: [],
      };

  const clusteredData = aggregateEarthquakesByRadius(
    filteredEarthquakes,
    radiusKm
  );

  // Handle the slider change for weeks
  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeek(parseInt(e.target.value, 10));
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch earthquake data.",
        variant: "destructive",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="w-screen h-full flex justify-center items-center">
        <SpinnerCircular size={200} color="#262626" />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex">
      {/* Map Container using react-leaflet */}
      <div className="flex-1">
        <MapContainer
          center={[0, 120]} // Initial map center (latitude, longitude)
          zoom={4}
          style={{ height: "100%", width: "100%", zIndex: "10" }}
        >
          {/* TileLayer for the map background */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Clustered Earthquake Circle Markers */}
          {!isLoading &&
            !error &&
            clusteredData.map((cluster, index) => {
              const averageMagnitude = cluster.totalMagnitude / cluster.count;
              const circleColor = getCircleColor(averageMagnitude); // Adjust color based on magnitude

              return (
                <CircleMarker
                  key={index} // Use index as a unique key for each cluster
                  center={[cluster.lat, cluster.lon]} // Clustered center
                  radius={averageMagnitude * 3} // Radius based on average magnitude
                  fillColor={circleColor}
                  fillOpacity={0.8}
                  stroke={false} // Disable the stroke (border)
                >
                  {/* Tooltip to display mean magnitude */}
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                    permanent
                  >
                    <span>Mean Magnitude: {averageMagnitude.toFixed(2)}</span>
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* Right-side container for the slider and legend */}
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 ml-2">
        {/* Slider for weeks */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            Aggregated Earthquakes (Weekly)
          </h2>
          <p className="my-2">Aggregated weekly earthquakes <br/> started from 01/09/2024 within radius 200km</p>
          <label htmlFor="week-slider" className="block text-sm mb-2">
            Week: {week + 1} ({startOfWeek.toLocaleDateString("en-GB")} -{" "}
            {endOfWeek.toLocaleDateString("en-GB")})
          </label>
          <input
            id="week-slider"
            type="range"
            min="0"
            max={totalWeeks - 1}
            step="1"
            value={week}
            onChange={handleWeekChange}
            className="w-full"
          />
        </div>

        {/* Magnitude Bar Plot Legend */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Magnitude Legend</h2>
          {/* Brown color bar legend */}
          <div className="w-full h-2 bg-gradient-to-r from-[#D2B48C] to-[#4B2E1A]" />
          <div className="flex justify-between text-xs">
            <span>3.0</span>
            <span>6.0</span>
            <span>9.0+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeSignificanceMap;
