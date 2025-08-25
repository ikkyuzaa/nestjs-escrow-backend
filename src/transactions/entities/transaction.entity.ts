import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Entity('transactions') // [cite: 261]
export class Transaction {
  @PrimaryGeneratedColumn('uuid') // [cite: 263]
  id: string; // [cite: 264]

  // --- ข้อมูลจากผู้ขายตอนสร้างรายการ ---
  @Column()
  productName: string; // [cite: 266]

  @Column('text', { nullable: true })
  productDescription: string; // [cite: 268]

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // [cite: 270]

  // --- ข้อมูลผู้ซื้อและผู้ขาย (ควรเป็น Foreign Key ไปยังตาราง User) ---
  @Column()
  sellerId: string; // [cite: 272]

  @Column({ nullable: true })
  buyerId: string; // [cite: 274]

  // --- สถานะของ Escrow ---
  @Column({
    type: 'enum', // [cite: 277]
    enum: TransactionStatus, // [cite: 278]
    default: TransactionStatus.WAITING_FOR_PAYMENT, // [cite: 279]
  })
  status: TransactionStatus; // [cite: 280]

  // --- ข้อมูลการจัดส่งจากผู้ขาย ---
  @Column({ nullable: true })
  trackingNumber: string; // [cite: 285]

  @Column({ nullable: true })
  shippingProvider: string; // [cite: 287]

  // --- Timestamps ---
  @CreateDateColumn()
  createdAt: Date; // [cite: 289]

  @UpdateDateColumn()
  updatedAt: Date; // [cite: 291]
}