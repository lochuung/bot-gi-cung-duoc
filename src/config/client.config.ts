import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientConfigService {
    constructor(configService: ConfigService) {
        this.prefix = '!'; // Only one character prefix is supported
    }
    public prefix: string;
}