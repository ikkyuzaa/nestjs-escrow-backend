import { Module } from '@nestjs/common';
import { AdminDisputesController } from './disputes/disputes.controller';
import { DisputesModule } from '../disputes/disputes.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule เพื่อให้รู้จัก Guard

@Module({
  imports: [
    DisputesModule,
    AuthModule, // Import AuthModule เข้ามาเพื่อให้รู้จัก JwtAuthGuard และ AdminGuard
  ],

  controllers: [AdminDisputesController],
})
export class AdminModule {}