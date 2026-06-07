import { Form, Input } from 'antd';

import { LocationFormFields } from '@/components';

export function CustomerFormFields() {
  return (
    <>
      <Form.Item label="Tên" name="name">
        <Input />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea rows={2} />
      </Form.Item>
      <LocationFormFields />
    </>
  );
}
