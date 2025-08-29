import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDisputeTable1756110614730 implements MigrationInterface {
    name = 'CreateDisputeTable1756110614730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."disputes_status_enum" AS ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED_REFUND', 'RESOLVED_PAYOUT')`);
        await queryRunner.query(`CREATE TABLE "disputes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" text NOT NULL, "status" "public"."disputes_status_enum" NOT NULL DEFAULT 'OPEN', "resolution" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "transactionId" uuid, "openedById" uuid, CONSTRAINT "PK_3c97580d01c1a4b0b345c42a107" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD CONSTRAINT "FK_9661150a3f25a5c44c891af56fe" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD CONSTRAINT "FK_cf9289f2af9e6714ded345d5138" FOREIGN KEY ("openedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disputes" DROP CONSTRAINT "FK_cf9289f2af9e6714ded345d5138"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP CONSTRAINT "FK_9661150a3f25a5c44c891af56fe"`);
        await queryRunner.query(`DROP TABLE "disputes"`);
        await queryRunner.query(`DROP TYPE "public"."disputes_status_enum"`);
    }

}
