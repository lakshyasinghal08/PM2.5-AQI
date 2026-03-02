import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet.heat";

export interface HeatPoint {
  position: LatLngExpression;
  intensity: number;
}

interface HeatmapLayerProps {
  points: HeatPoint[];
}

const HeatmapLayer = ({ points }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatPoints = points.map(p => {
      const [lat, lng] = p.position as [number, number];
      return [lat, lng, p.intensity] as [number, number, number];
    });

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: {
        0.2: "green",
        0.4: "yellow",
        0.6: "orange",
        0.8: "red",
        1.0: "purple",
      },
    });

    heatLayer.addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;

