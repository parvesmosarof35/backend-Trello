import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SubtasksController } from './subtasks.controller';
import { CommentsController } from './comments.controller';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [BoardsModule],
  controllers: [TasksController, SubtasksController, CommentsController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
