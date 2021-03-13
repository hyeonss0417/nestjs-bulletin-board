import { Controller, Post, Body, Get, Param, Delete, Patch, Req } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.input';
import { User } from '../users/entities/user.entity';
import { PaginateCommentDto } from './dto/paginate-comments.dto';
import { CreateCommentDTO } from './dto/create-comment.input';
import { UpdateCommentDTO } from './dto/update-comment.input';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.postsService.findOneOrFail(id);
  }

  @Post()
  async createPost(@Req() { user }: { user: User }, @Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(user.id, createPostDto);
  }

  @Patch(':id')
  async updatePost(
    @Req() { user }: { user: User },
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    updatePostDto.id = id;
    return await this.postsService.update(user.id, updatePostDto);
  }

  @Delete(':id')
  async deletePost(@Req() { user }: { user: User }, @Param('id') id: number) {
    return await this.postsService.remove(user.id, id);
  }

  // ========== Comment ===========
  @Public()
  @Get(':postId/comments')
  async findCommentsAsPagination(
    @Param('postId') postId: number,
    @Body() paginateComment: PaginateCommentDto,
  ) {
    return await this.postsService.findCommentsAsPagination(postId, paginateComment);
  }

  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: number,
    @Req() { user }: { user: User },
    @Body() createCommentDto: CreateCommentDTO,
  ) {
    createCommentDto.postId = postId;
    return await this.postsService.createComment(user.id, createCommentDto);
  }

  @Patch(':postId/comments/:id')
  async updateComment(
    @Req() { user }: { user: User },
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDTO,
  ) {
    updateCommentDto.id = id;
    return await this.postsService.updateComment(user.id, updateCommentDto);
  }

  @Delete(':postId/comments/:id')
  async deleteComment(@Req() { user }: { user: User }, @Param('id') id: number) {
    return await this.postsService.removeComment(user.id, id);
  }
}
