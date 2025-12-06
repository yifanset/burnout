import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<any> {
        const existingUser = await this.prisma.user.findUnique({
            where: { username: registerDto.username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const user = await this.prisma.user.create({
            data: {
                username: registerDto.username,
                password: registerDto.password,
            },
        });

        const token = this.jwtService.sign({
            userId: user.id,
            username: user.username
        });

        return {
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }

    async login(loginDto: LoginDto): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { username: loginDto.username },
        });

        if (!user || user.password !== loginDto.password) {
            throw new Error('Invalid credentials');
        }

        const token = this.jwtService.sign({
            userId: user.id,
            username: user.username
        });

        return {
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }

    async validateUser(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            username: user.username,
        };
    }
}