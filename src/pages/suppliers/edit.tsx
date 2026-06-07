import { Edit as AntdEdit, useForm } from '@refinedev/antd';
import { Form } from 'antd';

import { SupplierFormFields } from './form-fields';

export const Edit = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: 'suppliers',
  });

  return (
    <AntdEdit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <SupplierFormFields />
      </Form>
    </AntdEdit>
  );
};
