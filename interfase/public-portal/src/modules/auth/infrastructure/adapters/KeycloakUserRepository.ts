import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateUserCommand } from '../../domain/entities/User';
import { getAdminToken, findUserByEmail, clearKeycloakEmailBlock, getUserById, markEmailVerified, getClientIp } from '@/lib/keycloak-admin';

export class KeycloakUserRepository implements IUserRepository {
  private kcUrl: string;
  private kcRealm: string;

  constructor() {
    this.kcUrl = process.env.KEYCLOAK_SERVER_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth';
    this.kcRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal';
  }

  async create(command: CreateUserCommand): Promise<User> {
    const clientIp = this.getClientIpFromContext();
    const adminToken = await getAdminToken(clientIp);

    const response = await fetch(
      `${this.kcUrl}/admin/realms/${this.kcRealm}/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify({
          firstName: command.firstName,
          lastName: command.lastName,
          email: command.email,
          username: command.email,
          enabled: true,
          emailVerified: false,
          requiredActions: [],
          credentials: [{ type: 'password', value: command.password, temporary: false }],
        }),
      }
    );

    if (response.status === 409) {
      throw new Error('An account with this email already exists.');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed.');
    }

    // Fetch the created user
    const user = await this.findByEmail(command.email);
    if (!user) {
      throw new Error('Failed to retrieve created user.');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const clientIp = this.getClientIpFromContext();
    const adminToken = await getAdminToken(clientIp);
    const user = await findUserByEmail(adminToken, email, clientIp);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: (user as any).username,
      enabled: (user as any).enabled,
      emailVerified: user.emailVerified || false,
      createdAt: (user as any).createdTimestamp ? new Date((user as any).createdTimestamp) : undefined,
    };
  }

  async findById(id: string): Promise<User | null> {
    const clientIp = this.getClientIpFromContext();
    const adminToken = await getAdminToken(clientIp);
    const user = await getUserById(adminToken, id, clientIp);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: (user as any).username,
      enabled: (user as any).enabled,
      emailVerified: user.emailVerified || false,
      createdAt: (user as any).createdTimestamp ? new Date((user as any).createdTimestamp) : undefined,
    };
  }



  async markEmailVerified(userId: string): Promise<boolean> {
    const clientIp = this.getClientIpFromContext();
    const adminToken = await getAdminToken(clientIp);
    return await markEmailVerified(adminToken, userId, clientIp);
  }

  async clearEmailBlock(userId: string): Promise<void> {
    const clientIp = this.getClientIpFromContext();
    const adminToken = await getAdminToken(clientIp);
    await clearKeycloakEmailBlock(adminToken, userId, clientIp);
  }

  private getClientIpFromContext(): string {
    // In a real implementation, this would come from request context
    // For now, return a default value
    return '127.0.0.1';
  }
}
