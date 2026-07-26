import { Injectable } from "@nestjs/common";
import { Prisma, User } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserRepository {
    constructor(private readonly prisma:PrismaService){}

    async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        console.log(where)
        return this.prisma.user.findUnique({ where, include: { role: true } });
    }

    async findMany(options:{
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
        skip?: number;
        take?: number;
    }): Promise<User[]> {
        return this.prisma.user.findMany(
            {
                where: options.where,
                orderBy: options.orderBy,
                skip: options.skip,
                take: options.take,
                include: { role: true },
            }
        );
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data, include: { role: true } });
    }

    async update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({ where, data, include: { role: true } });
    }

    async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
        return this.prisma.user.delete({ where, include: { role: true } });
    }
}