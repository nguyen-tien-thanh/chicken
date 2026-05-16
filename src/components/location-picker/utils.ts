export type LatLng = { lat: number; lng: number };

export function getCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): LatLng | null {
  if (latitude == null || longitude == null) return null;
  return { lat: latitude, lng: longitude };
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Ưu tiên tọa độ, không có thì tìm theo địa chỉ */
export function googleMapsLink(options: {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): string | null {
  const coords = getCoordinates(options.latitude, options.longitude);
  if (coords) return googleMapsUrl(coords.lat, coords.lng);
  const address = options.address?.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
  }
  return null;
}
