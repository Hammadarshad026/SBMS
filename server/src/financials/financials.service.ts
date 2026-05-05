import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto, CreateExpenseDto } from './dto/financial.dto';

@Injectable()
export class FinancialsService {
  constructor(private prisma: PrismaService) {}

  async recordSale(createSaleDto: CreateSaleDto) {
    return this.prisma.sale.create({
      data: {
        amount: createSaleDto.amount,
        description: createSaleDto.description,
        date: new Date(),
      },
    });
  }

  async recordExpense(createExpenseDto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        amount: createExpenseDto.amount,
        category: createExpenseDto.category,
        description: createExpenseDto.description,
        date: new Date(),
      },
    });
  }

  async getSales(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.date = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.date = {
        lte: endDate,
      };
    }

    return this.prisma.sale.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  async getExpenses(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.date = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.date = {
        lte: endDate,
      };
    }

    return this.prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(startDate?: Date, endDate?: Date) {
    const sales = await this.getSales(startDate, endDate);
    const expenses = await this.getExpenses(startDate, endDate);

    const totalSales = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.amount.toString()),
      0,
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount.toString()),
      0,
    );

    const netProfit = totalSales - totalExpenses;

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
    };
  }

  async deleteSale(id: string) {
    await this.prisma.sale.delete({
      where: { id },
    });

    return { message: `Sale with ID ${id} has been deleted` };
  }

  async deleteExpense(id: string) {
    await this.prisma.expense.delete({
      where: { id },
    });

    return { message: `Expense with ID ${id} has been deleted` };
  }
}
