import { Create as AntdCreate, useForm } from '@refinedev/antd';
import { Form } from 'antd';

import { CustomerFormFields } from './form-fields';

export const Create = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'customers',
  });

  return (
    <AntdCreate saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <CustomerFormFields />
      </Form>
    </AntdCreate>
  );
};
