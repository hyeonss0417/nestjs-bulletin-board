import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Comment } from '../../posts/entities/comment.entity';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserDTO extends PickType(User, ['email', 'password']) {}

@InputType('UserOutputType', { isAbstract: true })
@ObjectType()
export class UserOutput {
  @Field(type => Int)
  id: number;

  @Field(type => String)
  email: string;

  @Field(type => [Post])
  posts?: Post[];

  @Field(type => [Comment])
  comments?: Comment[];

  @Field(type => Date)
  createdAt: Date;

  @Field(type => Date)
  updatedAt: Date;
}
