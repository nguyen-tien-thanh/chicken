import { Edit as AntdEdit, useForm } from '@refinedev/antd';
import { Form, Input } from 'antd';

export const Edit = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'product_categories',
    redirect: 'show',
  });

  return (
    <AntdEdit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </AntdEdit>
  );
};
