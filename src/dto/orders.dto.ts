import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  paymentMethod: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
