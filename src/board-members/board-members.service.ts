import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BoardMembersService {
  constructor(private prisma: PrismaService) {}

  async inviteMember(boardId: string, requesterId: string, dto: InviteMemberDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== requesterId) {
      throw new ForbiddenException('Only the board owner can invite new members');
    }

    const userToInvite = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!userToInvite) {
      throw new NotFoundException(`No registered user found with email "${dto.email}"`);
    }

    if (userToInvite.id === board.ownerId) {
      throw new ConflictException('This user is already the owner of this board');
    }

    const existingMember = board.members.find((m) => m.userId === userToInvite.id);
    if (existingMember) {
      throw new ConflictException('User is already a member of this board');
    }

    const member = await this.prisma.boardMember.create({
      data: {
        boardId,
        userId: userToInvite.id,
        role: dto.role || Role.MEMBER,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return member;
  }

  async getMembers(boardId: string, requesterId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isAuthorized =
      board.ownerId === requesterId ||
      board.members.some((m) => m.userId === requesterId);

    if (!isAuthorized) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return {
      owner: board.owner,
      members: board.members,
    };
  }

  async updateRole(
    boardId: string,
    memberId: string,
    requesterId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== requesterId) {
      throw new ForbiddenException('Only the board owner can change member roles');
    }

    const member = await this.prisma.boardMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.boardId !== boardId) {
      throw new NotFoundException('Member record not found');
    }

    return this.prisma.boardMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async removeMember(boardId: string, memberId: string, requesterId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const member = await this.prisma.boardMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.boardId !== boardId) {
      throw new NotFoundException('Member record not found');
    }

    // Allowed if requester is the board owner OR if member is removing themselves
    if (board.ownerId !== requesterId && member.userId !== requesterId) {
      throw new ForbiddenException('You do not have permission to remove this member');
    }

    await this.prisma.boardMember.delete({
      where: { id: memberId },
    });

    return { message: 'Member removed from board successfully' };
  }
}
