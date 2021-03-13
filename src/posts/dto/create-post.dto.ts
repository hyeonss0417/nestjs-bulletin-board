import { InputType, PickType } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@InputType()
export class CreatePostDto extends PickType(Post, ['title', 'content']) {}
