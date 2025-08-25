import { IsString, IsNotEmpty } from 'class-validator';

export class ShipTransactionDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber: string; // [cite: 311]

  @IsString()
  @IsNotEmpty()
  shippingProvider: string; // [cite: 314]
}