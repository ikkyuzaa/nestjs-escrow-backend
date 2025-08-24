import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use 'email' as the username field
    });
  }

  /**
   * Validates the user credentials provided during login.
   * @param email The email submitted by the user.
   * @param password The plain text password submitted by the user.
   * @returns The user object if authentication is successful.
   * @throws UnauthorizedException if authentication fails.
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    return user; // Passport will attach this user object to req.user
  }
}
