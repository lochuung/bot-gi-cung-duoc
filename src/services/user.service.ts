import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/entities/user.entity';
import { ChannelMessage } from 'mezon-sdk';
import { ADMIN_CONFIG } from '@app/config/admin.config';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Find or create a user from a channel message
     * @param message The channel message containing user information
     * @param platform The platform name (default: 'mezon')
     * @returns The user entity
     */
    async findOrCreateUser(message: ChannelMessage, platform: string = 'mezon'): Promise<User> {
        const externalId = message.sender_id;

        try {
            // Try to find existing user
            let user = await this.userRepository.findOne({
                where: {
                    platform,
                    externalId,
                },
            });

            if (user) {
                // Update activity tracking for existing user
                user.lastSeenAt = new Date();
                user.lastMessageId = message.message_id;
                user.lastChannelId = message.channel_id;
                user.lastChannelLabel = message.channel_label;
                user.messagesCount += 1;
                user.isAdmin = ADMIN_CONFIG.usernames.includes(message.username) || user.isAdmin;

                await this.userRepository.save(user);
                return user;
            }

            // Create new user if not found
            user = this.userRepository.create({
                platform,
                externalId,
                username: message.username,
                displayName: message.display_name,
                avatarUrl: message.avatar,
                clanId: message.clan_id,
                clanNick: message.clan_nick,
                clanAvatar: message.clan_avatar,
                firstSeenAt: new Date(),
                lastSeenAt: new Date(),
                lastMessageId: message.message_id,
                lastChannelId: message.channel_id,
                lastChannelLabel: message.channel_label,
                messagesCount: 1,
                isAdmin: ADMIN_CONFIG.usernames.includes(message.username) || false,
                isActive: true,
            });

            const savedUser = await this.userRepository.save(user);
            this.logger.log(`New user created: ${savedUser.username || savedUser.externalId} (ID: ${savedUser.id})`);

            return savedUser;
        } catch (error) {
            this.logger.error(`Error finding/creating user for ${externalId}:`, error);
            throw error;
        }
    }

    /**
     * Find a user by external ID and platform
     * @param externalId The external user ID
     * @param platform The platform name (default: 'mezon')
     * @returns The user entity or null if not found
     */
    async findUserByExternalId(externalId: string, platform: string = 'mezon'): Promise<User | null> {
        try {
            return await this.userRepository.findOne({
                where: {
                    platform,
                    externalId,
                },
            });
        } catch (error) {
            this.logger.error(`Error finding user by external ID ${externalId}:`, error);
            return null;
        }
    }

    /**
     * Update user activity without saving new user
     * @param message The channel message
     * @param platform The platform name (default: 'mezon')
     */
    async updateUserActivity(message: ChannelMessage, platform: string = 'mezon'): Promise<void> {
        try {
            await this.userRepository.update(
                {
                    platform,
                    externalId: message.sender_id,
                },
                {
                    lastSeenAt: new Date(),
                    lastMessageId: message.message_id,
                    lastChannelId: message.channel_id,
                    lastChannelLabel: message.channel_label,
                    messagesCount: () => 'messages_count + 1',
                }
            );
        } catch (error) {
            this.logger.error(`Error updating user activity for ${message.sender_id}:`, error);
        }
    }

    /**
     * Check if user is admin
     * @param externalId The external user ID
     * @param platform The platform name (default: 'mezon')
     * @returns true if user is admin, false otherwise
     */
    async isUserAdmin(externalId: string, platform: string = 'mezon'): Promise<boolean> {
        try {
            const user = await this.findUserByExternalId(externalId, platform);
            return user?.isAdmin || false;
        } catch (error) {
            this.logger.error(`Error checking admin status for ${externalId}:`, error);
            return false;
        }
    }

    /**
     * Set user admin status
     * @param externalId The external user ID
     * @param isAdmin Admin status to set
     * @param platform The platform name (default: 'mezon')
     */
    async setUserAdmin(externalId: string, isAdmin: boolean, platform: string = 'mezon'): Promise<void> {
        try {
            await this.userRepository.update(
                {
                    platform,
                    externalId,
                },
                {
                    isAdmin,
                }
            );
            this.logger.log(`Updated admin status for ${externalId}: ${isAdmin}`);
        } catch (error) {
            this.logger.error(`Error setting admin status for ${externalId}:`, error);
            throw error;
        }
    }
}
