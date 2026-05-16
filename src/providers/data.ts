import type { CrudFilter, DataProvider } from '@refinedev/core';
import {
  handleError,
  dataProvider as supabaseDataProvider,
} from '@refinedev/supabase';

import { supabaseClient } from './supabase-client';

/** Tables with `deleted_at` — delete becomes update, reads exclude non-null `deleted_at`. */
const SOFT_DELETE_FROM = new Set([
  'customers',
  'suppliers',
  'products',
  'product_categories',
  'sales',
  'sale_items',
  'purchases',
  'purchase_items',
]);

const notDeletedFilter: CrudFilter = {
  field: 'deleted_at',
  operator: 'null',
  value: true,
};

const base = supabaseDataProvider(supabaseClient);

function deletedAtNow(): string {
  return new Date().toISOString();
}

export const dataProvider = {
  ...base,
  getList: params => {
    if (SOFT_DELETE_FROM.has(params.resource)) {
      return base.getList({
        ...params,
        filters: [...(params.filters ?? []), notDeletedFilter],
      });
    }
    return base.getList(params);
  },
  getMany: async params => {
    if (!SOFT_DELETE_FROM.has(params.resource)) {
      return base.getMany(params);
    }
    const { resource, ids, meta } = params;
    const client = meta?.schema
      ? supabaseClient.schema(meta.schema)
      : supabaseClient;

    const qb = client.from(resource) as any;
    const chain = qb
      .select(meta?.select ?? '*')
      .is('deleted_at', null)
      .in(meta?.idColumnName ?? 'id', ids);

    const { data, error } = await chain;
    if (error) {
      return handleError(error);
    }
    return {
      data: data || [],
    } as any;
  },
  getOne: async params => {
    if (!SOFT_DELETE_FROM.has(params.resource)) {
      return base.getOne(params);
    }
    const { resource, id, meta } = params;
    const client = meta?.schema
      ? supabaseClient.schema(meta.schema)
      : supabaseClient;

    const qb = client.from(resource) as any;
    const chain = qb.select(meta?.select ?? '*').is('deleted_at', null);

    if (meta?.idColumnName) {
      chain.eq(meta.idColumnName, id);
    } else {
      chain.match({ id });
    }

    const { data, error } = await chain;
    if (error) {
      return handleError(error);
    }
    return {
      data: (data || [])[0],
    } as any;
  },
  deleteOne: async params => {
    if (!SOFT_DELETE_FROM.has(params.resource)) {
      return base.deleteOne(params);
    }
    const { resource, id, meta } = params;
    const client = meta?.schema
      ? supabaseClient.schema(meta.schema)
      : supabaseClient;

    const qb = client.from(resource) as any;
    let chain = qb
      .update({ deleted_at: deletedAtNow() })
      .select(meta?.select ?? '*');

    if (meta?.idColumnName) {
      chain = chain.eq(meta.idColumnName, id);
    } else {
      chain = chain.match({ id });
    }

    const { data, error } = await chain;
    if (error) {
      return handleError(error);
    }
    return {
      data: (data || [])[0],
    } as any;
  },
  deleteMany: async params => {
    if (!SOFT_DELETE_FROM.has(params.resource)) {
      return base.deleteMany(params);
    }
    const { resource, ids, meta } = params;
    if (ids.length === 0) {
      return { data: [] } as any;
    }
    const client = meta?.schema
      ? supabaseClient.schema(meta.schema)
      : supabaseClient;

    const qb = client.from(resource) as any;
    let chain = qb
      .update({ deleted_at: deletedAtNow() })
      .select(meta?.select ?? '*');

    if (meta?.idColumnName) {
      chain = chain.in(meta.idColumnName, ids);
    } else {
      chain = chain.in('id', ids);
    }

    const { data, error } = await chain;
    if (error) {
      return handleError(error);
    }
    return {
      data: data || [],
    } as any;
  },
} as DataProvider;
