import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTourismsTable1756651460180 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tourisms',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'province',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'region',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_TOURISMS_REGION',
            columnNames: ['region'],
          },
          {
            name: 'IDX_TOURISMS_PROVINCE',
            columnNames: ['province'],
          },
          {
            name: 'IDX_TOURISMS_REGION_PROVINCE',
            columnNames: ['region', 'province'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tourisms');
  }
}
