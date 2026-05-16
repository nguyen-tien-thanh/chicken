import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  List as AntdList,
  DeleteButton,
  FilterDropdown,
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
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import type { IProductCategory } from '@/types';

const DRAWER_WIDTH = '45vw';

export const List = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showId, setShowId] = useState<string | undefined>(undefined);

  const {
    drawerProps: createDrawerProps,
    formProps: createFormProps,
    saveButtonProps: createSaveButtonProps,
    show: showCreateDrawer,
    close: closeCreateDrawer,
  } = useDrawerForm({
    resource: 'product_categories',
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
    resource: 'product_categories',
    action: 'edit',
    syncWithLocation: false,
  });

  const { result: showRecord, query: showQuery } = useShow<IProductCategory>({
    resource: 'product_categories',
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

  const { tableProps } = useTable<IProductCategory>({
    syncWithLocation: true,
    resource: 'product_categories',
    filters: {
      initial: [{ field: 'name', operator: 'contains', value: undefined }],
    },
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
          title="Tên danh mục"
          sorter
          filterDropdown={props => (
            <FilterDropdown {...props} children={<Input.Search />} />
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title="Ngày tạo"
          render={(v: string | null) =>
            v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'
          }
        />
        <Table.Column
          dataIndex="deleted_at"
          title="Ngày xóa mềm"
          render={(v: string | null) =>
            v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'
          }
        />
        <Table.Column
          title="Thao tác"
          dataIndex="actions"
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
                <Button
                  variant="outlined"
                  icon={<EyeOutlined />}
                  onClick={() => setShowId(String(record.id))}
                />
              </Tooltip>
              <DeleteButton hideText recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>

      <Drawer
        {...createDrawerProps}
        width={DRAWER_WIDTH}
        title="Tạo danh mục"
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
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        {...editDrawerProps}
        width={DRAWER_WIDTH}
        title="Sửa danh mục"
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
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Chi tiết danh mục"
        width={DRAWER_WIDTH}
        open={!!showId}
        onClose={() => setShowId(undefined)}
        destroyOnClose
      >
        {showQuery.isLoading ? (
          <Spin />
        ) : (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã">{showRecord?.id}</Descriptions.Item>
            <Descriptions.Item label="Tên danh mục">
              {showRecord?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày xóa mềm">
              {showRecord?.deleted_at
                ? dayjs(showRecord.deleted_at).format('DD/MM/YYYY HH:mm')
                : '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </AntdList>
  );
};
