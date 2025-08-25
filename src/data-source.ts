import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/entities/user.entity';
import { Transaction } from './transactions/entities/transaction.entity';
import { Payment } from './payments/entities/payment.entity';
import { Dispute } from './disputes/entities/dispute.entity'; // <<< 1. Import Dispute

config({ path: ['.env'] });

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT!, 10),
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  entities: [User, Transaction, Payment, Dispute], // <<< 2. เพิ่ม Dispute เข้าไป
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;