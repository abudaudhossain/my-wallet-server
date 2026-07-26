import { Module } from "@nestjs/common";
import { UserModule } from "src/users/user.module";
import { AuthService } from "./services/auth.service";
import { PasswordService } from "./services/password.service";
import { RoleRepository } from "./services/role.repository";
import { AuthController } from "./auth.controller";

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthService,PasswordService, RoleRepository],
    exports: [],
})
export class AuthModule {}