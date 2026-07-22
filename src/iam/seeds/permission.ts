export const PERMISSIONS = {
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_VIEW: 'user.view',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST: Array<{
  key: PermissionKey;
  label: string;
  groupLabel: string;
  isSuperAdminOnly: boolean;
}> = [
  {
    key: PERMISSIONS.USER_CREATE,
    label: 'Create User',
    groupLabel: 'User',
    isSuperAdminOnly: false,
  },
  {
    key: PERMISSIONS.USER_UPDATE,
    label: 'Update User',
    groupLabel: 'User',
    isSuperAdminOnly: false,
  },
  {
    key: PERMISSIONS.USER_DELETE,
    label: 'Delete User',
    groupLabel: 'User',
    isSuperAdminOnly: false,
  },
  {
    key: PERMISSIONS.USER_VIEW,
    label: 'View User',
    groupLabel: 'User',
    isSuperAdminOnly: false,
  },
  {
    key: PERMISSIONS.ROLE_CREATE,
    label: 'Create Role',
    groupLabel: 'Role',
    isSuperAdminOnly: true,
  },
  {
    key: PERMISSIONS.ROLE_UPDATE,
    label: 'Update Role',
    groupLabel: 'Role',
    isSuperAdminOnly: true,
  },
  {
    key: PERMISSIONS.ROLE_DELETE,
    label: 'Delete Role',
    groupLabel: 'Role',
    isSuperAdminOnly: true,
  },
] as const;
