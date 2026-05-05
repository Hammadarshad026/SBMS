import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsString()
  employeeId: string;
}

export class CheckOutDto {
  @IsString()
  employeeId: string;
}

export class AttendanceResponseDto {
  id: string;
  date: Date;
  checkIn: Date;
  checkOut: Date | null;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}
