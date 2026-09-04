import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardsGateway } from '../boards/boards.gateway';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    private prisma: PrismaService,
    private boardsGateway: BoardsGateway,
  ) {}

  private async verifyBoardAccess(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const hasAccess =
      board.ownerId === userId || board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  async create(boardId: string, userId: string, dto: CreateColumnDto) {
    await this.verifyBoardAccess(boardId, userId);

    let position = dto.position;
    if (position === undefined) {
      const highestPositionColumn = await this.prisma.column.findFirst({
        where: { boardId },
        orderBy: { position: 'desc' },
      });
      position = highestPositionColumn ? highestPositionColumn.position + 1 : 0;
    }

    const column = await this.prisma.column.create({
      data: {
        name: dto.name,
        position,
        boardId,
      },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    this.boardsGateway.notifyBoardUpdate(boardId, 'column:created', column);
    return column;
  }

  async findAllByBoard(boardId: string, userId: string) {
    await this.verifyBoardAccess(boardId, userId);

    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async update(columnId: string, userId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: { include: { members: true } } },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const hasAccess =
      column.board.ownerId === userId ||
      column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to modify this column');
    }

    const updatedColumn = await this.prisma.column.update({
      where: { id: columnId },
      data: dto,
      include: {
        tasks: {
          orderBy: { position: 'asc' },
        },
      },
    });

    this.boardsGateway.notifyBoardUpdate(column.boardId, 'column:updated', updatedColumn);
    return updatedColumn;
  }

  async remove(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { board: { include: { members: true } } },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const hasAccess =
      column.board.ownerId === userId ||
      column.board.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to delete this column');
    }

    await this.prisma.column.delete({
      where: { id: columnId },
    });

    this.boardsGateway.notifyBoardUpdate(column.boardId, 'column:deleted', { columnId });
    return { message: 'Column deleted successfully' };
  }
}
