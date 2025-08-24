import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UserModule, // Import UserModule to use UserService
    PassportModule, // Initialize Passport
    // Configure JwtModule asynchronously to use ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get JWT secret from .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') }, // Get JWT expiration from .env
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Import ConfigModule here as well for direct injection in providers/services
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule, LocalAuthGuard, JwtAuthGuard], // Export for use in other modules
})
export class AuthModule {}
