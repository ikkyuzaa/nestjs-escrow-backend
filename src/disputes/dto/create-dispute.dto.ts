// src/disputes/dto/create-dispute.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10) // กำหนดให้เหตุผลต้องมีความยาวอย่างน้อย 10 ตัวอักษร
  reason: string;
}