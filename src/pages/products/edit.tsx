import { Edit as AntdEdit, useForm } from '@refinedev/antd';
import { Form } from 'antd';

import { ProductFormFields } from './form-fields';

export const Edit = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'products',
    meta: {
      select: '*,category:product_categories(*)',
    },
  });

  return (
    <AntdEdit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <ProductFormFields />
      </Form>
    </AntdEdit>
  );
};
