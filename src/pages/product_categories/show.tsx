import {
  CreateButton,
  DeleteButton,
  EditButton,
  ListButton,
} from '@refinedev/antd';
import { useShow } from '@refinedev/core';
import dayjs from 'dayjs';

import { MobileShowDetails, MobileShowPage } from '@/components';
import { RelativeTime } from '@/components/relative-time';
import type { IProductCategory } from '@/types';
import { DATETIME_FORMAT } from '@/utils';

export const Show = () => {
  const { result: record, query } = useShow<IProductCategory>({
    resource: 'product_categories',
  });
  const { isLoading } = query;

  return (
    <MobileShowPage
      loading={isLoading}
      title={record?.name}
      actions={
        <>
          <ListButton />
          <EditButton />
          <DeleteButton />
          {record?.id ? <CreateButton /> : null}
        </>
      }
    >
      <MobileShowDetails
        items={[
          { label: 'Tên danh mục', value: record?.name },
          {
            label: 'Ngày tạo',
            value: record?.created_at && (
              <RelativeTime value={record.created_at} emptyText="" />
            ),
          },
          {
            label: 'Ngày xóa mềm',
            value:
              record?.deleted_at &&
              dayjs(record.deleted_at).format(DATETIME_FORMAT),
            hidden: !record?.deleted_at,
          },
        ]}
      />
    </MobileShowPage>
  );
};
