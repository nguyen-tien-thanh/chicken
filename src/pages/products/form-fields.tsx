import { useSelect } from '@refinedev/core';
import { Form, Input, Select } from 'antd';

import {
  PRODUCT_TYPE_OPTIONS,
  type IProductCategory,
} from '@/types';

export function ProductFormFields() {
  const {
    options: categoryOptions,
    onSearch: onSearchCategory,
    query: categoriesQuery,
  } = useSelect({
    resource: 'product_categories',
    optionLabel: (item: IProductCategory) => item.name,
    optionValue: (item: IProductCategory) => item.id,
  });

  return (
    <>
      <Form.Item
        label="Tên sản phẩm"
        name="name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
        <Select options={PRODUCT_TYPE_OPTIONS} />
      </Form.Item>
      <Form.Item
        label="Danh mục"
        name="category_id"
        rules={[{ required: true }]}
      >
        <Select
          options={categoryOptions}
          loading={categoriesQuery.isFetching}
          showSearch
          onSearch={onSearchCategory}
          filterOption={false}
          optionFilterProp="label"
        />
      </Form.Item>
    </>
  );
}
