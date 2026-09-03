import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class MoveTaskDto {
  @IsNotEmpty({ message: 'Target column ID is required' })
  @IsString()
  targetColumnId: string;

  @IsNotEmpty({ message: 'Target index position is required' })
  @IsInt()
  @Min(0)
  targetIndex: number;
}
