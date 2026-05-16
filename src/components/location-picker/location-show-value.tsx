import { Button, Space, Typography } from 'antd';

import { formatCoordinates, getCoordinates, googleMapsUrl } from './utils';

type LocationShowValueProps = {
  latitude?: number | null;
  longitude?: number | null;
};

export function LocationShowValue({
  latitude,
  longitude,
}: LocationShowValueProps) {
  const coords = getCoordinates(latitude, longitude);
  if (!coords) return <>—</>;

  return (
    <Space direction="vertical" size={4}>
      <Typography.Text>
        {formatCoordinates(coords.lat, coords.lng)}
      </Typography.Text>
      <Button
        type="link"
        size="small"
        style={{ padding: 0, height: 'auto' }}
        href={googleMapsUrl(coords.lat, coords.lng)}
        target="_blank"
      >
        Mở Google Maps
      </Button>
    </Space>
  );
}
