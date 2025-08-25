import { Controller, Get, Param, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':id')
  getPaymentDetails(@Param('id') id: string) {
    return this.paymentsService.getPaymentDetails(id);
  }

  // vvvvvvvv ADD THIS METHOD vvvvvvvv
  @Post('webhook')
  @HttpCode(200) // บอกให้ส่ง 200 OK กลับไปเสมอถ้าไม่เกิด Error
  handlePaymentWebhook(@Body() webhookDto: PaymentWebhookDto) {
    // TODO: เพิ่มการตรวจสอบ Signature ของ Webhook เพื่อความปลอดภัย
    return this.paymentsService.handlePaymentWebhook(webhookDto);
  }
}