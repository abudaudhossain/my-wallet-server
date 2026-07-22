import type { PrismaClient } from '../../generated/prisma/client';
import { PERMISSION_LIST } from './permission';
import { ROLE_LIST } from './role';

export async function seedPermissionsAndRoles(prisma: PrismaClient) {
  for (const permission of PERMISSION_LIST) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        label: permission.label,
        groupLabel: permission.groupLabel,
        isSuperAdminOnly: permission.isSuperAdminOnly,
      },
      create: {
        key: permission.key,
        label: permission.label,
        groupLabel: permission.groupLabel,
        isSuperAdminOnly: permission.isSuperAdminOnly,
      },
    });
  }

  for (const roleDef of ROLE_LIST) {
    const role = await prisma.role.upsert({
      where: { key: roleDef.key },
      update: {
        label: roleDef.label,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
      create: {
        key: roleDef.key,
        label: roleDef.label,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });

    const permissions = await prisma.permission.findMany({
      where: { key: { in: roleDef.permissions } },
      select: { id: true },
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      });
    }
  }
}
