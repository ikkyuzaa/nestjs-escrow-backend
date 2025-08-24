import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'อีเมลต้องไม่ว่างเปล่า' })
  email: string;

  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'รหัสผ่านต้องไม่ว่างเปล่า' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  password: string;

  @IsString({ message: 'ชื่อต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'ชื่อต้องไม่ว่างเปล่า' })
  name: string;

  @IsString({ message: 'บัญชีธนาคารต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'บัญชีธนาคารต้องไม่ว่างเปล่า' })
  bank_account: string;
}
