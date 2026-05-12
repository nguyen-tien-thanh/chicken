import {
  List as AntdList,
  DeleteButton,
  EditButton,
  FilterDropdown,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Input, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import { Link, useSearchParams } from "react-router";

import { RelativeTime } from "@/components/relative-time";
import type { IPurchase } from "@/types";
import { formatMoney } from "@/utils";

export const List = () => {
  const [searchParams] = useSearchParams();
  const supplier_idParam = searchParams.get("supplier_id");

  const { tableProps } = useTable<IPurchase>({
    syncWithLocation: true,
    resource: "purchases",
    meta: {
      include: {
        supplier: { select: { id: true, name: true, phone: true } },
      },
    },
    filters: {
      ...(supplier_idParam
        ? {
            permanent: [
              {
                field: "supplier_id",
                operator: "eq",
                value: supplier_idParam,
              },
            ],
          }
        : {}),
      initial: [
        { field: "purchase_date", operator: "contains", value: undefined },
        { field: "supplier.name", operator: "contains", value: undefined },
        { field: "total_amount", operator: "contains", value: undefined },
        { field: "note", operator: "contains", value: undefined },
        { field: "created_at", operator: "contains", value: undefined },
      ],
    },
    sorters: { initial: [{ field: "purchase_date", order: "desc" }] },
  });

  return (
    <AntdList>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="purchase_date"
          title="Ngày nhập"
          sorter
          defaultSortOrder="descend"
          render={(v: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "—")}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input.Search placeholder="Tìm ngày nhập..." />
            </FilterDropdown>
          )}
        />
        <Table.Column
          title="Nhà cung cấp"
          dataIndex={["supplier", "name"]}
          sorter
          render={(_, r: IPurchase) =>
            r.supplier ? (
              <Link to={`/suppliers/show/${r.supplier.id}`}>
                {r.supplier.name}
              </Link>
            ) : (
              r.supplier_id ?? "—"
            )
          }
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input.Search placeholder="Tìm nhà cung cấp..." />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="cages_count"
          title="Số lồng"
          align="right"
          sorter
          render={(v: number) => (v != null ? `${v} lồng` : "—")}
        />
        <Table.Column
          dataIndex="cages_weight"
          title="Tổng trọng lượng lồng"
          align="right"
          sorter
          render={(v: number) => (v != null ? `${v} kg` : "—")}
        />
        <Table.Column
          title="Tổng tiền"
          align="right"
          sorter
          dataIndex="total_amount"
          render={(_, r: IPurchase) => (
            <Typography.Text strong>
              {formatMoney(r.total_amount)}
            </Typography.Text>
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input.Search placeholder="Tìm tổng tiền..." />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="average_weight"
          title="TB kg/con"
          align="right"
          sorter
          render={(v: number) => (v != null ? `${v} kg` : "—")}
        />
        <Table.Column
          dataIndex="note"
          title="Ghi chú"
          ellipsis
          sorter
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input.Search placeholder="Tìm ghi chú..." />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title="Ngày tạo"
          sorter
          responsive={["xl"]}
          render={(v: string) => (v ? <RelativeTime value={v} /> : "—")}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input.Search placeholder="Tìm ngày tạo..." />
            </FilterDropdown>
          )}
        />
        <Table.Column
          title="Thao tác"
          dataIndex="actions"
          fixed="right"
          render={(_, record) => (
            <Space>
              <EditButton hideText recordItemId={record.id} />
              <ShowButton hideText recordItemId={record.id} />
              <DeleteButton hideText recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </AntdList>
  );
};
