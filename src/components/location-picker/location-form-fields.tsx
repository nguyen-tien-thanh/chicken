import { EnvironmentOutlined, SearchOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';

import { searchAddress } from './geocode';
import { LocationMap } from './location-map';
import './location-picker.css';
import {
  formatCoordinates,
  getCoordinates,
  googleMapsUrl,
  type LatLng,
} from './utils';

type SearchOption = { value: string; label: string; coords: LatLng };

function LocationPickerInput() {
  const form = Form.useFormInstance();
  const latitude = Form.useWatch<number | null>('latitude', form);
  const longitude = Form.useWatch<number | null>('longitude', form);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LatLng | null>(null);
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const searchId = useRef(0);

  const saved = getCoordinates(latitude, longitude);

  useEffect(() => {
    if (!open) return;
    setDraft(getCoordinates(latitude, longitude));
    setSearch('');
    setSearchOptions([]);
  }, [open, latitude, longitude]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchOptions([]);
      return;
    }
    const id = ++searchId.current;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddress(search);
        if (id !== searchId.current) return;
        setSearchOptions(
          results.map(r => ({
            value: r.label,
            label: r.label,
            coords: r.coords,
          })),
        );
      } finally {
        if (id === searchId.current) setSearching(false);
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const applyDraft = () => {
    if (!draft) return;
    form.setFieldsValue({ latitude: draft.lat, longitude: draft.lng });
    setOpen(false);
  };

  const selectSearchResult = (_: string, option: SearchOption) => {
    setDraft(option.coords);
    setSearch('');
    setSearchOptions([]);
  };

  return (
    <>
      <Typography.Text type="secondary" className="location-picker__status">
        {saved ? formatCoordinates(saved.lat, saved.lng) : 'Chưa chọn vị trí'}
      </Typography.Text>
      <Space wrap>
        <Button icon={<EnvironmentOutlined />} onClick={() => setOpen(true)}>
          {saved ? 'Đổi vị trí' : 'Chọn trên bản đồ'}
        </Button>
        {saved ? (
          <>
            <Button
              type="link"
              href={googleMapsUrl(saved.lat, saved.lng)}
              target="_blank"
            >
              Xem bản đồ
            </Button>
            <Button
              type="link"
              danger
              onClick={() =>
                form.setFieldsValue({ latitude: null, longitude: null })
              }
            >
              Xóa vị trí
            </Button>
          </>
        ) : null}
      </Space>

      <Modal
        title="Chọn vị trí trên bản đồ"
        open={open}
        onCancel={() => setOpen(false)}
        afterOpenChange={setMapVisible}
        width="100%"
        wrapClassName="location-picker-modal"
        transitionName=""
        maskTransitionName=""
        destroyOnHidden
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ disabled: !draft }}
        onOk={applyDraft}
      >
        <div className="location-picker">
          <AutoComplete
            className="location-picker__search"
            value={search}
            options={searchOptions}
            onSearch={setSearch}
            onSelect={selectSearchResult}
            notFoundContent={
              searching ? <Spin size="small" /> : 'Không tìm thấy'
            }
          >
            <Input
              placeholder="Tìm địa chỉ..."
              prefix={<SearchOutlined />}
              allowClear
            />
          </AutoComplete>
          <Typography.Text type="secondary" className="location-picker__hint">
            Chạm hoặc nhấp vào bản đồ để chọn vị trí
          </Typography.Text>
          {mapVisible ? (
            <LocationMap value={draft} onChange={setDraft} />
          ) : null}
          {draft ? (
            <Typography.Text
              type="secondary"
              className="location-picker__coords"
            >
              {formatCoordinates(draft.lat, draft.lng)}
            </Typography.Text>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

export function LocationFormFields() {
  return (
    <>
      <Form.Item name="latitude" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item name="longitude" hidden>
        <InputNumber />
      </Form.Item>
      <Form.Item label="Vị trí">
        <LocationPickerInput />
      </Form.Item>
    </>
  );
}
