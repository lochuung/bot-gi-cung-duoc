import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from "typeorm";

export class UserTable1755416026666 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                // PK
                { name: 'id', type: 'bigint', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },

                // Platform + external id (VD: mezon + sender_id)
                { name: 'platform', type: 'varchar', length: '32', isNullable: false, default: `'mezon'` },
                { name: 'external_id', type: 'varchar', length: '128', isNullable: false }, // ChannelMessage.sender_id

                // display & profile
                { name: 'username', type: 'varchar', length: '255', isNullable: true },
                { name: 'display_name', type: 'varchar', length: '255', isNullable: true }, // ChannelMessage.display_name
                { name: 'avatar_url', type: 'varchar', length: '512', isNullable: true },  // ChannelMessage.avatar

                // Clan/Guild
                { name: 'clan_id', type: 'varchar', length: '128', isNullable: true },     // ChannelMessage.clan_id
                { name: 'clan_nick', type: 'varchar', length: '255', isNullable: true },   // ChannelMessage.clan_nick
                { name: 'clan_avatar', type: 'varchar', length: '512', isNullable: true }, // ChannelMessage.clan_avatar

                // Activity tracking
                { name: 'first_seen_at', type: 'timestamp', isNullable: true },
                { name: 'last_seen_at', type: 'timestamp', isNullable: true },
                { name: 'last_message_id', type: 'varchar', length: '128', isNullable: true },   // ChannelMessage.id/message_id
                { name: 'last_channel_id', type: 'varchar', length: '128', isNullable: true },   // ChannelMessage.channel_id
                { name: 'last_channel_label', type: 'varchar', length: '255', isNullable: true },// ChannelMessage.channel_label
                { name: 'messages_count', type: 'int', isNullable: false, default: 0 },

                // Flags & metadata
                { name: 'is_admin', type: 'boolean', isNullable: false, default: false },
                { name: 'is_active', type: 'boolean', isNullable: false, default: true },
                { name: 'meta', type: 'text', isNullable: true }, // JSON string

                // Audit
                { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                { name: 'deleted_at', type: 'timestamp', isNullable: true },
            ],
            uniques: [
                new TableUnique({
                    name: 'UQ_users_platform_external_id',
                    columnNames: ['platform', 'external_id'],
                }),
            ],
        }));

        await queryRunner.createIndex('users', new TableIndex({
            name: 'IDX_users_platform_external_id',
            columnNames: ['platform', 'external_id'],
            isUnique: false,
        }));

        await queryRunner.createIndex('users', new TableIndex({
            name: 'IDX_users_username',
            columnNames: ['username'],
        }));

        await queryRunner.createIndex('users', new TableIndex({
            name: 'IDX_users_clan_id',
            columnNames: ['clan_id'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('users', 'IDX_users_clan_id');
        await queryRunner.dropIndex('users', 'IDX_users_username');
        await queryRunner.dropIndex('users', 'IDX_users_platform_external_id');
        await queryRunner.dropUniqueConstraint('users', 'UQ_users_platform_external_id');
        await queryRunner.dropTable('users');
    }
}
