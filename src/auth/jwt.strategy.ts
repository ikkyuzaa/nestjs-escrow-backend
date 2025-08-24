import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'; // Import InternalServerErrorException
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    // --- แก้ไขตรงนี้ ---
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      // Throw an error if JWT_SECRET is not configured. This is a critical error.
      throw new InternalServerErrorException('JWT_SECRET is not configured in environment variables.');
    }
    // --- สิ้นสุดการแก้ไข ---

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        const data = request?.cookies['jwt'];
        if (data) {
          return data;
        }
        return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      }]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // ใช้ตัวแปร jwtSecret ที่รับประกันว่าเป็น string แล้ว
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('ไม่พบผู้ใช้หรือโทเค็นไม่ถูกต้อง');
    }
    const { password, ...result } = user;
    return result as User;
  }
}
