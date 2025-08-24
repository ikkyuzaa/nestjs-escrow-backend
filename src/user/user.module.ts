import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Registers the User entity with TypeORM
  ],
  providers: [UserService], // Makes UserService available within this module
  exports: [UserService, TypeOrmModule], // Exports UserService for use in other modules (e.g., AuthModule)
})
export class UserModule {}