import { Module } from '@nestjs/common';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [BoardsModule],
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
  exports: [BoardMembersService],
})
export class BoardMembersModule {}
