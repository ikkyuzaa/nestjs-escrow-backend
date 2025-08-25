import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ShipTransactionDto } from './dto/ship-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { CreateDisputeDto } from '../disputes/dto/create-dispute.dto'; // <<< Import DTO

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // ... (เมธอด create, findOne, ship, complete เหมือนเดิม) ...
  @Post()
  create(@Body() createDto: CreateTransactionDto, @GetUser() user: User) {
    return this.transactionService.create(createDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Put(':id/ship')
  ship(@Param('id') id: string, @Body() shipDto: ShipTransactionDto, @GetUser() user: User) {
    return this.transactionService.ship(id, shipDto, user.id);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string, @GetUser() user: User) {
    return this.transactionService.complete(id, user.id);
  }

  // vvvvvvvv UPDATE THIS METHOD vvvvvvvv
  @Post(':id/dispute')
  dispute(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() createDisputeDto: CreateDisputeDto, // <<< รับ Body เข้ามา
  ) {
    return this.transactionService.dispute(id, user, createDisputeDto);
  }
}