import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productName: string; // [cite: 297]

  @IsString()
  @IsOptional()
  productDescription: string; // [cite: 299]

  @IsNumber()
  @Min(1)
  price: number; // [cite: 302]

  // หมายเหตุ: เราจะไม่รับ sellerId จาก client โดยตรง [cite: 303]
  // แต่จะดึงมาจาก JWT token ของผู้ใช้ที่ล็อกอินอยู่ เพื่อความปลอดภัย
}