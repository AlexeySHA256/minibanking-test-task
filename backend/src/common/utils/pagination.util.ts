import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationRequestDto {
  @Min(1)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @Min(1)
  @Max(100)
  @IsInt()
  @IsOptional()
  limit: number = 10;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

export function createPaginatedResult<T>(
  list: T[],
  total: number,
  limit: number,
) {
  return {
    list,
    total,
    lastPage: Math.ceil(total / limit),
  };
}

export type PaginatedResult<T> = ReturnType<typeof createPaginatedResult<T>>;
