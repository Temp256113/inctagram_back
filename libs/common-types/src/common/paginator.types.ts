import { ApiProperty } from '@nestjs/swagger';

export class Paginator<T> {
  @ApiProperty({ type: Number, example: 1 })
  pagesCount: number;

  @ApiProperty({ type: Number, example: 1 })
  page: number;

  @ApiProperty({ type: Number, example: 10 })
  pageSize: number;

  @ApiProperty({ type: Number, example: 10 })
  totalCount: number;

  @ApiProperty({ type: Array })
  items: T[];
}
