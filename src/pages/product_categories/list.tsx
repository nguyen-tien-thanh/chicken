import { List as AntdList, useTable } from '@refinedev/antd';
import { useInfiniteList, useNavigation } from '@refinedev/core';
import { SearchOutlined } from '@ant-design/icons';
import { Divider, Empty, Flex, Input, Result, Skeleton, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { MobileShowList } from '@/components';
import type { IProductCategory } from '@/types';
import { DATETIME_FORMAT } from '@/utils';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 200;

export const List = () => {
  const { show } = useNavigation();
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const syncedFromUrl = useRef(false);

  const { filters, sorters, setFilters } = useTable<IProductCategory>({
    resource: 'product_categories',
    syncWithLocation: true,
    sorters: { initial: [{ field: 'name', order: 'asc' }] },
    queryOptions: { enabled: false },
  });

  const {
    result: { data, hasNextPage },
    query: { isError, isLoading, fetchNextPage },
  } = useInfiniteList<IProductCategory>({
    resource: 'product_categories',
    filters,
    sorters,
    pagination: { pageSize: PAGE_SIZE },
  });

  const records = useMemo(
    () => (data?.pages ?? []).flatMap(page => page.data),
    [data?.pages],
  );

  useEffect(() => {
    if (syncedFromUrl.current) return;

    const orFilter = filters.find(
      f => 'operator' in f && f.operator === 'or' && Array.isArray(f.value),
    );
    const nameFilter =
      orFilter && 'value' in orFilter
        ? orFilter.value.find(
            (f: { field?: string; value?: unknown }) => f.field === 'name',
          )
        : undefined;
    const fromUrl =
      nameFilter && 'value' in nameFilter ? String(nameFilter.value) : '';

    if (fromUrl) setSearch(fromUrl);
    if (fromUrl || filters.length === 0) syncedFromUrl.current = true;
  }, [filters]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = value.trim();
      setFilters(
        q
          ? [
              {
                operator: 'or',
                value: [{ field: 'name', operator: 'contains', value: q }],
              },
            ]
          : [],
        'replace',
      );
    }, SEARCH_DEBOUNCE_MS);
  };

  return (
    <AntdList>
      <Input
        allowClear
        placeholder="Tìm tên danh mục..."
        style={{ marginBottom: 16, maxWidth: 480 }}
        size="large"
        value={search}
        onChange={e => handleSearchChange(e.target.value)}
        suffix={<SearchOutlined />}
      />

      {isError ? (
        <Result status="error" title="Không tải được danh sách" />
      ) : isLoading && records.length === 0 ? (
        <Flex justify="center" style={{ padding: 24 }}>
          <Spin />
        </Flex>
      ) : records.length === 0 ? (
        <Empty description="Không có dữ liệu" style={{ padding: '24px 0' }} />
      ) : (
        <InfiniteScroll
          dataLength={records.length}
          next={() => fetchNextPage()}
          hasMore={!!hasNextPage}
          loader={
            <Flex justify="center">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Flex>
          }
          endMessage={<Divider plain>Đã hiển thị tất cả</Divider>}
        >
          <MobileShowList
            dataSource={records}
            getKey={row => row.id}
            onItemClick={row => show('product_categories', row.id)}
            renderTitle={row => row.name}
            renderDescription={row =>
              row.created_at
                ? dayjs(row.created_at).format(DATETIME_FORMAT)
                : undefined
            }
          />
        </InfiniteScroll>
      )}
    </AntdList>
  );
};
