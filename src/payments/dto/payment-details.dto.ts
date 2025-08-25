// src/payments/dto/payment-details.dto.ts
import { PaymentStatus } from '../entities/payment.entity';

export class PaymentDetailsDto {
  paymentId: string;
  productName: string;
  productDescription: string;
  price: number;
  sellerName: string; // ในอนาคตเราจะดึงชื่อผู้ขายมาแสดง
  paymentStatus: PaymentStatus;
}