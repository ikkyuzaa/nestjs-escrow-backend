import { Injectable, Inject, forwardRef, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus, DisputeResolution } from './entities/dispute.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../user/entities/user.entity';
import { TransactionService } from '../transactions/transactions.service';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    // Inject TransactionService to update transaction status upon resolution
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) {}

  async create(
    transaction: Transaction,
    user: User,
    createDisputeDto: CreateDisputeDto,
  ): Promise<Dispute> {
    const dispute = this.disputeRepository.create({
      transaction: transaction,
      openedBy: user,
      reason: createDisputeDto.reason,
    });
    return this.disputeRepository.save(dispute);
  }

  async findAllOpen(): Promise<Dispute[]> {
    return this.disputeRepository.find({
      where: { status: DisputeStatus.OPEN },
      relations: ['transaction', 'openedBy'],
    });
  }

  // vvvvvvvv ADD THIS METHOD vvvvvvvv
  /**
   * Resolves a dispute based on an admin's decision.
   * @param disputeId The ID of the dispute to resolve.
   * @param resolveDto The admin's decision and notes.
   * @returns The updated dispute record.
   */
  async resolve(disputeId: string, resolveDto: ResolveDisputeDto): Promise<Dispute> {
    // 1. Find the dispute, ensuring its related transaction is loaded
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['transaction'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found.');
    }
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new ForbiddenException('This dispute has already been resolved.');
    }

    // 2. Update the dispute record with the admin's notes
    dispute.resolution = resolveDto.notes;

    // 3. Update status and trigger corresponding transaction action
    if (resolveDto.decision === DisputeResolution.REFUND_TO_BUYER) {
      dispute.status = DisputeStatus.RESOLVED_REFUND;
      await this.transactionService.resolveAsRefund(dispute.transaction.id);
    } else if (resolveDto.decision === DisputeResolution.PAYOUT_TO_SELLER) {
      dispute.status = DisputeStatus.RESOLVED_PAYOUT;
      await this.transactionService.resolveAsPayout(dispute.transaction.id);
    }

    // 4. Save the updated dispute and return it
    return this.disputeRepository.save(dispute);
  }
}