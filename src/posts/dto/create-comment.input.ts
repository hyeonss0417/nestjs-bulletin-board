import { InputType, PickType } from '@nestjs/graphql';
import { Comment } from '../entities/comment.entity';

@InputType()
export class CreateCommentDTO extends PickType(Comment, ['content', 'postId']) {}
