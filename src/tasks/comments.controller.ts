import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { BoardsGateway } from '../boards/boards.gateway';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private prisma: PrismaService,
    private boardsGateway: BoardsGateway,
  ) {}

  @Get()
  async findAll(@Param('taskId') taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  @Post()
  async create(
    @Param('taskId') taskId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content.trim(),
        taskId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });
    if (task?.column?.boardId) {
      this.boardsGateway.notifyBoardUpdate(task.column.boardId, 'comment:created', comment);
    }

    return comment;
  }

  @Delete(':id')
  async remove(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });

    await this.prisma.comment.delete({
      where: { id },
    });

    if (task?.column?.boardId) {
      this.boardsGateway.notifyBoardUpdate(task.column.boardId, 'comment:deleted', { id, taskId });
    }

    return { message: 'Comment deleted successfully' };
  }
}
