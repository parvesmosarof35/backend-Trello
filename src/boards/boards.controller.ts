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
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.boardsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') boardId: string, @GetUser('id') userId: string) {
    return this.boardsService.findOne(boardId, userId);
  }

  @Patch(':id')
  update(
    @Param('id') boardId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(boardId, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') boardId: string, @GetUser('id') userId: string) {
    return this.boardsService.remove(boardId, userId);
  }
}
