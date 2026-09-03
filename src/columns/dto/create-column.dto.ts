import { IsNotEmpty, IsOptional, IsInt, IsString, Min } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty({ message: 'Column name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
