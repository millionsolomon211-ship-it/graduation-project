export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  enabled?: boolean;
  emailVerified: boolean;
  createdAt?: Date;
}

export interface CreateUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
