import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateMemberRoleDto {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: 'Role must be OWNER, MEMBER, or VIEWER' })
  role: Role;
}
