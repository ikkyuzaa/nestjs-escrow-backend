import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as argon2 from 'argon2';
import { UserRole } from '../enums/user-role.enum'; // <<< 1. Import UserRole Enum

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  bank_account: string;

  // vvvvvvvv 2. ADD THIS COLUMN vvvvvvvv
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // กำหนดให้ผู้ใช้ใหม่เป็น 'user' โดยอัตโนมัติ
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) {
      this.password = await argon2.hash(this.password);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password && !this.password.startsWith('$argon2id$')) {
      this.password = await argon2.hash(this.password);
    }
  }
}