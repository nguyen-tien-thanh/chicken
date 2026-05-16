import type { BaseRecord } from '@refinedev/core';

import type { IPermission } from './permission';
import type { IRole } from './role';

export interface IRolesPermission extends BaseRecord {
  id: string;
  roleId: string;
  permissionId: string;
  created_at: string;
  updated_at: string;
  role?: Pick<IRole, 'id' | 'name' | 'description'>;
  permission?: Pick<IPermission, 'id' | 'path' | 'method' | 'description'>;
}
