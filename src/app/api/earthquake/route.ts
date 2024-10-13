import { NextResponse } from 'next/server';

// Define the interface for EarthquakeData
interface EarthquakeData {
  _id: string;
  lintang: string;
  bujur: string;
  magnitude: string;
  kedalaman: string;
  wilayah: string;
  datetime: string;
}

// Define the interface for the API response structure
interface ApiResponse {
  data: EarthquakeData[];
}

// Function to remove duplicates from earthquake data
const removeDuplicates = (data: EarthquakeData[]): EarthquakeData[] => {
  const uniqueData: EarthquakeData[] = [];
  const seen = new Set<string>();

  for (const quake of data) {
    const uniqueIdentifier = `${quake.datetime}-${quake.wilayah}`; // Filter using datetime and wilayah

    if (!seen.has(uniqueIdentifier)) {
      seen.add(uniqueIdentifier);
      uniqueData.push(quake);
    }
  }

  return uniqueData;
};

// Fetch earthquake data using the Next.js App Router's API route
export async function GET() {
  try {
    // Authenticate by getting a token
    const authResponse = await fetch(`${process.env.BASE_URL}/api/rest/auth/token-based`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token_id: process.env.TOKEN_ID,
        token: process.env.TOKEN,
        collection_id: process.env.AUTH_COLLECTION_ID,
        data: {
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
        },
      }),
    });

    if (!authResponse.ok) {
      throw new Error(process.env.AUTH_COLLECTION_ID);
    }

    const authData = await authResponse.json();
    const token = authData.data.token;

    // Fetch earthquake data
    const response = await fetch(
      `${process.env.BASE_URL}/api/rest/project/${process.env.PROJECT_ID}/collection/${process.env.COLLECTION_ID}/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch earthquake data");
    }

    const responseData: ApiResponse = await response.json(); // Use a specific type for the API response
    const uniqueEarthquakes = removeDuplicates(responseData.data); // Remove duplicates

    // Return the response using NextResponse with a 200 status code
    return NextResponse.json(uniqueEarthquakes, { status: 200 });
  } catch (error) {
    // Error handling for unexpected cases
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
