import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AdminRole } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAdminUserDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(AdminRole)
  role: AdminRole;
}

export class UpdateAdminUserDto extends PartialType(CreateAdminUserDto) {}
