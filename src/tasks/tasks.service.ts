import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private async verifyColumnAccess(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: {
        board: {
          include: { members: true },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const hasAccess =
      column.board.ownerId === userId ||
      column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return column;
  }

  async create(columnId: string, userId: string, dto: CreateTaskDto) {
    await this.verifyColumnAccess(columnId, userId);

    let position = dto.position;
    if (position === undefined) {
      const highestPositionTask = await this.prisma.task.findFirst({
        where: { columnId },
        orderBy: { position: 'desc' },
      });
      position = highestPositionTask ? highestPositionTask.position + 1 : 0;
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        position,
        columnId,
        creatorId: userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAllByColumn(columnId: string, userId: string) {
    await this.verifyColumnAccess(columnId, userId);

    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: { members: true },
            },
          },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      task.column.board.ownerId === userId ||
      task.column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: { members: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      task.column.board.ownerId === userId ||
      task.column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to modify this task');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: dto,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async remove(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: { members: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      task.column.board.ownerId === userId ||
      task.column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    const oldPosition = task.position;
    const oldColumnId = task.columnId;

    await this.prisma.$transaction([
      this.prisma.task.delete({
        where: { id: taskId },
      }),
      this.prisma.task.updateMany({
        where: {
          columnId: oldColumnId,
          position: { gt: oldPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      }),
    ]);

    return { message: 'Task deleted successfully' };
  }

  async move(taskId: string, userId: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: { members: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess =
      task.column.board.ownerId === userId ||
      task.column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to move this task');
    }

    const sourceColumnId = task.columnId;
    const targetColumnId = dto.targetColumnId;
    const oldPosition = task.position;
    const newPosition = dto.targetIndex;

    // Verify target column exists and belongs to the same board
    const targetColumn = await this.prisma.column.findUnique({
      where: { id: targetColumnId },
    });

    if (!targetColumn || targetColumn.boardId !== task.column.boardId) {
      throw new NotFoundException('Target column does not exist on this board');
    }

    if (sourceColumnId === targetColumnId) {
      // Reordering inside the SAME column
      if (oldPosition === newPosition) {
        return task;
      }

      await this.prisma.$transaction(async (tx) => {
        if (newPosition > oldPosition) {
          // Moved down: shift intervening tasks up
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: { decrement: 1 },
            },
          });
        } else {
          // Moved up: shift intervening tasks down
          await tx.task.updateMany({
            where: {
              columnId: sourceColumnId,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: { increment: 1 },
            },
          });
        }

        await tx.task.update({
          where: { id: taskId },
          data: { position: newPosition },
        });
      });
    } else {
      // Moving CROSS COLUMN
      await this.prisma.$transaction(async (tx) => {
        // 1. Shift remaining tasks in source column down to fill the gap
        await tx.task.updateMany({
          where: {
            columnId: sourceColumnId,
            position: { gt: oldPosition },
          },
          data: {
            position: { decrement: 1 },
          },
        });

        // 2. Shift tasks in target column up to make room
        await tx.task.updateMany({
          where: {
            columnId: targetColumnId,
            position: { gte: newPosition },
          },
          data: {
            position: { increment: 1 },
          },
        });

        // 3. Move task to target column with new position
        await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: targetColumnId,
            position: newPosition,
          },
        });
      });
    }

    return this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
