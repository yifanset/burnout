import { IsString, IsInt, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    gender: string;

    @IsString()
    city: string;

    @IsString()
    position: string;

    @IsInt()
    experience: number;

    @IsInt()
    age: number;

    @IsString()
    positionType: string;

    @IsBoolean()
    certification: boolean;

    @IsBoolean()
    training: boolean;

    @IsDateString()
    @IsOptional()
    lastVacation?: string;

    @IsInt()
    @IsOptional()
    kpiMonths?: number;

    @IsBoolean()
    sickLeave: boolean;

    @IsBoolean()
    reprimands: boolean;

    @IsBoolean()
    corporateEvents: boolean;

    @IsString()
    kpiValues: string;

    @IsString()
    @IsOptional()
    llmRecommendation?: string;
}

export class CreateEmployeeBulkDto {
    employees: CreateEmployeeDto[];
}