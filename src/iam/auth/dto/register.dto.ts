import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString({ message: "Name must be a string" })
    @IsNotEmpty({ message: "Name is required" })
    name!: string;

    @IsEmail({}, { message: "Invalid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email!: string;

    @IsString({ message: "Password must be a string" })
    @IsNotEmpty({ message: "Password is required" })
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password!: string;

    
}