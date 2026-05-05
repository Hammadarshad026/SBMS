import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(createTaskDto: CreateTaskDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: createTaskDto.assignedTo },
    });

    if (!employee) {
      throw new NotFoundException(
        `Employee with ID ${createTaskDto.assignedTo} not found`,
      );
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        deadline: new Date(createTaskDto.deadline),
        assignedTo: createTaskDto.assignedTo,
      },
      include: {
        employee: true,
      },
    });
  }

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        employee: true,
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async findByEmployee(employeeId: string) {
    return this.prisma.task.findMany({
      where: { assignedTo: employeeId },
      include: {
        employee: true,
      },
    });
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);

    const updateData: any = {};

    if (updateTaskDto.title !== undefined) {
      updateData.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      updateData.description = updateTaskDto.description;
    }

    if (updateTaskDto.deadline !== undefined) {
      updateData.deadline = new Date(updateTaskDto.deadline);
    }

    if (updateTaskDto.assignedTo !== undefined) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: updateTaskDto.assignedTo },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${updateTaskDto.assignedTo} not found`,
        );
      }

      updateData.assignedTo = updateTaskDto.assignedTo;
    }

    if (updateTaskDto.status !== undefined) {
      updateData.status = updateTaskDto.status;
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
      },
    });
  }

  async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    userEmployeeId: string,
  ) {
    const task = await this.findOne(id);

    // Verify that the employee is updating their own task
    if (task.assignedTo !== userEmployeeId) {
      throw new ForbiddenException(
        'You can only update the status of your own tasks',
      );
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: updateTaskStatusDto.status },
      include: {
        employee: true,
      },
    });
  }

  async removeTask(id: string) {
    await this.findOne(id);

    await this.prisma.task.delete({
      where: { id },
    });

    return { message: `Task with ID ${id} has been deleted` };
  }
}
