import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EmployeeService } from './employees.service';
import { CreateEmployeeDto, CreateEmployeeBulkDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Post()
    async create(@Request() req, @Body() createEmployeeDto: CreateEmployeeDto) {
        const userId = req.user.userId;
        return this.employeeService.create(userId, createEmployeeDto);
    }

    @Post('bulk')
    async createMany(@Request() req, @Body() createEmployeeBulkDto: CreateEmployeeBulkDto) {
        const userId = req.user.userId;
        return this.employeeService.createMany(userId, createEmployeeBulkDto.employees);
    }

    @Post('batch')
    async createBatch(@Request() req, @Body() employees: CreateEmployeeDto[]) {
        const userId = req.user.userId;
        return this.employeeService.createMany(userId, employees);
    }

    @Get()
    async findAll(@Request() req) {
        const userId = req.user.userId;
        return this.employeeService.findAllByUser(userId);
    }

    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        const userId = req.user.userId;
        return this.employeeService.findOne(parseInt(id), userId);
    }

    @Put(':id')
    async update(@Request() req, @Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
        const userId = req.user.userId;
        return this.employeeService.update(parseInt(id), userId, updateEmployeeDto);
    }

    @Delete(':id')
    async delete(@Request() req, @Param('id') id: string) {
        const userId = req.user.userId;
        return this.employeeService.delete(parseInt(id), userId);
    }
}