import { Injectable, NotFoundException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus } from './enums/transaction-status.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ShipTransactionDto } from './dto/ship-transaction.dto';
import { User } from '../user/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { DisputesService } from '../disputes/disputes.service';
import { CreateDisputeDto } from '../disputes/dto/create-dispute.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => DisputesService))
    private readonly disputesService: DisputesService,
  ) {}

  async create(createDto: CreateTransactionDto, seller: User): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...createDto,
      sellerId: seller.id,
      status: TransactionStatus.WAITING_FOR_PAYMENT,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
    await this.paymentsService.createForTransaction(savedTransaction);
    return savedTransaction;
  }

  async ship(id: string, shipDto: ShipTransactionDto, sellerId: string): Promise<Transaction> {
    const transaction = await this.findOne(id);
    if (transaction.sellerId !== sellerId) {
      throw new ForbiddenException('You are not the seller of this transaction.');
    }
    if (transaction.status !== TransactionStatus.PAYMENT_RECEIVED) {
      throw new ForbiddenException(`Cannot ship a transaction with status '${transaction.status}'`);
    }
    transaction.trackingNumber = shipDto.trackingNumber;
    transaction.shippingProvider = shipDto.shippingProvider;
    transaction.status = TransactionStatus.SHIPPING;
    return this.transactionRepository.save(transaction);
  }

  async complete(id: string, buyerId: string): Promise<Transaction> {
    const transaction = await this.findOne(id);
    if (transaction.status !== TransactionStatus.SHIPPING) {
      throw new ForbiddenException(`Cannot complete a transaction with status '${transaction.status}'`);
    }
    transaction.status = TransactionStatus.COMPLETED;
    return this.transactionRepository.save(transaction);
  }

  async dispute(transactionId: string, user: User, createDisputeDto: CreateDisputeDto): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);
    if (transaction.sellerId !== user.id /* && transaction.buyerId !== user.id */) {
      throw new ForbiddenException('You are not part of this transaction.');
    }
    const allowedStatuses = [TransactionStatus.PAYMENT_RECEIVED, TransactionStatus.SHIPPING];
    if (!allowedStatuses.includes(transaction.status)) {
      throw new ForbiddenException(`Cannot open a dispute for a transaction with status '${transaction.status}'`);
    }
    await this.disputesService.create(transaction, user, createDisputeDto);
    transaction.status = TransactionStatus.DISPUTED;
    return this.transactionRepository.save(transaction);
  }
  
  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOneBy({ id });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID '${id}' not found.`);
    }
    return transaction;
  }

  async updateStatusAfterPayment(transactionId: string): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);
    if (transaction.status !== TransactionStatus.WAITING_FOR_PAYMENT) {
      console.warn(`Transaction ${transactionId} is not in WAITING_FOR_PAYMENT state. Current state: ${transaction.status}`);
      return transaction;
    }
    transaction.status = TransactionStatus.PAYMENT_RECEIVED;
    return this.transactionRepository.save(transaction);
  }

  async resolveAsRefund(transactionId: string): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);
    // You must add 'REFUNDED' to your TransactionStatus enum
    transaction.status = TransactionStatus.REFUNDED;
    // TODO: Implement actual refund logic via PaymentService in the future
    console.log(`Transaction ${transactionId} has been resolved and will be REFUNDED.`);
    return this.transactionRepository.save(transaction);
  }

  async resolveAsPayout(transactionId: string): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);
    transaction.status = TransactionStatus.COMPLETED; // Mark as completed by admin
    // TODO: Implement actual payout logic via PaymentService in the future
    console.log(`Transaction ${transactionId} has been resolved and payment will be RELEASED.`);
    return this.transactionRepository.save(transaction);
  }
}