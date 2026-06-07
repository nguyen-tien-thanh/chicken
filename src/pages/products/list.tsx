import {
  List as AntdList,
  DeleteButton,
  EditButton,
  ShowButton,
  useTable,
} from '@refinedev/antd';
import { Space, Tag } from 'antd';
import { Link } from 'react-router';

import { ResponsiveTable, type ResponsiveColumnType } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery } from '@/hooks';
import {
  PRODUCT_TYPE_LABELS,
  type IProduct,
  type ProductType,
} from '@/types';

export const List = () => {
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const { tableProps, filters, sorters } = useTable<IProduct>({
    syncWithLocation: true,
    resource: 'products',
    meta: {
      select: '*,category:product_categories(*)',
    },
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<IProduct>[] = [
    {
      dataIndex: 'name',
      title: 'Tên sản phẩm',
      sorter: true,
      mobileRole: 'title',
    },
    {
      dataIndex: 'type',
      title: 'Loại',
      mobileRole: 'subtitle',
      render: (t: ProductType) => <Tag>{PRODUCT_TYPE_LABELS[t] ?? t}</Tag>,
    },
    {
      key: 'category',
      title: 'Danh mục',
      render: (_, r) =>
        r.category ? (
          <Link to={`/product_categories/show/${r.category.id}`}>
            {r.category.name}
          </Link>
        ) : null,
    },
    {
      dataIndex: 'created_at',
      title: 'Ngày tạo',
      sorter: true,
      defaultSortOrder: 'descend',
      mobileRole: 'hidden',
      render: (v: string) => v && <RelativeTime value={v} />,
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      fixed: 'right',
      mobileRole: 'actions',
      render: (_, record) => (
        <Space>
          <EditButton hideText recordItemId={record.id} />
          <ShowButton hideText recordItemId={record.id} />
          <DeleteButton hideText recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  return (
    <AntdList>
      <ResponsiveTable
        {...tableProps}
        resource="products"
        columns={columns}
        filters={filters}
        sorters={sorters}
        meta={{ select: '*,category:product_categories(*)' }}
        rowKey="id"
      />
    </AntdList>
  );
};
