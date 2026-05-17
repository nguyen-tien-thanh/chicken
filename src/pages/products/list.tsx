import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  List as AntdList,
  DeleteButton,
  ShowButton,
  useDrawerForm,
  useTable,
} from '@refinedev/antd';
import type { BaseRecord } from '@refinedev/core';
import { useSelect, useShow } from '@refinedev/core';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import {
  ResponsiveTable,
  type ResponsiveColumnType,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery, useResponsiveDrawerWidth } from '@/hooks';
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_OPTIONS,
  type IProduct,
  type IProductCategory,
  type ProductType,
} from '@/types';

export const List = () => {
  const formDrawerWidth = useResponsiveDrawerWidth();
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showId, setShowId] = useState<string | undefined>(undefined);

  const {
    drawerProps: createDrawerProps,
    formProps: createFormProps,
    saveButtonProps: createSaveButtonProps,
    show: showCreateDrawer,
    close: closeCreateDrawer,
  } = useDrawerForm({
    resource: 'products',
    action: 'create',
    syncWithLocation: false,
    defaultFormValues: {
      type: PRODUCT_TYPE_OPTIONS[0].value,
    },
  });

  const {
    drawerProps: editDrawerProps,
    formProps: editFormProps,
    saveButtonProps: editSaveButtonProps,
    show: showEditDrawer,
    close: closeEditDrawer,
  } = useDrawerForm({
    resource: 'products',
    action: 'edit',
    syncWithLocation: false,
    meta: {
      select: '*,category:product_categories(*)',
    },
  });

  const { result: showRecord, query: showQuery } = useShow<IProduct>({
    resource: 'products',
    id: showId ?? '',
    queryOptions: { enabled: !!showId },
    meta: {
      select: '*,category:product_categories(*)',
    },
  });

  const {
    options: categoryOptions,
    onSearch: onSearchCategory,
    query: categoriesQuery,
  } = useSelect({
    resource: 'product_categories',
    optionLabel: (item: IProductCategory) => item.name,
    optionValue: (item: IProductCategory) => item.id,
  });

  useEffect(() => {
    const id = searchParams.get('show');
    if (!id) return;
    setShowId(id);
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        next.delete('show');
        return next;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  const { tableProps, filters, sorters } = useTable<IProduct>({
    syncWithLocation: true,
    resource: 'products',
    meta: {
      select: '*,category:product_categories(*)',
    },
    filters: {
      initial: [
        { field: 'name', operator: 'contains', value: undefined },
        { field: 'type', operator: 'eq', value: undefined },
      ],
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
        ) : (
          '—'
        ),
    },
    {
      dataIndex: 'created_at',
      title: 'Ngày tạo',
      sorter: true,
      defaultSortOrder: 'descend',
      mobileRole: 'hidden',
      render: (v: string) => (v ? <RelativeTime value={v} /> : '—'),
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      fixed: 'right',
      mobileRole: 'actions',
      render: (_, record: BaseRecord) => (
        <Space>
          <Tooltip title="Sửa">
            <Button
              variant="outlined"
              icon={<EditOutlined />}
              onClick={() => showEditDrawer(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xem">
            <ShowButton hideText recordItemId={record.id} />
          </Tooltip>
          <DeleteButton hideText recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  const showType = showRecord?.type as ProductType | undefined;

  return (
    <AntdList
      headerButtons={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showCreateDrawer()}
        >
          Tạo mới
        </Button>
      }
    >
      <ResponsiveTable
        {...tableProps}
        resource="products"
        columns={columns}
        filters={filters}
        sorters={sorters}
        meta={{ select: '*,category:product_categories(*)' }}
        rowKey="id"
      />

      <Drawer
        {...createDrawerProps}
        width={formDrawerWidth}
        title="Tạo sản phẩm"
        extra={
          <Space>
            <Button onClick={closeCreateDrawer}>Đóng</Button>
            <Button type="primary" {...createSaveButtonProps}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form {...createFormProps} layout="vertical">
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
        </Form>
      </Drawer>

      <Drawer
        {...editDrawerProps}
        width={formDrawerWidth}
        title="Sửa sản phẩm"
        extra={
          <Space>
            <Button onClick={closeEditDrawer}>Đóng</Button>
            <Button type="primary" {...editSaveButtonProps}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form {...editFormProps} layout="vertical">
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
        </Form>
      </Drawer>

      <Drawer
        title="Chi tiết sản phẩm"
        width={formDrawerWidth}
        open={!!showId}
        onClose={() => setShowId(undefined)}
        destroyOnHidden
      >
        {showQuery.isLoading ? (
          <Spin />
        ) : (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã">{showRecord?.id}</Descriptions.Item>
            <Descriptions.Item label="Tên">
              {showRecord?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              {showType ? <Tag>{PRODUCT_TYPE_LABELS[showType]}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {showRecord?.category ? (
                <Link to={`/product_categories/show/${showRecord.category.id}`}>
                  {showRecord.category.name}
                </Link>
              ) : (
                showRecord?.category_id ?? '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {showRecord?.created_at ? (
                <RelativeTime value={showRecord.created_at} />
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {showRecord?.updated_at ? (
                <RelativeTime value={showRecord.updated_at} />
              ) : (
                '—'
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </AntdList>
  );
};
