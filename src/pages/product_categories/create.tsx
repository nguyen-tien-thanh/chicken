import { Create as AntdCreate, useForm } from '@refinedev/antd';
import { Form, Input } from 'antd';

export const Create = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'product_categories',
  });

  return (
    <AntdCreate saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </AntdCreate>
  );
};
