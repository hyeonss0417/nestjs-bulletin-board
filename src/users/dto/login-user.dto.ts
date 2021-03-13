import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class LoginUserDTO extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginUserOutput {
  @Field(type => String)
  accessToken: string;
}
