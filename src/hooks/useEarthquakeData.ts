// useEarthquakeData.ts
import { useQuery } from "@tanstack/react-query";

interface EarthquakeData {
  _id: string;
  lintang: string;
  bujur: string;
  magnitude: string;
  kedalaman: string;
  wilayah: string;
  datetime: string;
}

const fetchEarthquakeData = async (): Promise<EarthquakeData[]> => {
  const response = await fetch("/api/earthquake"); // Use the API route

  if (!response.ok) {
    throw new Error("Failed to fetch earthquake data");
  }

  const data = await response.json();
  return data; // No need to deduplicate here, as it's done on the server-side
};

export const useEarthquakeData = () => {
  return useQuery<EarthquakeData[], Error>(["earthquakeData"], fetchEarthquakeData);
};
