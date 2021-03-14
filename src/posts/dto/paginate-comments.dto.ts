import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class PaginateCommentDto {
  @Field(() => Int)
  @IsNotEmpty()
  page: number;

  @Field(() => Int)
  @IsNotEmpty()
  pageSize: number;
}
