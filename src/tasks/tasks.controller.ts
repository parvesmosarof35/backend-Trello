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
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('columns/:columnId/tasks')
  create(
    @Param('columnId') columnId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(columnId, userId, dto);
  }

  @Get('columns/:columnId/tasks')
  findAll(
    @Param('columnId') columnId: string,
    @GetUser('id') userId: string,
  ) {
    return this.tasksService.findAllByColumn(columnId, userId);
  }

  @Get('tasks/:id')
  findOne(@Param('id') taskId: string, @GetUser('id') userId: string) {
    return this.tasksService.findOne(taskId, userId);
  }

  @Patch('tasks/:id')
  update(
    @Param('id') taskId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, userId, dto);
  }

  @Patch('tasks/:id/move')
  move(
    @Param('id') taskId: string,
    @GetUser('id') userId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(taskId, userId, dto);
  }

  @Delete('tasks/:id')
  remove(@Param('id') taskId: string, @GetUser('id') userId: string) {
    return this.tasksService.remove(taskId, userId);
  }
}
