import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const boardId = request.params.boardId || request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!boardId) {
      return true;
    }

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: true,
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === user.id;
    const isMember = board.members.some((m) => m.userId === user.id);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this board');
    }

    request.board = board;
    request.userRole = isOwner ? 'OWNER' : board.members.find((m) => m.userId === user.id)?.role;

    return true;
  }
}
