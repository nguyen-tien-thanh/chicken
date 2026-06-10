import { Create as AntdCreate, useForm } from '@refinedev/antd';
import { Form } from 'antd';

import { SupplierFormFields } from './form-fields';

export const Create = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'suppliers',
    redirect: 'show',
  });

  return (
    <AntdCreate saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <SupplierFormFields />
      </Form>
    </AntdCreate>
  );
};
