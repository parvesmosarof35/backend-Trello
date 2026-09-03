import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/members')
export class BoardMembersController {
  constructor(private boardMembersService: BoardMembersService) {}

  @Post()
  inviteMember(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.boardMembersService.inviteMember(boardId, userId, dto);
  }

  @Get()
  getMembers(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardMembersService.getMembers(boardId, userId);
  }

  @Patch(':memberId')
  updateRole(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.boardMembersService.updateRole(boardId, memberId, userId, dto);
  }

  @Delete(':memberId')
  removeMember(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardMembersService.removeMember(boardId, memberId, userId);
  }
}
