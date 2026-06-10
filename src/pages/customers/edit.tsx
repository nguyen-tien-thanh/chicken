import { Edit as AntdEdit, useForm } from '@refinedev/antd';
import { Form } from 'antd';

import { CustomerFormFields } from './form-fields';

export const Edit = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'customers',
    redirect: 'show',
  });

  return (
    <AntdEdit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <CustomerFormFields />
      </Form>
    </AntdEdit>
  );
};
