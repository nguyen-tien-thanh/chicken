import { Form, Input, Select } from 'antd';

import { LocationFormFields } from '@/components';
import { BankNameOptions } from '@/types/bank-name-enum';

export function SupplierFormFields() {
  return (
    <>
      <Form.Item
        label="Tên nhà cung cấp"
        name="name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea rows={2} />
      </Form.Item>
      <LocationFormFields />
      <Form.Item label="Tên ngân hàng" name="bank_name">
        <Select options={BankNameOptions} showSearch />
      </Form.Item>
      <Form.Item label="Số tài khoản" name="bank_account">
        <Input />
      </Form.Item>
    </>
  );
}
