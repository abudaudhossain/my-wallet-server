import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      status: user.status,
      createdAt: user.createdAt,
      role: user?.role?.key,
    };
  }
}
