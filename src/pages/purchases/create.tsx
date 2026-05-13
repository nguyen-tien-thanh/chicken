import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Create as AntdCreate, useForm } from "@refinedev/antd";
import { useCreate, useCreateMany, useInvalidate, useSelect, useWarnAboutChange } from "@refinedev/core";
import type { FormProps } from "antd";
import {
  App,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
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

import { FullScreenSpin, InputMoney } from "@/components";
import type { IProduct, ISupplier } from "@/types";
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
  supplier_id?: string;
  purchase_date?: dayjs.Dayjs;
  note?: string;
  average_weight?: number;
  cages_count?: number;
  cages_weight?: number;
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
  const supplier_idFromQuery = searchParams.get("supplier_id") ?? undefined;

  const [lines, setLines] = useState<LineItem[]>([newRow()]);
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: createPurchase } = useCreate();
  const { mutateAsync: createPurchaseItems } = useCreateMany();
  const invalidate = useInvalidate();
  const { setWarnWhen } = useWarnAboutChange();

  const { formProps, saveButtonProps } = useForm({
    resource: "purchases",
    defaultFormValues: {
      ...(supplier_idFromQuery ? { supplier_id: supplier_idFromQuery } : {}),
      purchase_date: dayjs(),
    } as never,
  });

  const {
    options: supplierOptions,
    onSearch: onSearchSupplier,
    query: suppliersQuery,
  } = useSelect({
    resource: "suppliers",
    optionLabel: (item: ISupplier) => `${item.name} (${item.phone})`,
    optionValue: (item: ISupplier) => item.id,
  });

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

  const total = lines.reduce((sum, row) => {
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
    const items = validLines.map((row) => ({
      product_id: row.product_id!,
      quantity: row.quantity,
      quantity_unit: row.quantity_unit,
      unit_price: row.unit_price,
      amount: row.quantity * row.unit_price,
      note: row.note ?? null,
    }));
    const total_amount = items.reduce((s, row) => s + row.amount, 0);
    const purchasePayload = {
      supplier_id: v.supplier_id,
      purchase_date: v.purchase_date
        ? dayjs(v.purchase_date).toISOString()
        : dayjs().toISOString(),
      note: v.note ?? null,
      average_weight: Number(v.average_weight ?? 0),
      cages_count: Number(v.cages_count ?? 0),
      cages_weight: Number(v.cages_weight ?? 0),
      total_amount,
    };
    return (async () => {
      setIsSaving(true);
      try {
        const { data: created } = await createPurchase({
          resource: "purchases",
          values: purchasePayload,
        });
        const purchaseId = created?.id as string | undefined;
        if (!purchaseId) {
          throw new Error("Không lấy được id phiếu nhập sau khi tạo");
        }
        await createPurchaseItems({
          resource: "purchase_items",
          values: items.map((row) => ({ ...row, purchase_id: purchaseId })),
        });
        await invalidate({ resource: "purchases", invalidates: ["list"] });
        await invalidate({ resource: "purchase_items", invalidates: ["list"] });
        notification.success({ message: "Đã tạo phiếu nhập" });
        setWarnWhen(false);
        navigate(`/purchases/show/${purchaseId}`);
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message: unknown }).message)
            : "Không tạo được phiếu nhập";
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

  if (suppliersQuery.isLoading || productsQuery.isLoading) {
    return <FullScreenSpin />;
  }

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
          label="Nhà cung cấp"
          name="supplier_id"
          rules={[{ required: true, message: "Chọn nhà cung cấp" }]}
        >
          <Select
            options={supplierOptions}
            loading={suppliersQuery.isFetching}
            showSearch
            onSearch={onSearchSupplier}
            filterOption={false}
            optionFilterProp="label"
            placeholder="Chọn nhà cung cấp"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Ngày nhập"
              name="purchase_date"
              rules={[{ required: true, message: "Chọn ngày nhập" }]}
            >
              <DatePicker
                showTime={false}
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trọng lượng trung bình (kg/con)"
              name="average_weight"
              rules={[
                {
                  required: true,
                  message: "Nhập Trọng lượng trung bình",
                },
              ]}
            >
              <InputNumber
                suffix="kg/con"
                style={{ width: "100%" }}
                placeholder="Trọng lượng trung bình"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Số lượng lồng"
              name="cages_count"
              rules={[{ required: true, message: "Nhập số lượng lồng" }]}
            >
              <InputNumber
                suffix="lồng"
                style={{ width: "100%" }}
                placeholder="Số lượng lồng"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tổng trọng lượng lồng"
              name="cages_weight"
              rules={[
                { required: true, message: "Nhập tổng trọng lượng lồng" },
              ]}
            >
              <InputNumber
                suffix="kg"
                style={{ width: "100%" }}
                placeholder="Tổng trọng lượng lồng"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú phiếu" name="note">
          <Input.TextArea rows={2} placeholder="Tuỳ chọn" />
        </Form.Item>

        <Form.Item label="Chi tiết hàng nhập">
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
              onClick={() => setLines((prev) => [...prev, newRow()])}
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
              {formatMoney(total)}
            </Text>
          </div>
        </Form.Item>
      </Form>
    </AntdCreate>
  );
};
