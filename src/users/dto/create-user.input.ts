import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUesrDTO extends PickType(User, ['email', 'password']) {}

// @ObjectType()
// export class CreateUserOutput extends PickType(User, [
//   'email',
//   'createdAt',
//   'updatedAt',
// ] as const) {}
