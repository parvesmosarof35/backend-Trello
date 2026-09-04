import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { BoardsGateway } from '../boards/boards.gateway';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubtaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class UpdateSubtaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

@Controller('tasks/:taskId/subtasks')
@UseGuards(JwtAuthGuard)
export class SubtasksController {
  constructor(
    private prisma: PrismaService,
    private boardsGateway: BoardsGateway,
  ) {}

  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    const subtask = await this.prisma.subtask.create({
      data: {
        title: dto.title.trim(),
        taskId,
      },
    });

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });
    if (task?.column?.boardId) {
      this.boardsGateway.notifyBoardUpdate(task.column.boardId, 'subtask:created', subtask);
    }

    return subtask;
  }

  @Patch(':id')
  async update(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    const subtask = await this.prisma.subtask.update({
      where: { id },
      data: dto,
    });

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });
    if (task?.column?.boardId) {
      this.boardsGateway.notifyBoardUpdate(task.column.boardId, 'subtask:updated', subtask);
    }

    return subtask;
  }

  @Delete(':id')
  async remove(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });

    await this.prisma.subtask.delete({
      where: { id },
    });

    if (task?.column?.boardId) {
      this.boardsGateway.notifyBoardUpdate(task.column.boardId, 'subtask:deleted', { id, taskId });
    }

    return { message: 'Subtask deleted successfully' };
  }
}
