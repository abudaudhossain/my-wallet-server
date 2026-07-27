import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { UserServices } from "src/users/user.services";
import { ROLES } from "src/iam/seeds/role";
import { PasswordService } from "./password.service";
import { RoleRepository } from "./role.repository";
import { UserMapper } from "src/users/mappers/user.mapper";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "src/users/dto/user-response.dto";

@Injectable()
export class AuthService {
    constructor(private readonly userServices: UserServices, private readonly passwordService: PasswordService, private readonly roleRepository: RoleRepository) {}


    async register(data:RegisterDto)
    {
        
        const existingUser = await this.userServices.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const passwordHash = await this.passwordService.hashPassword(data.password);

        const role = await this.roleRepository.findByRole({ key: ROLES.USER });
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        const user = await this.userServices.create({
            email: data.email,
            name: data.name,
            password: passwordHash,
            role: {
                connect: {
                    id: role.id,
                },
            },
        });
        return plainToInstance(UserResponseDto, UserMapper.toResponse( user),{
            excludeExtraneousValues:true
        });
    }
}