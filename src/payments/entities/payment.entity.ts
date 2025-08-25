import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { Transaction } from '../../transactions/entities/transaction.entity';
  
  // กำหนดสถานะที่เป็นไปได้ของการชำระเงิน
  export enum PaymentStatus {
    PENDING = 'PENDING',       // รอการชำระเงิน
    COMPLETED = 'COMPLETED',   // ชำระเงินสำเร็จ
    FAILED = 'FAILED',         // ชำระเงินล้มเหลว
    EXPIRED = 'EXPIRED',       // หมดอายุ
  }
  
  @Entity('payments')
  export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // เชื่อมโยงกับ Transaction แบบ One-to-One
    @OneToOne(() => Transaction)
    @JoinColumn()
    transaction: Transaction;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
  
    @Column({
      type: 'enum',
      enum: PaymentStatus,
      default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;
  
    // สำหรับเก็บข้อมูลอ้างอิงจาก Payment Gateway เช่น รหัส QR
    @Column({ nullable: true })
    paymentGatewayRef: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }