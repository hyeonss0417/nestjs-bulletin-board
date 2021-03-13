import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.input';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { AuthUser } from '../common/decorators/auth-user.decorator';
import { Comment } from './entities/comment.entity';
import { PaginateCommentDto } from './dto/paginate-comments.dto';
import { CreateCommentDTO } from './dto/create-comment.input';
import { UpdateCommentDTO } from './dto/update-comment.input';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Query(() => [Post], { name: 'posts' })
  async findAll(): Promise<Post[]> {
    return await this.postsService.findAll();
  }

  @Public()
  @Query(() => Post, { name: 'post' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Post> {
    return await this.postsService.findOneOrFail(id);
  }

  @Public()
  @ResolveField('comments', returns => [Comment])
  async findCommentsAsPagination(
    @Parent() post: Post,
    @Args('input') paginateCommentDTO: PaginateCommentDto,
  ): Promise<Comment[]> {
    return await this.postsService.findCommentsAsPagination(post.id, paginateCommentDTO);
  }

  // ========== Post ==========
  @Mutation(() => Post)
  async createPost(
    @AuthUser() user: User,
    @Args('input') createPostInput: CreatePostDto,
  ): Promise<Post> {
    return await this.postsService.create(user.id, createPostInput);
  }

  @Mutation(() => Post)
  async updatePost(
    @AuthUser() user: User,
    @Args('input') updatePostInput: UpdatePostDto,
  ): Promise<Post> {
    return await this.postsService.update(user.id, updatePostInput);
  }

  @Mutation(() => Boolean)
  async deletePost(
    @AuthUser() user: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return await this.postsService.remove(user.id, id);
  }

  // ========== Comment ==========
  @Mutation(() => Comment)
  async createComment(
    @AuthUser() user: User,
    @Args('input') createCommentDTO: CreateCommentDTO,
  ): Promise<Comment> {
    return await this.postsService.createComment(user.id, createCommentDTO);
  }

  @Mutation(() => Comment)
  async updateComment(
    @AuthUser() user: User,
    @Args('input') updateCommentDTO: UpdateCommentDTO,
  ): Promise<Comment> {
    return await this.postsService.updateComment(user.id, updateCommentDTO);
  }

  @Mutation(() => Boolean)
  async deleteComment(
    @AuthUser() user: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return await this.postsService.removeComment(user.id, id);
  }
}
