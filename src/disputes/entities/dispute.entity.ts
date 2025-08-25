import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { Transaction } from '../../transactions/entities/transaction.entity';
  import { User } from '../../user/entities/user.entity';
  
  // กำหนดสถานะของข้อพิพาท
  export enum DisputeStatus {
    OPEN = 'OPEN',                       // เปิดข้อพิพาท
    UNDER_REVIEW = 'UNDER_REVIEW',       // กำลังตรวจสอบโดยแอดมิน
    RESOLVED_REFUND = 'RESOLVED_REFUND', // ตัดสินให้คืนเงินผู้ซื้อ
    RESOLVED_PAYOUT = 'RESOLVED_PAYOUT', // ตัดสินให้จ่ายเงินผู้ขาย
  }
  
  @Entity('disputes')
  export class Dispute {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // ความสัมพันธ์: 1 Transaction สามารถมีได้หลาย Dispute (เผื่ออนาคต)
    @ManyToOne(() => Transaction, (transaction) => transaction.id)
    transaction: Transaction;
  
    // ใครเป็นคนเปิดข้อพิพาท
    @ManyToOne(() => User, (user) => user.id)
    openedBy: User;
  
    @Column({ type: 'text' })
    reason: string; // เหตุผลที่เปิดข้อพิพาท
  
    @Column({
      type: 'enum',
      enum: DisputeStatus,
      default: DisputeStatus.OPEN,
    })
    status: DisputeStatus;
  
    // สำหรับให้แอดมินบันทึกคำตัดสิน
    @Column({ type: 'text', nullable: true })
    resolution: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }