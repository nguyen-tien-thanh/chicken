import {
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from '@ant-design/icons';
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
  Table,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { LocationFormFields, LocationShowValue } from '@/components';
import { googleMapsLink } from '@/components/location-picker/utils';
import { RelativeTime } from '@/components/relative-time';
import { useResponsiveDrawerWidth } from '@/hooks';
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

  const { tableProps } = useTable<ISupplier>({
    syncWithLocation: true,
    resource: 'suppliers',
    filters: {
      initial: [
        { field: 'name', operator: 'contains', value: undefined },
        { field: 'phone', operator: 'contains', value: undefined },
      ],
    },
    sorters: { initial: [{ field: 'created_at', order: 'desc' }] },
  });

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
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Tên nhà cung cấp" sorter />
        <Table.Column dataIndex="phone" title="Điện thoại" sorter />
        <Table.Column
          dataIndex="address"
          title="Địa chỉ"
          ellipsis
          render={(address: string | null, record: ISupplier) => {
            const url = googleMapsLink(record);
            return (
              <Space size="small">
                <span>{address ?? '—'}</span>
                {url ? (
                  <Tooltip title="Mở Google Maps">
                    <Button
                      type="link"
                      size="small"
                      icon={<EnvironmentOutlined />}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: 0, flexShrink: 0 }}
                    />
                  </Tooltip>
                ) : null}
              </Space>
            );
          }}
        />
        <Table.Column
          dataIndex="created_at"
          title="Ngày tạo"
          sorter
          defaultSortOrder="descend"
          render={(v: string) => (v ? <RelativeTime value={v} /> : '—')}
        />
        <Table.Column
          title="Nghiệp vụ"
          render={(_, r: ISupplier) => (
            <Link to={`/purchases/create?supplier_id=${r.id}`}>Nhập hàng</Link>
          )}
        />
        <Table.Column
          title="Thao tác"
          dataIndex="actions"
          fixed="right"
          render={(_, record: BaseRecord) => (
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
          )}
        />
      </Table>

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
        destroyOnClose
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
