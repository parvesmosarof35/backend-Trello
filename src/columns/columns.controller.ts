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
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post('boards/:boardId/columns')
  create(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.create(boardId, userId, dto);
  }

  @Get('boards/:boardId/columns')
  findAll(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.columnsService.findAllByBoard(boardId, userId);
  }

  @Patch('columns/:id')
  update(
    @Param('id') columnId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(columnId, userId, dto);
  }

  @Delete('columns/:id')
  remove(
    @Param('id') columnId: string,
    @GetUser('id') userId: string,
  ) {
    return this.columnsService.remove(columnId, userId);
  }
}
