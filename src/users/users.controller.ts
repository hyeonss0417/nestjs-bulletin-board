import { Controller, Body, HttpCode, Get, Post, Req, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../common/decorators/public.decorator';
import { CreateUesrDTO } from './dto/create-user.input';
import { LoginUserDTO, LoginUserOutput } from './dto/login-user.dto';
import { Comment } from '../posts/entities/comment.entity';
import { Post as PostEntity } from '../posts/entities/post.entity';
import { User } from './entities/user.entity';

@Controller('users')
export class UesrsController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async signUp(@Body() createUesrDto: CreateUesrDTO): Promise<User> {
    return await this.usersService.signUp(createUesrDto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() loginUesrDto: LoginUserDTO): Promise<LoginUserOutput> {
    return { accessToken: await this.usersService.login(loginUesrDto) };
  }

  @Get(':id/posts')
  async getPostsByUser(@Param('id') id: number): Promise<PostEntity[]> {
    return await this.usersService.getPostsByUser(id);
  }

  @Get(':id/comments')
  async getCommentsByUser(@Param('id') id: number): Promise<Comment[]> {
    return await this.usersService.getCommentsByUser(id);
  }
}
