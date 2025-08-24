import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // Injects the User repository
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user in the database.
   * @param createUserDto Data transfer object containing user details.
   * @returns The newly created user.
   * @throws ConflictException if the email already exists.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if a user with the given email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    // Create a new user instance
    const newUser = this.userRepository.create(createUserDto);
    // The password hashing is handled by the @BeforeInsert hook in the User entity
    return this.userRepository.save(newUser);
  }

  /**
   * Finds a user by their email address.
   * @param email The email of the user to find.
   * @returns The user object, or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> { // <<< แก้ไขตรงนี้: จาก 'undefined' เป็น 'null'
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Finds a user by their ID.
   * @param id The UUID of the user to find.
   * @returns The user object, or null if not found.
   * @throws NotFoundException if the user is not found.
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`ไม่พบผู้ใช้ด้วย ID: ${id}`);
    }
    return user;
  }
}
