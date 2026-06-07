import { Flex, Typography } from 'antd';

import { formatMoney } from '@/utils';

const { Text } = Typography;

export function VoucherSummaryBox({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={8}
      style={{
        marginTop: 8,
        padding: '12px 16px',
        background: 'var(--ant-color-fill-quaternary)',
        borderRadius: 8,
      }}
    >
      <Text type="secondary">{label}</Text>
      <Text strong style={{ fontSize: 16 }}>
        {formatMoney(amount)}
      </Text>
    </Flex>
  );
}
