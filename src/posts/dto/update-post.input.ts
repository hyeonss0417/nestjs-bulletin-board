import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

@InputType()
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @Field(() => Int)
  @IsOptional()
  id?: number;
}
