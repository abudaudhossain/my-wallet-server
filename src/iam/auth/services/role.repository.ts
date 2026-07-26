import { Injectable } from "@nestjs/common";
import { Prisma, Role } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RoleRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByRole(key: Prisma.RoleWhereUniqueInput): Promise<Role | null> {
        return this.prisma.role.findUnique({ where: key, include: { permissions: true } });
    }
}