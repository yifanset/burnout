import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, CreateEmployeeBulkDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: number, createEmployeeDto: CreateEmployeeDto) {
        const employeeData = {
            ...createEmployeeDto,
            fullName: createEmployeeDto.fullName || 'Anonymous',
            userId, // Получаем из токена
        };

        return this.prisma.employee.create({
            data: employeeData
        });
    }

    async createMany(userId: number, createEmployeeDtos: CreateEmployeeDto[]) {
        const processedData = createEmployeeDtos.map(dto => ({
            ...dto,
            fullName: dto.fullName || 'Anonymous',
            userId, // Получаем из токена для всех записей
        }));

        return this.prisma.$transaction(
            processedData.map(data =>
                this.prisma.employee.create({ data })
            )
        );
    }

    async findAllByUser(userId: number) {
        return this.prisma.employee.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: number, userId: number) {
        return this.prisma.employee.findFirst({
            where: {
                id,
                userId
            }
        });
    }

    async update(id: number, userId: number, updateEmployeeDto: UpdateEmployeeDto) {
        // Проверяем, что сотрудник принадлежит пользователю
        const employee = await this.prisma.employee.findFirst({
            where: { id, userId }
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        return this.prisma.employee.update({
            where: { id },
            data: updateEmployeeDto
        });
    }

    async delete(id: number, userId: number) {
        // Проверяем, что сотрудник принадлежит пользователю
        const employee = await this.prisma.employee.findFirst({
            where: { id, userId }
        });

        if (!employee) {
            throw new Error('Employee not found');
        }

        return this.prisma.employee.delete({
            where: { id }
        });
    }
}