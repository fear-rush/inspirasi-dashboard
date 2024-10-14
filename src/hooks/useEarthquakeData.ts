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
  const apiUrl = process.env.NEXT_PUBLIC_EARTHQUAKE_API_URL; // Use the environment variable

  if (!apiUrl) {
    throw new Error("API URL is not defined in .env.local");
  }

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch earthquake data");
  }

  const data = await response.json();
  return data;
};

export const useEarthquakeData = () => {
  return useQuery<EarthquakeData[], Error>({
    queryKey: ["earthquakeData"],
    queryFn: fetchEarthquakeData,
  });
};
