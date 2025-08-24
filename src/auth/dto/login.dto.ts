import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'อีเมลต้องไม่ว่างเปล่า' })
  email: string;

  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'รหัสผ่านต้องไม่ว่างเปล่า' })
  password: string;
}
