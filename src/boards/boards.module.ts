import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardAccessGuard } from './guards/board-access.guard';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, BoardAccessGuard],
  exports: [BoardsService, BoardAccessGuard],
})
export class BoardsModule {}
