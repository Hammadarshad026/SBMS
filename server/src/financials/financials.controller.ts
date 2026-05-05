import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Role } from '../common/enums/business.enums';
import { FinancialsService } from './financials.service';
import { CreateSaleDto, CreateExpenseDto } from './dto/financial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('financials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FinancialsController {
  constructor(private financialsService: FinancialsService) {}

  @Post('sales')
  async recordSale(@Body() createSaleDto: CreateSaleDto) {
    return this.financialsService.recordSale(createSaleDto);
  }

  @Post('expenses')
  async recordExpense(@Body() createExpenseDto: CreateExpenseDto) {
    return this.financialsService.recordExpense(createExpenseDto);
  }

  @Get('sales')
  async getSales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialsService.getSales(start, end);
  }

  @Get('expenses')
  async getExpenses(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialsService.getExpenses(start, end);
  }

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialsService.getSummary(start, end);
  }

  @Delete('sales/:id')
  async deleteSale(@Param('id') id: string) {
    return this.financialsService.deleteSale(id);
  }

  @Delete('expenses/:id')
  async deleteExpense(@Param('id') id: string) {
    return this.financialsService.deleteExpense(id);
  }
}
