import { Create as AntdCreate, useForm } from '@refinedev/antd';
import { Form } from 'antd';

import { PRODUCT_TYPE_OPTIONS } from '@/types';

import { ProductFormFields } from './form-fields';

export const Create = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'products',
    redirect: 'show',
    defaultFormValues: {
      type: PRODUCT_TYPE_OPTIONS[0].value,
    },
  });

  return (
    <AntdCreate saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <ProductFormFields />
      </Form>
    </AntdCreate>
  );
};
