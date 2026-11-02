import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateInventoryTransactionDto {
  @IsNotEmpty()
  @IsString()
  itemId!: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType!: TransactionType; // IN, OUT, TRANSFER, ADJUSTMENT

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
