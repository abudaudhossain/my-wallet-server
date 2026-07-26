import { Prisma, User } from "src/generated/prisma/client";
import { UserRepository } from "./user.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserServices {
    constructor(private readonly userRepository: UserRepository) { }

    async findAll(options: {
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
        skip?: number;
        take?: number;
    }): Promise<User[]> {
        return this.userRepository.findMany(options);
    }

    async findByEmail(email: string): Promise<User | null> {

       
        return this.userRepository.findUnique({ email });
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findUnique({ id });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.userRepository.create(data);
    }

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return this.userRepository.update({ id }, data);
    }

    async delete(id: number): Promise<User> {
        return this.userRepository.delete({ id });
    }

}