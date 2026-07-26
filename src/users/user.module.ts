import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserRepository } from "./user.repository";
import { UserServices } from "./user.services";

@Module({
    imports: [PrismaModule],
    providers: [ UserServices,UserRepository],
    exports: [ UserServices],
})

export class UserModule {}