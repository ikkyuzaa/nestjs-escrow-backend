import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService, // Inject ConfigService
  ) {}

  /**
   * Validates a user's credentials for login.
   * @param email The user's email.
   * @param pass The user's plain text password.
   * @returns The user object if valid, otherwise null.
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await argon2.verify(user.password, pass))) {
      // Remove password before returning the user object for security
      const { password, ...result } = user;
      return result as User; // Return user without password
    }
    return null;
  }

  /**
   * Registers a new user.
   * @param registerDto Data transfer object for user registration.
   * @returns The registered user.
   * @throws BadRequestException if registration fails (e.g., email already exists).
   */
  async register(registerDto: RegisterDto): Promise<User> {
    try {
      // UserService.create will handle checking for existing email and hashing the password
      const user = await this.userService.create(registerDto);
      // Remove password before returning
      const { password, ...result } = user;
      return result as User;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Generates JWT access token for a user upon successful login.
   * @param user The validated user object.
   * @returns An object containing the access token.
   */
  async login(user: User) {
    // Payload for JWT token (contains user data that is safe to expose)
    const payload = { email: user.email, sub: user.id };
    // Generate access token with configurable expiration
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    // In a production-grade system, you would also generate a refresh token here:
    // const refreshToken = this.jwtService.sign(payload, {
    //   secret: this.configService.get<string>('JWT_SECRET'),
    //   expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    // });
    // And then store the refresh token (hashed or encrypted) in the database with a link to the user.
    // return {
    //   access_token: accessToken,
    //   refresh_token: refreshToken,
    // };

    return {
      access_token: accessToken,
    };
  }

  /**
   * For production-grade, a refresh token endpoint would be needed:
   * async refreshTokens(userId: string, refreshToken: string) {
   * // 1. Validate refresh token
   * // 2. Check if refresh token exists in DB and belongs to user
   * // 3. Invalidate old refresh token
   * // 4. Generate new access and refresh tokens
   * // 5. Store new refresh token in DB
   * // 6. Return new tokens
   * }
   */
}
