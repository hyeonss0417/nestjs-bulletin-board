import { Field, InputType, Int, PickType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Comment } from '../entities/comment.entity';

@InputType()
export class UpdateCommentDTO extends PickType(Comment, ['content']) {}
