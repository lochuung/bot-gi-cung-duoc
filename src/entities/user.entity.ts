import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("users")
@Index('IDX_users_platform_external_id', ['platform', 'externalId'])
@Index('IDX_users_username', ['username'])
@Index('IDX_users_clan_id', ['clanId'])
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 32, default: 'discord' })
    platform: string;

    @Column({ name: 'external_id', type: 'varchar', length: 128 })
    externalId: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    username?: string;

    @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
    displayName?: string;

    @Column({ name: 'avatar_url', type: 'varchar', length: 512, nullable: true })
    avatarUrl?: string;

    @Column({ name: 'clan_id', type: 'varchar', length: 128, nullable: true })
    clanId?: string;

    @Column({ name: 'clan_nick', type: 'varchar', length: 255, nullable: true })
    clanNick?: string;

    @Column({ name: 'clan_avatar', type: 'varchar', length: 512, nullable: true })
    clanAvatar?: string;

    @Column({ name: 'first_seen_at', type: 'timestamp', nullable: true })
    firstSeenAt?: Date;

    @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
    lastSeenAt?: Date;

    @Column({ name: 'last_message_id', type: 'varchar', length: 128, nullable: true })
    lastMessageId?: string;

    @Column({ name: 'last_channel_id', type: 'varchar', length: 128, nullable: true })
    lastChannelId?: string;

    @Column({ name: 'last_channel_label', type: 'varchar', length: 255, nullable: true })
    lastChannelLabel?: string;

    @Column({ name: 'messages_count', type: 'int', default: 0 })
    messagesCount: number;

    @Column({ name: 'is_admin', type: 'boolean', default: false })
    isAdmin: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'meta', type: 'text', nullable: true })
    meta?: string; // lưu JSON.stringify(...)

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date | null;
}