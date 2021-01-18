import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateMatchesAndPieces1610952559806 implements MigrationInterface {
    name = 'CreateMatchesAndPieces1610952559806'

    public async up(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query('CREATE TABLE "piece" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "color" character varying NOT NULL, "row" integer NOT NULL, "col" integer NOT NULL, "match_id" uuid, CONSTRAINT "PK_c14fb7d64989cd50598e9ac9480" PRIMARY KEY ("id"))');
    	await queryRunner.query('CREATE TABLE "match" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "secret_key" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT \'whitePlay\', CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))');
    	await queryRunner.query('ALTER TABLE "piece" ADD CONSTRAINT "FK_db9a320d48cb6196a3acc8b451d" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    	await queryRunner.query('ALTER TABLE "piece" DROP CONSTRAINT "FK_db9a320d48cb6196a3acc8b451d"');
    	await queryRunner.query('DROP TABLE "match"');
    	await queryRunner.query('DROP TABLE "piece"');
    }

}
