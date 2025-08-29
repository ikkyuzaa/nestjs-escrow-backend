import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { Dispute } from './entities/dispute.entity';
import { TransactionModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute]),
    forwardRef(() => TransactionModule), // เตรียมพร้อมสำหรับอนาคต
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService], // <<< Export Service
})
export class DisputesModule {}