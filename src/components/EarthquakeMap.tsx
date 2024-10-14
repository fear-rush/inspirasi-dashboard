import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useToast } from "@/components/ui/use-toast";
import { useEarthquakeData } from "@/hooks/useEarthquakeData";
import { useEffect, useReducer } from "react";
import { SpinnerCircular } from "spinners-react";

// Setup Leaflet marker icons
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EarthquakeData {
  _id: string;
  lintang: string;
  bujur: string;
  magnitude: string;
  kedalaman: string;
  wilayah: string;
  datetime: string;
}

type State = {
  markerType: "default" | "redCircle";
  fromDate: string;
  toDate: string;
  minMagnitude: number | null;
  maxMagnitude: number | null;
  minDepth: number | null;
  maxDepth: number | null;
};

type Action =
  | { type: "SET_MARKER_TYPE"; payload: "default" | "redCircle" }
  | { type: "SET_FROM_DATE"; payload: string }
  | { type: "SET_TO_DATE"; payload: string }
  | { type: "SET_MIN_MAGNITUDE"; payload: number | null }
  | { type: "SET_MAX_MAGNITUDE"; payload: number | null }
  | { type: "SET_MIN_DEPTH"; payload: number | null }
  | { type: "SET_MAX_DEPTH"; payload: number | null };

const initialState: State = {
  markerType: "default",
  fromDate: new Date().toISOString().slice(0, 10),
  toDate: new Date().toISOString().slice(0, 10),
  minMagnitude: null,
  maxMagnitude: null,
  minDepth: null,
  maxDepth: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_MARKER_TYPE":
      return { ...state, markerType: action.payload };
    case "SET_FROM_DATE":
      return { ...state, fromDate: action.payload };
    case "SET_TO_DATE":
      return { ...state, toDate: action.payload };
    case "SET_MIN_MAGNITUDE":
      return { ...state, minMagnitude: action.payload };
    case "SET_MAX_MAGNITUDE":
      return { ...state, maxMagnitude: action.payload };
    case "SET_MIN_DEPTH":
      return { ...state, minDepth: action.payload };
    case "SET_MAX_DEPTH":
      return { ...state, maxDepth: action.payload };
    default:
      return state;
  }
};

const EarthquakeMap = () => {
  const { data: earthquakes, isLoading, error } = useEarthquakeData();
  const { toast } = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    markerType,
    fromDate,
    toDate,
    minMagnitude,
    maxMagnitude,
    minDepth,
    maxDepth,
  } = state;

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch earthquake data.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="w-screen h-full flex justify-center items-center">
        <SpinnerCircular size={200} color="#262626" />
      </div>
    );
  }

  const filterEarthquakes = (earthquakes: EarthquakeData[]) => {
    return earthquakes.filter((quake) => {
      const quakeDate = new Date(quake.datetime);
      const quakeMagnitude = parseFloat(quake.magnitude);
      const quakeDepth = parseFloat(quake.kedalaman);

      const dateInRange =
        quakeDate >= new Date(fromDate) && quakeDate <= new Date(toDate);
      const magnitudeInRange =
        (minMagnitude === null || quakeMagnitude >= minMagnitude) &&
        (maxMagnitude === null || quakeMagnitude <= maxMagnitude);
      const depthInRange =
        (minDepth === null || quakeDepth >= minDepth) &&
        (maxDepth === null || quakeDepth <= maxDepth);

      return dateInRange && magnitudeInRange && depthInRange;
    });
  };

  const filteredEarthquakes = filterEarthquakes(earthquakes || []);

  // Map center coordinates (Indonesia)
  const center: LatLngExpression = [-2.5489, 118.0149];

  return (
    <div className="h-full w-full flex">
      {/* Map Display */}
      <div
        className="justify-center items-center flex-grow z-10"
        style={{ height: "90vh" }}
      >
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredEarthquakes.map((quake) => {
            const lat = parseFloat(quake.lintang.split(" ")[0]);
            const lng = parseFloat(quake.bujur.split(" ")[0]);
            const position: LatLngExpression = [lat, lng];

            return markerType === "default" ? (
              <Marker key={quake._id} position={position}>
                <Popup>
                  <div>
                    <h3 className="font-bold">{quake.wilayah}</h3>
                    <p>Magnitude: {quake.magnitude}</p>
                    <p>Depth: {quake.kedalaman}</p>
                    <p>Date: {new Date(quake.datetime).toLocaleString()}</p>
                  </div>
                </Popup>
              </Marker>
            ) : (
              <CircleMarker
                key={quake._id}
                center={position}
                radius={10}
                fillColor="red"
                color="red"
                fillOpacity={1}
                weight={0}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{quake.wilayah}</h3>
                    <p>Magnitude: {quake.magnitude}</p>
                    <p>Depth: {quake.kedalaman}</p>
                    <p>Date: {new Date(quake.datetime).toLocaleString()}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 ml-2">
        {/* Marker */}
        <div>
          <h3 className="font-bold mb-2">Select Marker Type:</h3>
          <label className="mr-4">
            <input
              type="radio"
              name="markerType"
              value="default"
              checked={markerType === "default"}
              onChange={() =>
                dispatch({ type: "SET_MARKER_TYPE", payload: "default" })
              }
            />{" "}
            Default Marker
          </label>
          <label>
            <input
              type="radio"
              name="markerType"
              value="redCircle"
              checked={markerType === "redCircle"}
              onChange={() =>
                dispatch({ type: "SET_MARKER_TYPE", payload: "redCircle" })
              }
            />{" "}
            Red Circle Marker
          </label>
        </div>

        {/* Date Range Filters */}
        <div className="mt-4">
          <h4 className="font-bold mt-2">Date Range:</h4>
          <div className="flex gap-2">
            <div>
              <label className="block">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  dispatch({ type: "SET_FROM_DATE", payload: e.target.value })
                }
                className="block"
              />
            </div>
            <div>
              <label className="block">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  dispatch({ type: "SET_TO_DATE", payload: e.target.value })
                }
                className="block"
              />
            </div>
          </div>
        </div>

        {/* Magnitude Filters */}
        <div className="mt-4">
          <h4 className="font-bold mt-2">Magnitude (SR):</h4>
          <input
            type="number"
            placeholder="Min"
            onChange={(e) =>
              dispatch({
                type: "SET_MIN_MAGNITUDE",
                payload: parseFloat(e.target.value) || null,
              })
            }
          />
          <input
            type="number"
            placeholder="Max"
            onChange={(e) =>
              dispatch({
                type: "SET_MAX_MAGNITUDE",
                payload: parseFloat(e.target.value) || null,
              })
            }
          />
        </div>

        {/* Depth Filters */}
        <div className="mt-4">
          <h4 className="font-bold mt-2">Depth (KM):</h4>
          <input
            type="number"
            placeholder="Min"
            onChange={(e) =>
              dispatch({
                type: "SET_MIN_DEPTH",
                payload: parseFloat(e.target.value) || null,
              })
            }
          />
          <input
            type="number"
            placeholder="Max"
            onChange={(e) =>
              dispatch({
                type: "SET_MAX_DEPTH",
                payload: parseFloat(e.target.value) || null,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default EarthquakeMap;
