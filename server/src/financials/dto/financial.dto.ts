import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleDto {
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateExpenseDto {
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class SaleResponseDto {
  id: string;
  amount: number;
  description?: string;
  date: Date;
}

export class ExpenseResponseDto {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: Date;
}

export class FinancialSummaryDto {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
}
