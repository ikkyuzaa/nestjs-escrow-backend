// src/payments/dto/payment-webhook.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string; // ID ของ Payment ในระบบเรา ที่เราส่งไปตอนสร้าง QR

  @IsNumber()
  @IsPositive()
  amount: number; // จำนวนเงินที่จ่ายสำเร็จ

  @IsString()
  @IsNotEmpty()
  gatewayTransactionId: string; // ID ธุรกรรมของฝั่งธนาคาร
}