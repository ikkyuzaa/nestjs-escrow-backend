import { Module, forwardRef } from '@nestjs/common'; // <<< 1. Import forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TransactionModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => TransactionModule), // <<< 2. แก้ไขบรรทัดนี้
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}