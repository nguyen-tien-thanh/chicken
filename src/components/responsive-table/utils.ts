import type { TableProps } from 'antd';
import { Flex, Space, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactNode,
} from 'react';

import type { MobileColumnRole, ResponsiveColumnType } from './types';

const ACTION_GROUP_TYPES = new Set<unknown>([Fragment, Space, Flex, Tooltip]);

type ButtonComponentType = {
  __ANT_BUTTON?: boolean;
  name?: string;
};

function isButtonElement(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;

  if (node.type === 'button') return true;

  const type = node.type as ButtonComponentType;

  if (type?.__ANT_BUTTON) return true;

  if (typeof node.type === 'function' && node.type.name?.endsWith('Button')) {
    return true;
  }

  return false;
}

/** Khớp Ant Design: cột `responsive: ['md']` chỉ hiện từ md trở lên */
export function isColumnVisibleOnMobile(column: ColumnType<unknown>): boolean {
  const role = (column as ResponsiveColumnType<unknown>).mobileRole;
  if (role === 'hidden') return false;

  const responsive = column.responsive;
  if (!responsive?.length) return true;

  return responsive.some(bp => bp === 'xs' || bp === 'sm');
}

function getDataIndexValue(
  record: Record<string, unknown>,
  dataIndex: ColumnType<unknown>['dataIndex'],
): unknown {
  if (dataIndex == null) return undefined;
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce<unknown>(
      (acc, key) =>
        acc != null && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[String(key)]
          : undefined,
      record,
    );
  }
  return record[String(dataIndex)];
}

export function renderColumnCell<RecordType extends object>(
  column: ColumnType<RecordType>,
  record: RecordType,
  index: number,
): ReactNode {
  const raw = getDataIndexValue(
    record as Record<string, unknown>,
    column.dataIndex,
  );
  if (column.render) {
    const rendered = column.render(raw, record, index);
    if (
      rendered != null &&
      typeof rendered === 'object' &&
      'children' in rendered
    ) {
      return (rendered as { children: ReactNode }).children;
    }
    return rendered as ReactNode;
  }
  if (raw == null || raw === '') return null;
  return raw as ReactNode;
}

export function renderColumnTitle(title: unknown): ReactNode {
  if (title == null || title === '') return null;
  if (typeof title === 'function') return null;
  return title as ReactNode;
}

function flattenActionNodes(content: ReactNode): ReactNode[] {
  const items: ReactNode[] = [];

  Children.forEach(content, child => {
    if (child == null || child === false) return;

    if (isButtonElement(child)) {
      items.push(child);
      return;
    }

    if (isValidElement(child) && ACTION_GROUP_TYPES.has(child.type)) {
      items.push(...flattenActionNodes(child.props.children));
    }
  });

  return items;
}

function isShowButton(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;

  const type = node.type;
  if (typeof type !== 'function') return false;

  const componentType = type as ButtonComponentType & {
    displayName?: string;
    name?: string;
  };
  const name = componentType.displayName ?? componentType.name ?? '';
  return name.includes('ShowButton');
}

/** Tách wrapper (Space/Flex/Tooltip) và chỉ giữ button cho footer card mobile */
export function extractCardActions(content: ReactNode): ReactNode[] {
  return flattenActionNodes(content)
    .filter(action => !isShowButton(action))
    .map((action, index) => {
      const actionKey =
        isValidElement(action) && action.key != null
          ? String(action.key)
          : `action-${index}`;

      if (!isValidElement(action)) {
        return action;
      }

      return cloneElement(action, { key: actionKey, hideText: false });
    });
}

export function getRowKeyValue<RecordType extends object>(
  record: RecordType,
  index: number,
  rowKey: TableProps<RecordType>['rowKey'],
): string {
  if (typeof rowKey === 'function') {
    return String(rowKey(record, index));
  }
  if (typeof rowKey === 'string') {
    return String((record as Record<string, unknown>)[rowKey] ?? index);
  }
  const id = (record as { id?: unknown }).id;
  return String(id ?? index);
}

export function partitionMobileColumns<RecordType extends object>(
  columns: ResponsiveColumnType<RecordType>[],
): {
  titleColumn?: ResponsiveColumnType<RecordType>;
  subtitleColumn?: ResponsiveColumnType<RecordType>;
  bodyColumns: ResponsiveColumnType<RecordType>[];
  actionsColumn?: ResponsiveColumnType<RecordType>;
} {
  const visible = columns.filter(col =>
    isColumnVisibleOnMobile(col as ColumnType<unknown>),
  );

  const byRole = (role: MobileColumnRole) =>
    visible.find(col => col.mobileRole === role);

  let titleColumn = byRole('title');
  let subtitleColumn = byRole('subtitle');
  let actionsColumn = byRole('actions');

  const claimed = new Set(
    [titleColumn, subtitleColumn, actionsColumn].filter(Boolean),
  );

  if (!actionsColumn) {
    actionsColumn = visible.find(
      col =>
        !claimed.has(col) &&
        (col.dataIndex === 'actions' ||
          col.key === 'actions' ||
          col.fixed === 'right'),
    );
    if (actionsColumn) claimed.add(actionsColumn);
  }

  if (!titleColumn) {
    titleColumn = visible.find(col => !claimed.has(col));
    if (titleColumn) claimed.add(titleColumn);
  }

  if (!subtitleColumn) {
    subtitleColumn = visible.find(col => !claimed.has(col));
    if (subtitleColumn) claimed.add(subtitleColumn);
  }

  const bodyColumns = visible.filter(
    col =>
      !claimed.has(col) &&
      col !== titleColumn &&
      col !== subtitleColumn &&
      col !== actionsColumn,
  );

  return { titleColumn, subtitleColumn, bodyColumns, actionsColumn };
}
