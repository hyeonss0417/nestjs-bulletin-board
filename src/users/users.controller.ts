import { Controller, Body, HttpCode, Get, Post, Req, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../common/decorators/public.decorator';
import { CreateUserDTO, UserOutput } from './dto/create-user.input';
import { LoginUserDTO, LoginUserOutput } from './dto/login-user.dto';
import { Comment } from '../posts/entities/comment.entity';
import { Post as PostEntity } from '../posts/entities/post.entity';

@Controller('users')
export class UesrsController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  async getUsers(): Promise<UserOutput[]> {
    return await this.usersService.findAll();
  }

  @Public()
  @Get(':id')
  async getUser(@Param('id') id: number): Promise<UserOutput> {
    return await this.usersService.findOneOrFail(id);
  }

  @Public()
  @Get(':id/posts')
  async getPostsByUser(@Param('id') id: number): Promise<PostEntity[]> {
    return await this.usersService.getPostsByUser(id);
  }

  @Public()
  @Get(':id/comments')
  async getCommentsByUser(@Param('id') id: number): Promise<Comment[]> {
    return await this.usersService.getCommentsByUser(id);
  }

  @Public()
  @Post()
  async signUp(@Body() CreateUserDTO: CreateUserDTO): Promise<UserOutput> {
    return await this.usersService.signUp(CreateUserDTO);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() loginUesrDto: LoginUserDTO): Promise<LoginUserOutput> {
    return { accessToken: await this.usersService.login(loginUesrDto) };
  }
}
