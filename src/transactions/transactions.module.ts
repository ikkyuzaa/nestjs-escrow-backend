import { Module, forwardRef } from '@nestjs/common'; // <<< 1. Import forwardRef
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { DisputesModule } from '../disputes/disputes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AuthModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => DisputesModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}