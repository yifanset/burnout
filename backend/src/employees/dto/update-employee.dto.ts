import { IsString, IsInt, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class UpdateEmployeeDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    position?: string;

    @IsInt()
    @IsOptional()
    experience?: number;

    @IsInt()
    @IsOptional()
    age?: number;

    @IsString()
    @IsOptional()
    positionType?: string;

    @IsBoolean()
    @IsOptional()
    certification?: boolean;

    @IsBoolean()
    @IsOptional()
    training?: boolean;

    @IsDateString()
    @IsOptional()
    lastVacation?: string;

    @IsInt()
    @IsOptional()
    kpiMonths?: number;

    @IsBoolean()
    @IsOptional()
    sickLeave?: boolean;

    @IsBoolean()
    @IsOptional()
    reprimands?: boolean;

    @IsBoolean()
    @IsOptional()
    corporateEvents?: boolean;

    @IsString()
    @IsOptional()
    kpiValues?: string;

    @IsString()
    @IsOptional()
    llmRecommendation?: string;
}