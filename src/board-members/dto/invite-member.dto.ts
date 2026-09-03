import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class InviteMemberDto {
  @IsNotEmpty({ message: 'User email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be OWNER, MEMBER, or VIEWER' })
  role?: Role;
}
