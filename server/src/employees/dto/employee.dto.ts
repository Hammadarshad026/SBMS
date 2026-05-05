import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  salary?: number;

  @IsString()
  @IsOptional()
  name?: string;
}

export class EmployeeResponseDto {
  id: string;
  position: string;
  salary: number;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
