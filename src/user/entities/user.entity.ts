import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as argon2 from 'argon2'; // Import argon2

@Entity('users') // Defines the table name as 'users'
export class User {
  @PrimaryGeneratedColumn('uuid') // Generates a UUID for the primary key
  id: string;

  @Column({ unique: true }) // Email must be unique
  email: string;

  @Column() // Store the Argon2 hashed password
  password: string;

  @Column({ nullable: true }) // Optional: User's name as per business model
  name: string;

  @Column({ nullable: true }) // Optional: User's bank account for payout system
  bank_account: string;

  @CreateDateColumn() // Automatically sets the creation timestamp
  createdAt: Date;

  @UpdateDateColumn() // Automatically updates the timestamp on each update
  updatedAt: Date;

  /**
   * @BeforeInsert hook to hash the password before saving a new user.
   * This ensures the password is always hashed before it hits the database.
   */
  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) { // Only hash if a password is provided
      this.password = await argon2.hash(this.password);
    }
  }

  /**
   * @BeforeUpdate hook to hash the password if it's being updated.
   * This is crucial if users can change their password.
   *
   * NOTE: For a robust @BeforeUpdate, you should ideally compare the *incoming*
   * password with the *current hashed password in the database* before re-hashing.
   * A simpler, yet effective, approach for `BeforeUpdate` is to always re-hash
   * if `this.password` is explicitly set on the entity being updated.
   * This implementation assumes `this.password` will only be set if it's a new
   * plain-text password to be hashed.
   */
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Check if the password property is explicitly set and has potentially changed (is not already hashed)
    // A more advanced check might load the original entity to compare, but for many ORM operations,
    // if `this.password` is explicitly assigned, it's often a new value.
    if (this.password && !this.password.startsWith('$argon2id$')) { // Simple check if it's likely not hashed yet
      this.password = await argon2.hash(this.password);
    }
  }
}
