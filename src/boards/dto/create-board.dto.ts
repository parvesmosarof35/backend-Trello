import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty({ message: 'Board name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
