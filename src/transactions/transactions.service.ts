import { Injectable, NotFoundException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus } from './enums/transaction-status.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ShipTransactionDto } from './dto/ship-transaction.dto';
import { User } from '../user/entities/user.entity';
import { PaymentsService } from '../payments/payments.service';
import { DisputesService } from '../disputes/disputes.service'; // <<< 1. Import DisputesService
import { CreateDisputeDto } from '../disputes/dto/create-dispute.dto'; // <<< Import DTO

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    // Use forwardRef for circular dependency with PaymentsService
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    // Use forwardRef for circular dependency with DisputesService
    @Inject(forwardRef(() => DisputesService)) // <<< 2. Inject DisputesService
    private readonly disputesService: DisputesService,
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

  // vvvvvvvv UPDATE THIS METHOD vvvvvvvv
  async dispute(transactionId: string, user: User, createDisputeDto: CreateDisputeDto): Promise<Transaction> {
    const transaction = await this.findOne(transactionId);

    // 1. Authorization Check: ตรวจสอบว่าผู้แจ้งเป็นผู้ซื้อหรือผู้ขาย
    // (ตอนนี้ buyerId ยังเป็น null เราจะเช็กแค่ sellerId ไปก่อน)
    if (transaction.sellerId !== user.id /* && transaction.buyerId !== user.id */) {
      throw new ForbiddenException('You are not part of this transaction.');
    }

    // 2. State Machine Check: ตรวจสอบสถานะที่สามารถเปิดข้อพิพาทได้
    const allowedStatuses = [TransactionStatus.PAYMENT_RECEIVED, TransactionStatus.SHIPPING];
    if (!allowedStatuses.includes(transaction.status)) {
      throw new ForbiddenException(`Cannot open a dispute for a transaction with status '${transaction.status}'`);
    }

    // 3. เรียก DisputesService เพื่อสร้าง Dispute record
    await this.disputesService.create(transaction, user, createDisputeDto);
    
    // 4. อัปเดตสถานะ Transaction เป็น DISPUTED
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
}