import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  List as AntdList,
  DeleteButton,
  ShowButton,
  useDrawerForm,
  useTable,
} from '@refinedev/antd';
import type { BaseRecord } from '@refinedev/core';
import { Button, Drawer, Form, Input, Space, Tooltip } from 'antd';

import {
  LocationFormFields,
  ResponsiveTable,
  type ResponsiveColumnType,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import {
  MEDIA_MD_DOWN,
  useMediaQuery,
  useResponsiveDrawerWidth,
} from '@/hooks';
import type { ICustomer } from '@/types';
import { Link } from 'react-router';

function CustomerFormFields() {
  return (
    <>
      <Form.Item label="Tên" name="name">
        <Input />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea rows={2} />
      </Form.Item>
      <LocationFormFields />
    </>
  );
}

export const List = () => {
  const drawerWidth = useResponsiveDrawerWidth();
  const isMobile = useMediaQuery(MEDIA_MD_DOWN);

  const {
    drawerProps: createDrawerProps,
    formProps: createFormProps,
    saveButtonProps: createSaveButtonProps,
    show: showCreateDrawer,
    close: closeCreateDrawer,
  } = useDrawerForm({
    resource: 'customers',
    action: 'create',
    syncWithLocation: false,
  });

  const {
    drawerProps: editDrawerProps,
    formProps: editFormProps,
    saveButtonProps: editSaveButtonProps,
    show: showEditDrawer,
    close: closeEditDrawer,
  } = useDrawerForm({
    resource: 'customers',
    action: 'edit',
    syncWithLocation: false,
  });

  const { tableProps, filters, sorters, setFilters } = useTable<ICustomer>({
    resource: 'customers',
    syncWithLocation: true,
    sorters: { initial: [{ field: 'name', order: 'asc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<ICustomer>[] = [
    {
      title: 'Tên',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      mobileRole: 'title',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      sorter: true,
      mobileRole: 'subtitle',
      render: (phone: string) => <Link to={`tel:${phone}`}>{phone}</Link>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (address: string | null) => (
        <Space size="small">{address ?? '—'}</Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      sorter: true,
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
          <ShowButton hideText recordItemId={record.id} />
          <DeleteButton hideText recordItemId={record.id} />
        </Space>
      ),
    },
  ];

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
      <Input.Search
        allowClear
        placeholder="Tìm tên hoặc SĐT..."
        style={{ marginBottom: 16, maxWidth: 480 }}
        onSearch={value => {
          const q = value.trim();
          setFilters(
            q
              ? [
                  {
                    operator: 'or',
                    value: [
                      { field: 'name', operator: 'contains', value: q },
                      { field: 'phone', operator: 'contains', value: q },
                    ],
                  },
                ]
              : [],
            'replace',
          );
        }}
      />

      <ResponsiveTable
        {...tableProps}
        resource="customers"
        columns={columns}
        filters={filters}
        sorters={sorters}
        rowKey="id"
      />

      <Drawer
        {...createDrawerProps}
        width={drawerWidth}
        title="Tạo khách hàng"
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
          <CustomerFormFields />
        </Form>
      </Drawer>

      <Drawer
        {...editDrawerProps}
        width={drawerWidth}
        title="Sửa khách hàng"
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
          <CustomerFormFields />
        </Form>
      </Drawer>
    </AntdList>
  );
};
