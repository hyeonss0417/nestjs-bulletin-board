import { Resolver, Mutation, Args, Query, ResolveField, Int, Parent } from '@nestjs/graphql';
import { Comment } from '../posts/entities/comment.entity';
import { Public } from '../common/decorators/public.decorator';
import { Post } from '../posts/entities/post.entity';
import { CreateUserDTO, UserOutput } from './dto/create-user.input';
import { LoginUserDTO, LoginUserOutput } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => UserOutput)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Query(returns => [UserOutput], { name: 'users' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Public()
  @Query(returns => UserOutput, { name: 'user' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<User> {
    return await this.usersService.findOneOrFail(id);
  }

  @Public()
  @Mutation(returns => UserOutput)
  async signUp(@Args('input') createUesrInput: CreateUserDTO): Promise<UserOutput> {
    return await this.usersService.signUp(createUesrInput);
  }

  @Public()
  @Mutation(returns => LoginUserOutput)
  async signIn(@Args('input') loginInput: LoginUserDTO): Promise<LoginUserOutput> {
    return { accessToken: await this.usersService.login(loginInput) };
  }

  @Public()
  @ResolveField('posts', returns => [Post])
  async getPosts(@Parent() user: User): Promise<Post[]> {
    return await this.usersService.getPostsByUser(user.id);
  }

  @Public()
  @ResolveField('comments', returns => [Comment])
  async getComments(@Parent() user: User): Promise<Comment[]> {
    return await this.usersService.getCommentsByUser(user.id);
  }
}
