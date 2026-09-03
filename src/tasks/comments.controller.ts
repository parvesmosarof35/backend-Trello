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
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.comment.create({
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
  }

  @Delete(':id')
  async remove(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    await this.prisma.comment.delete({
      where: { id },
    });
    return { message: 'Comment deleted successfully' };
  }
}
