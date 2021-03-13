import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';

@InputType()
export class PaginateCommentDto {
  @Field(() => Int)
  @IsNumber()
  page: number;

  @Field(() => Int)
  @IsNumber()
  pageSize: number;
}
