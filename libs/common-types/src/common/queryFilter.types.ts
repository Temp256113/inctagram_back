import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsPositive, IsString, IsIn } from 'class-validator';

export class QueryFilter {
  @IsOptional()
  @Transform((value: TransformFnParams) => parseInt(value.value, 10))
  @IsPositive()
  @ApiProperty({
    required: false,
    default: 1,
    description: 'pageNumber is number of portions that should be returned',
  })
  pageNumber: number = 1;

  @IsOptional()
  @Transform((value: TransformFnParams) => parseInt(value.value, 10))
  @IsPositive()
  @ApiProperty({
    required: false,
    default: 10,
    description: 'pageSize is portions size that should be returned',
  })
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'createdAt' })
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({ required: false, default: 'desc', enum: ['asc', 'desc'] })
  sortDirection: sortDirection = 'desc';
}

type sortDirection = 'asc' | 'desc';
