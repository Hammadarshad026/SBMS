import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    // Create user and employee in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          name: createEmployeeDto.name,
          email: createEmployeeDto.email,
          password: hashedPassword,
          role: createEmployeeDto.role,
        },
      });

      const employee = await prisma.employee.create({
        data: {
          position: createEmployeeDto.position,
          salary: createEmployeeDto.salary,
          userId: user.id,
        },
        include: {
          user: true,
        },
      });

      return employee;
    });

    const { user, ...employeeData } = result;
    const { password, ...safeUser } = user;

    return {
      ...employeeData,
      user: safeUser,
    };
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: true,
        attendance: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tasks: true,
        attendance: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    const updateData: any = {};

    if (updateEmployeeDto.position !== undefined) {
      updateData.position = updateEmployeeDto.position;
    }

    if (updateEmployeeDto.salary !== undefined) {
      updateData.salary = updateEmployeeDto.salary;
    }

    if (updateEmployeeDto.name !== undefined) {
      await this.prisma.user.update({
        where: { id: employee.userId },
        data: { name: updateEmployeeDto.name },
      });
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string) {
    const employee = await this.findOne(id);

    // Delete the associated user (which will cascade delete the employee)
    await this.prisma.user.delete({
      where: { id: employee.userId },
    });

    return { message: `Employee with ID ${id} has been deleted` };
  }
}
