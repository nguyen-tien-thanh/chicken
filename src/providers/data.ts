import { dataProvider as supabaseDataProvider } from '@refinedev/supabase';
import type { DataProvider } from '@refinedev/core';

import { translateSaveError } from '@/utils/translateSaveError';

import { supabaseClient } from './supabase-client';

const baseDataProvider = supabaseDataProvider(supabaseClient);

async function withTranslatedError<T>(
  resource: string,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw translateSaveError(error, resource);
  }
}

export const dataProvider: DataProvider = {
  ...baseDataProvider,
  create: params =>
    withTranslatedError(params.resource, () => baseDataProvider.create(params)),
  update: params =>
    withTranslatedError(params.resource, () => baseDataProvider.update(params)),
};
