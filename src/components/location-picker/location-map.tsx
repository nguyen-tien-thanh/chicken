import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import 'leaflet/dist/leaflet.css';

import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  HCMC_BOUNDS,
  MAX_MAP_ZOOM,
  MIN_MAP_ZOOM,
  SELECTED_MAP_ZOOM,
} from './constants';
import type { LatLng } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const HCMC_BOUNDS_LEAFLET = L.latLngBounds(
  [HCMC_BOUNDS.southWest.lat, HCMC_BOUNDS.southWest.lng],
  [HCMC_BOUNDS.northEast.lat, HCMC_BOUNDS.northEast.lng],
);

type LocationMapProps = {
  value?: LatLng | null;
  onChange?: (coords: LatLng) => void;
};

function MapClickHandler({ onChange }: { onChange: (coords: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize({ animate: false });
    fix();
    const t = window.setTimeout(fix, 150);
    const el = map.getContainer().parentElement;
    if (!el) return () => window.clearTimeout(t);

    const ro = new ResizeObserver(() => requestAnimationFrame(fix));
    ro.observe(el);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

function MapRecenter({ point }: { point: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.setView([point.lat, point.lng], SELECTED_MAP_ZOOM);
  }, [map, point]);
  return null;
}

export function LocationMap({ value, onChange }: LocationMapProps) {
  const center = value ?? DEFAULT_MAP_CENTER;
  const zoom = value ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM;

  return (
    <div className="location-picker__map">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        minZoom={MIN_MAP_ZOOM}
        maxZoom={MAX_MAP_ZOOM}
        maxBounds={HCMC_BOUNDS_LEAFLET}
        maxBoundsViscosity={1}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapInvalidateSize />
        <MapRecenter point={value ?? null} />
        {onChange ? <MapClickHandler onChange={onChange} /> : null}
        {value ? <Marker position={[value.lat, value.lng]} /> : null}
      </MapContainer>
    </div>
  );
}
