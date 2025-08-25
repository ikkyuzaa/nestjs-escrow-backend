import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common'; // <<< 1. Import Inject, forwardRef
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { PaymentDetailsDto } from './dto/payment-details.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { TransactionService } from '../transactions/transactions.service';
import { TransactionStatus } from '../transactions/enums/transaction-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    // vvvvvvvv 2. ADD THIS DECORATOR vvvvvvvv
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) {}

  // ... (เมธอดอื่นๆ เหมือนเดิม) ...
  async createForTransaction(transaction: Transaction): Promise<Payment> {
    const newPayment = this.paymentRepository.create({
      transaction: transaction,
      amount: transaction.price,
    });
    return this.paymentRepository.save(newPayment);
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetailsDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['transaction'],
    });

    if (!payment || !payment.transaction) {
      throw new NotFoundException('Payment details not found.');
    }

    const paymentDetails: PaymentDetailsDto = {
      paymentId: payment.id,
      productName: payment.transaction.productName,
      productDescription: payment.transaction.productDescription,
      price: payment.transaction.price,
      sellerName: 'Seller Name Placeholder',
      paymentStatus: payment.status,
    };

    return paymentDetails;
  }

  async handlePaymentWebhook(webhookDto: PaymentWebhookDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id: webhookDto.paymentId },
      relations: ['transaction'],
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found for webhook.');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      console.log('Webhook received for a non-pending payment.');
      return { message: 'Payment already processed.' };
    }

    if (payment.amount != webhookDto.amount) {
      throw new BadRequestException('Webhook amount mismatch.');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paymentGatewayRef = webhookDto.gatewayTransactionId;
    await this.paymentRepository.save(payment);

    await this.transactionService.updateStatusAfterPayment(payment.transaction.id);

    console.log(`Transaction ${payment.transaction.id} status updated to PAYMENT_RECEIVED.`);
    return { message: 'Webhook processed successfully.' };
  }
}