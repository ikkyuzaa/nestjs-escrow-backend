import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus } from './enums/transaction-status.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ShipTransactionDto } from './dto/ship-transaction.dto';
import { User } from '../user/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly paymentsService: PaymentsService,
  ) {}

  // ... (เมธอด create, ship, complete, etc. เหมือนเดิม) ...

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
  
  async dispute(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id);
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

  // vvvvvvvv ADD THIS METHOD vvvvvvvv
  /**
   * Updates a transaction's status to PAYMENT_RECEIVED.
   * This method is specifically called by the PaymentsService after a successful payment.
   * @param transactionId The ID of the transaction to update.
   * @returns The updated transaction.
   */
  async updateStatusAfterPayment(transactionId: string): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);
    if (transaction.status !== TransactionStatus.WAITING_FOR_PAYMENT) {
      console.warn(`Transaction ${transactionId} is not in WAITING_FOR_PAYMENT state. Current state: ${transaction.status}`);
      return transaction; // Or throw an error, depending on desired logic
    }
    transaction.status = TransactionStatus.PAYMENT_RECEIVED;
    // TODO: In the future, you would also add the buyer's ID to the transaction here.
    return this.transactionRepository.save(transaction);
  }
}