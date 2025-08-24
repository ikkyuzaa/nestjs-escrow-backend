// For simplicity, we can reuse CreateUserDto for registration
// If registration requires different fields or validations, create a separate RegisterDto
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {}
