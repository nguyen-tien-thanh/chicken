import { HCMC_BOUNDS } from './constants';
import type { LatLng } from './utils';

const NOMINATIM_VIEWBOX = [
  HCMC_BOUNDS.southWest.lng,
  HCMC_BOUNDS.northEast.lat,
  HCMC_BOUNDS.northEast.lng,
  HCMC_BOUNDS.southWest.lat,
].join(',');

type NominatimResult = { lat: string; lon: string; display_name: string };

export async function searchAddress(
  query: string,
): Promise<{ label: string; coords: LatLng }[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const q = /hồ chí minh|ho chi minh|tphcm/i.test(trimmed)
    ? trimmed
    : `${trimmed}, Ho Chi Minh City, Vietnam`;

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '6',
    countrycodes: 'vn',
    viewbox: NOMINATIM_VIEWBOX,
    bounded: '1',
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: { 'Accept-Language': 'vi,en' },
    },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as NominatimResult[];
  return data.map(item => ({
    label: item.display_name,
    coords: { lat: Number(item.lat), lng: Number(item.lon) },
  }));
}
