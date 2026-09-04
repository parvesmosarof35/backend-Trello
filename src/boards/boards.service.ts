import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardsGateway } from './boards.gateway';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    private prisma: PrismaService,
    private boardsGateway: BoardsGateway,
  ) {}

  async create(userId: string, dto: CreateBoardDto) {
    const board = await this.prisma.board.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        columns: {
          create: [
            { name: 'To Do', position: 0 },
            { name: 'In Progress', position: 1 },
            { name: 'Done', position: 2 },
          ],
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
            },
          },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return board;
  }

  async findAll(userId: string) {
    const boards = await this.prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            columns: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return boards.map((b) => ({
      ...b,
      isOwner: b.ownerId === userId,
    }));
  }

  async findOne(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                creator: {
                  select: { id: true, name: true, email: true },
                },
                subtasks: {
                  orderBy: { createdAt: 'asc' },
                },
                comments: {
                  orderBy: { createdAt: 'asc' },
                  include: {
                    author: {
                      select: { id: true, name: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return {
      ...board,
      isOwner,
    };
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have permission to edit this board');
    }

    const updatedBoard = await this.prisma.board.update({
      where: { id: boardId },
      data: dto,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    this.boardsGateway.notifyBoardUpdate(boardId, 'board:updated', updatedBoard);
    return updatedBoard;
  }

  async remove(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can delete this board');
    }

    await this.prisma.board.delete({
      where: { id: boardId },
    });

    this.boardsGateway.notifyBoardUpdate(boardId, 'board:deleted', { boardId });
    return { message: 'Board deleted successfully' };
  }
}
