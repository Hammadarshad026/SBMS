import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/business.enums';

export class CreateEmployeeDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  position!: string;

  @IsNumber()
  @Type(() => Number)
  salary!: number;
}
