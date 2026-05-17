import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  List as AntdList,
  DeleteButton,
  ShowButton,
  useDrawerForm,
  useTable,
} from '@refinedev/antd';
import type { BaseRecord } from '@refinedev/core';
import { useShow } from '@refinedev/core';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import {
  LocationFormFields,
  LocationShowValue,
  ResponsiveTable,
  type ResponsiveColumnType,
} from '@/components';
import { RelativeTime } from '@/components/relative-time';
import { MEDIA_MD_DOWN, useMediaQuery, useResponsiveDrawerWidth } from '@/hooks';
import { type ISupplier } from '@/types';
import { BankNameOptions } from '@/types/bank-name-enum';

function SupplierFormFields() {
  return (
    <>
      <Form.Item
        label="Tên nhà cung cấp"
        name="name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Điện thoại" name="phone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input.TextArea rows={2} />
      </Form.Item>
      <LocationFormFields />
      <Form.Item label="Tên ngân hàng" name="bank_name">
        <Select options={BankNameOptions} showSearch />
      </Form.Item>
      <Form.Item label="Số tài khoản" name="bank_account">
        <Input />
      </Form.Item>
    </>
  );
}

export const List = () => {
  const drawerWidth = useResponsiveDrawerWidth();
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
    resource: 'suppliers',
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
    resource: 'suppliers',
    action: 'edit',
    syncWithLocation: false,
  });

  const { result: showRecord, query: showQuery } = useShow<ISupplier>({
    resource: 'suppliers',
    id: showId ?? '',
    queryOptions: { enabled: !!showId },
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

  const { tableProps, filters, sorters } = useTable<ISupplier>({
    syncWithLocation: true,
    resource: 'suppliers',
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
    queryOptions: { enabled: !isMobile },
  });

  const columns: ResponsiveColumnType<ISupplier>[] = [
    {
      title: 'Tên nhà cung cấp',
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
          <Tooltip title="Xem">
            <ShowButton hideText recordItemId={record.id} />
          </Tooltip>
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
      <ResponsiveTable
        {...tableProps}
        resource="suppliers"
        columns={columns}
        filters={filters}
        sorters={sorters}
        rowKey="id"
      />

      <Drawer
        {...createDrawerProps}
        width={drawerWidth}
        title="Tạo nhà cung cấp"
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
          <SupplierFormFields />
        </Form>
      </Drawer>

      <Drawer
        {...editDrawerProps}
        width={drawerWidth}
        title="Sửa nhà cung cấp"
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
          <SupplierFormFields />
        </Form>
      </Drawer>

      <Drawer
        title="Chi tiết nhà cung cấp"
        width={drawerWidth}
        open={!!showId}
        onClose={() => setShowId(undefined)}
        destroyOnHidden
      >
        {showQuery.isLoading ? (
          <Spin />
        ) : (
          <>
            <Space style={{ marginBottom: 16 }} wrap>
              <Link
                to={`/purchases/create?supplier_id=${showRecord?.id ?? ''}`}
              >
                <Button type="primary" disabled={!showRecord?.id}>
                  Tạo phiếu nhập
                </Button>
              </Link>
              <Link
                to={
                  showRecord?.id
                    ? `/purchases?supplier_id=${showRecord.id}`
                    : '/purchases'
                }
              >
                <Button disabled={!showRecord?.id}>Phiếu nhập của NCC</Button>
              </Link>
            </Space>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã">{showRecord?.id}</Descriptions.Item>
              <Descriptions.Item label="Tên">
                {showRecord?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {showRecord?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Tên ngân hàng">
                {showRecord?.bank_name ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Số TK ngân hàng">
                {showRecord?.bank_account ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {showRecord?.address ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí">
                <LocationShowValue
                  latitude={showRecord?.latitude}
                  longitude={showRecord?.longitude}
                />
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
          </>
        )}
      </Drawer>
    </AntdList>
  );
};
