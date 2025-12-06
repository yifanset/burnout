import { Module } from '@nestjs/common';
import { EmployeeService } from './employees.service';
import { EmployeeController } from './employees.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [EmployeeController],
    providers: [EmployeeService, PrismaService],
})
export class EmployeeModule {}