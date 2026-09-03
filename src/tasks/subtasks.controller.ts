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
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    return this.prisma.subtask.create({
      data: {
        title: dto.title.trim(),
        taskId,
      },
    });
  }

  @Patch(':id')
  async update(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return this.prisma.subtask.update({
      where: { id },
      data: dto,
    });
  }

  @Delete(':id')
  async remove(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
  ) {
    await this.prisma.subtask.delete({
      where: { id },
    });
    return { message: 'Subtask deleted successfully' };
  }
}
