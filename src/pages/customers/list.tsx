import {
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  List as AntdList,
  DeleteButton,
  FilterDropdown,
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
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { LocationFormFields, LocationShowValue } from '@/components';
import { googleMapsLink } from '@/components/location-picker/utils';
import { RelativeTime } from '@/components/relative-time';
import type { ICustomer } from '@/types';
import { useResponsiveDrawerWidth } from '@/hooks';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [showId, setShowId] = useState<string | undefined>(undefined);

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

  const { result: showRecord, query: showQuery } = useShow<ICustomer>({
    resource: 'customers',
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

  const { tableProps } = useTable<ICustomer>({
    syncWithLocation: true,
    resource: 'customers',
    filters: {
      initial: [
        { field: 'name', operator: 'contains', value: undefined },
        { field: 'phone', operator: 'contains', value: undefined },
      ],
    },
    sorters: { initial: [{ field: 'name', order: 'asc' }] },
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
        <Table.Column
          dataIndex="name"
          title="Tên"
          sorter
          defaultSortOrder="ascend"
        />
        <Table.Column
          dataIndex="phone"
          title="Điện thoại"
          sorter
          filterDropdown={props => (
            <FilterDropdown {...props} children={<Input.Search />} />
          )}
        />
        <Table.Column
          dataIndex="address"
          title="Địa chỉ"
          ellipsis
          render={(address: string | null, record: ICustomer) => {
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
          render={(v: string) => (v ? <RelativeTime value={v} /> : '—')}
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

      <Drawer
        title="Chi tiết khách hàng"
        width={drawerWidth}
        open={!!showId}
        onClose={() => setShowId(undefined)}
        destroyOnClose
      >
        {showQuery.isLoading ? (
          <Spin />
        ) : (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã">{showRecord?.id}</Descriptions.Item>
            <Descriptions.Item label="Tên">
              {showRecord?.name ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Điện thoại">
              {showRecord?.phone}
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
        )}
      </Drawer>
    </AntdList>
  );
};
