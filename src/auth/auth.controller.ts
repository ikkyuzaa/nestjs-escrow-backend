import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { Response } from 'express'; // Import Response from express for HttpOnly cookie

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles user registration.
   * @param registerDto Data for new user registration.
   * @returns The registered user (without password).
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<Partial<User>> {
    return this.authService.register(registerDto);
  }

  /**
   * Handles user login using LocalAuthGuard (Passport-local strategy).
   * Upon successful authentication, generates a JWT and sets it as an HttpOnly cookie.
   * @param req The request object, containing the authenticated user from LocalAuthGuard.
   * @param res The response object to set the HttpOnly cookie.
   * @returns A success message or empty object.
   */
  @UseGuards(LocalAuthGuard) // Apply LocalAuthGuard for local strategy authentication
  @Post('login')
  @HttpCode(200) // Ensure a 200 OK status for successful login
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user; // User object is attached by LocalAuthGuard
    const { access_token } = await this.authService.login(user);

    // Set JWT as an HttpOnly cookie for enhanced security
    res.cookie('jwt', access_token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
      sameSite: 'lax', // Protects against CSRF attacks, set to 'None' for cross-site if needed with `secure: true`
      maxAge: 3600 * 1000, // Cookie expiration in milliseconds (1 hour, matching JWT_EXPIRES_IN)
    });

    return { message: 'เข้าสู่ระบบสำเร็จ' }; // Return a success message
  }

  /**
   * Provides access to the authenticated user's profile.
   * This route is protected by JwtAuthGuard, requiring a valid JWT.
   * @param user The authenticated user object (injected via @GetUser decorator).
   * @returns The authenticated user's profile.
   */
  @UseGuards(JwtAuthGuard) // Protect this route with JWT authentication
  @Get('profile')
  getProfile(@GetUser() user: User) {
    return user; // Returns the user object (without password) attached to the request
  }

  /**
   * Handles user logout by clearing the HttpOnly cookie.
   * @param res The response object to clear the cookie.
   * @returns A success message.
   */
  @UseGuards(JwtAuthGuard) // Require authentication to logout
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'ออกจากระบบสำเร็จ' };
  }
}
