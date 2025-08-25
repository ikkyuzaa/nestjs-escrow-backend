import { Controller, Post, Body, Get, Param, Put, UseGuards, Request } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ShipTransactionDto } from './dto/ship-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import Guard ของคุณ
import { GetUser } from '../auth/get-user.decorator'; // Import Decorator ที่จะสร้าง
import { User } from '../user/entities/user.entity';

@Controller('transactions')
@UseGuards(JwtAuthGuard) // << ใช้ Guard ป้องกันทุก Route ใน Controller นี้ [cite: 588]
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // ผู้ขายสร้างธุรกรรม
  @Post()
  create(@Body() createDto: CreateTransactionDto, @GetUser() user: User) { // [cite: 593] ดึงข้อมูล user จาก token
    return this.transactionService.create(createDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  // ผู้ขายอัปเดตเลขพัสดุ
  @Put(':id/ship')
  ship(@Param('id') id: string, @Body() shipDto: ShipTransactionDto, @GetUser() user: User) {
    return this.transactionService.ship(id, shipDto, user.id);
  }

  // ผู้ซื้อกดยืนยันได้รับของ
  @Put(':id/complete')
  complete(@Param('id') id: string, @GetUser() user: User) {
    return this.transactionService.complete(id, user.id);
  }

  // ผู้ซื้อ/ผู้ขายแจ้งปัญหา
  @Post(':id/dispute')
  dispute(@Param('id') id: string, @GetUser() user: User) {
    return this.transactionService.dispute(id, user.id);
  }
}