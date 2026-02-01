
export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  data: AuthUser;
  token: string;
}
