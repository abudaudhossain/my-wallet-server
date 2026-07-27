export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
}
