// src/admin/disputes/dto/resolve-dispute.dto.ts
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { DisputeResolution } from '../entities/dispute.entity';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolution)
  @IsNotEmpty()
  decision: DisputeResolution;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  notes: string; // บันทึกของแอดมินประกอบคำตัดสิน
}