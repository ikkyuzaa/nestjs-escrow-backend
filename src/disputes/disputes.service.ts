import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
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
}