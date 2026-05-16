import {
  MinusCircleOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Create as AntdCreate, useForm } from "@refinedev/antd";
import {
  useCreate,
  useCreateMany,
  useInvalidate,
  useSelect,
  useWarnAboutChange,
} from "@refinedev/core";
import type { FormProps } from "antd";
import {
  App,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { InputMoney } from "@/components";
import type { ICustomer, IProduct } from "@/types";
import { SALE_STATUS_OPTIONS, type SaleStatus } from "@/types";
import { formatMoney } from "@/utils";

const { Text } = Typography;

type LineItem = {
  key: number;
  product_id?: string;
  quantity: number;
  quantity_unit: "kg" | "con";
  unit_price: number;
  note?: string;
};

type FormValues = {
  customer_id?: string;
  sale_date?: dayjs.Dayjs;
  discount_amount?: number;
  paid_amount?: number;
  status?: SaleStatus;
  note?: string;
};

let nextKey = 1;
function newRow(): LineItem {
  return {
    key: nextKey++,
    quantity_unit: "kg",
    quantity: 1,
    unit_price: 0,
  };
}

export const Create = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query_customer_id = searchParams.get("customer_id") ?? undefined;

  const [lines, setLines] = useState<LineItem[]>([newRow()]);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [createCustomerForm] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  const { mutate: createCustomer } = useCreate();
  const { mutateAsync: createSale } = useCreate();
  const { mutateAsync: createSaleItems } = useCreateMany();
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps, form } = useForm({
    resource: "sales",
    defaultFormValues: {
      ...(query_customer_id ? { customer_id: query_customer_id } : {}),
      sale_date: dayjs(),
      discount_amount: 0,
      paid_amount: 0,
      status: "PENDING" as SaleStatus,
    } as never,
  });

  const {
    options: customerOptions,
    onSearch: onSearchCustomer,
    query: customersQuery,
  } = useSelect({
    resource: "customers",
    optionLabel: (item: ICustomer) =>
      `${item.name ?? item.phone} (${item.phone})`,
    optionValue: (item: ICustomer) => item.id,
  });

  function handleOpenCreateCustomer() {
    createCustomerForm.setFieldsValue({ phone: customerSearchText, name: "" });
    setCreateCustomerOpen(true);
  }

  function handleCreateCustomer() {
    createCustomerForm.validateFields().then((values) => {
      createCustomer(
        { resource: "customers", values },
        {
          onSuccess: (data) => {
            form?.setFieldValue("customer_id", data.data.id);
            customersQuery.refetch();
            setCreateCustomerOpen(false);
            createCustomerForm.resetFields();
          },
        }
      );
    });
  }

  const {
    options: productOptions,
    onSearch: onSearchProduct,
    query: productsQuery,
  } = useSelect({
    resource: "products",
    optionLabel: (item: IProduct) => item.name,
    optionValue: (item: IProduct) => item.id,
  });

  function updateLine<K extends keyof LineItem>(
    key: number,
    field: K,
    value: LineItem[K]
  ) {
    setLines((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  }

  function removeLine(key: number) {
    setLines((prev) => prev.filter((row) => row.key !== key));
  }

  const subtotal = lines.reduce((sum, row) => {
    if (!row.product_id) return sum;
    return sum + row.quantity * row.unit_price;
  }, 0);

  const onFinish: FormProps["onFinish"] = (values) => {
    const v = values as FormValues;
    const validLines = lines.filter((row) => row.product_id);
    if (validLines.length === 0) {
      notification.warning({
        message: "Thêm ít nhất một dòng có chọn sản phẩm",
      });
      return Promise.resolve();
    }
    const discount_amount = Number(v.discount_amount ?? 0);
    const paid_amount = Number(v.paid_amount ?? 0);
    const items = validLines.map((row) => {
      const amount = row.quantity * row.unit_price;
      return {
        product_id: row.product_id!,
        quantity: row.quantity,
        quantity_unit: row.quantity_unit,
        unit_price: row.unit_price,
        amount,
        note: row.note ?? null,
        cost_amount: 0,
        profit_amount: amount,
      };
    });
    const subtotal_amount = items.reduce((s, row) => s + row.amount, 0);
    const final_amount = Math.max(0, subtotal_amount - discount_amount);
    const remaining_amount = Math.max(0, final_amount - paid_amount);
    const salePayload = {
      customer_id: v.customer_id,
      sale_date: v.sale_date
        ? dayjs(v.sale_date).toISOString()
        : dayjs().toISOString(),
      note: v.note ?? null,
      discount_amount,
      paid_amount,
      status: v.status ?? "PENDING",
      subtotal_amount,
      final_amount,
      remaining_amount,
    };
    return (async () => {
      setIsSaving(true);
      try {
        const { data: created } = await createSale({
          resource: "sales",
          values: salePayload,
        });
        const saleId = created?.id as string | undefined;
        if (!saleId) {
          throw new Error("Không lấy được id phiếu bán sau khi tạo");
        }
        await createSaleItems({
          resource: "sale_items",
          values: items.map((row) => ({ ...row, sale_id: saleId })),
        });
        await invalidate({ resource: "sales", invalidates: ["list"] });
        await invalidate({ resource: "sale_items", invalidates: ["list"] });
        notification.success({ message: "Đã tạo phiếu bán" });
        setWarnWhen(false);
        navigate(`/sales/show/${saleId}`);
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message: unknown }).message)
            : "Không tạo được phiếu bán";
        notification.error({ message: msg });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const columns = [
    {
      title: "#",
      width: 44,
      render: (_: unknown, _row: LineItem, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: "Sản phẩm",
      width: 360,
      render: (_: unknown, row: LineItem) => (
        <Select
          placeholder="Chọn sản phẩm"
          value={row.product_id}
          options={productOptions}
          loading={productsQuery.isFetching}
          showSearch
          onSearch={onSearchProduct}
          filterOption={false}
          optionFilterProp="label"
          allowClear
          style={{ width: "100%" }}
          onChange={(v) => updateLine(row.key, "product_id", v)}
        />
      ),
    },
    {
      title: "Số lượng",
      width: 120,
      render: (_: unknown, row: LineItem) => (
        <InputNumber
          min={0}
          step={0.1}
          style={{ width: "100%" }}
          value={row.quantity}
          onChange={(v) => updateLine(row.key, "quantity", v ?? 0)}
        />
      ),
    },
    {
      title: "Đơn vị",
      width: 110,
      render: (_: unknown, row: LineItem) => (
        <Select
          value={row.quantity_unit}
          options={[
            { value: "kg", label: "kg" },
            { value: "con", label: "con" },
          ]}
          style={{ width: "100%" }}
          onChange={(v) => updateLine(row.key, "quantity_unit", v)}
        />
      ),
    },
    {
      title: "Đơn giá",
      width: 160,
      render: (_: unknown, row: LineItem) => (
        <InputMoney
          value={row.unit_price}
          onChange={(v) =>
            updateLine(row.key, "unit_price", (v as number) ?? 0)
          }
        />
      ),
    },
    {
      title: "Thành tiền",
      width: 160,
      render: (_: unknown, row: LineItem) => (
        <Text strong>{formatMoney(row.quantity * row.unit_price)}</Text>
      ),
    },
    {
      title: "Ghi chú",
      width: 220,
      render: (_: unknown, row: LineItem) => (
        <Input
          placeholder="Tuỳ chọn"
          value={row.note}
          onChange={(e) => updateLine(row.key, "note", e.target.value)}
        />
      ),
    },
    {
      title: "",
      width: 52,
      fixed: "right" as const,
      render: (_: unknown, row: LineItem) => (
        <Tooltip title="Xoá dòng">
          <Button
            danger
            type="text"
            icon={<MinusCircleOutlined />}
            onClick={() => removeLine(row.key)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <AntdCreate
      saveButtonProps={{
        ...saveButtonProps,
        loading: isSaving,
        disabled: isSaving,
      }}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Khách hàng"
          name="customer_id"
          rules={[{ required: true, message: "Chọn khách hàng" }]}
        >
          <Select
            options={customerOptions}
            loading={customersQuery.isFetching}
            showSearch
            onSearch={(v) => {
              setCustomerSearchText(v);
              onSearchCustomer(v);
            }}
            filterOption={false}
            optionFilterProp="label"
            placeholder="Chọn khách hàng"
            popupRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "4px 0" }} />
                <Button
                  type="link"
                  icon={<UserAddOutlined />}
                  style={{ width: "100%", textAlign: "left" }}
                  onClick={handleOpenCreateCustomer}
                >
                  Tạo khách hàng mới
                  {customerSearchText ? ` "${customerSearchText}"` : ""}
                </Button>
              </>
            )}
          />
        </Form.Item>

        <Modal
          title="Tạo khách hàng mới"
          open={createCustomerOpen}
          onCancel={() => setCreateCustomerOpen(false)}
          onOk={handleCreateCustomer}
          okText="Tạo"
          cancelText="Huỷ"
          destroyOnHidden
        >
          <Form form={createCustomerForm} layout="vertical">
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: "Nhập số điện thoại" }]}
            >
              <Input placeholder="0912345678" />
            </Form.Item>
            <Form.Item label="Tên khách hàng" name="name">
              <Input placeholder="Tuỳ chọn" />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address">
              <Input placeholder="Tuỳ chọn" />
            </Form.Item>
          </Form>
        </Modal>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ngày bán"
              name="sale_date"
              rules={[{ required: true, message: "Chọn ngày bán" }]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Trạng thái" name="status">
              <Select options={SALE_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Giảm giá" name="discount_amount">
              <InputMoney style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Đã thanh toán" name="paid_amount">
              <InputMoney style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú phiếu" name="note">
          <Input.TextArea rows={2} placeholder="Tuỳ chọn" />
        </Form.Item>

        <Form.Item label="Chi tiết hàng bán">
          <Space
            style={{
              width: "100%",
              marginBottom: 8,
              justifyContent: "space-between",
            }}
            wrap
          >
            <Text type="secondary">
              Thêm sản phẩm, số lượng, đơn giá. Hệ thống tự tính thành tiền.
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                setLines((prev) => {
                  const last = prev[prev.length - 1];
                  return [
                    ...prev,
                    last
                      ? {
                          key: nextKey++,
                          product_id: last.product_id,
                          quantity_unit: last.quantity_unit,
                          unit_price: last.unit_price,
                          quantity: 1,
                        }
                      : newRow(),
                  ];
                })
              }
            >
              Thêm dòng
            </Button>
          </Space>
          <Table
            rowKey="key"
            dataSource={lines}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
          <div
            style={{
              marginTop: 8,
              padding: "12px 16px",
              background: "var(--ant-color-fill-quaternary)",
              borderRadius: 8,
              textAlign: "right",
            }}
          >
            <Text type="secondary">Tổng thành tiền (ước tính): </Text>
            <Text strong style={{ fontSize: 16 }}>
              {formatMoney(subtotal)}
            </Text>
          </div>
        </Form.Item>
      </Form>
    </AntdCreate>
  );
};
