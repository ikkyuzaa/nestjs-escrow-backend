import { Controller, Get, UseGuards, Post, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';
import { DisputesService } from '../../disputes/disputes.service';
// แก้ไข Path ของ ResolveDisputeDto
import { ResolveDisputeDto } from '../../disputes/dto/resolve-dispute.dto';

@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminDisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  findAllOpenDisputes() {
    return this.disputesService.findAllOpen();
  }

  @Post(':id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @Body() resolveDto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(id, resolveDto);
  }
}