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

  // ========== Post Query ==========
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

  // ========== Post Mutation ==========
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
    @Args('id', { type: () => Int }) postId: number,
    @Args('input') updatePostInput: UpdatePostDto,
  ): Promise<Post> {
    return await this.postsService.update(user.id, postId, updatePostInput);
  }

  @Mutation(() => Boolean)
  async deletePost(
    @AuthUser() user: User,
    @Args('id', { type: () => Int }) postId: number,
  ): Promise<boolean> {
    return await this.postsService.remove(user.id, postId);
  }

  // ========== Comment CUD ==========
  @Mutation(() => Comment)
  async createComment(
    @AuthUser() user: User,
    @Args('postId') postId: number,
    @Args('input') createCommentDTO: CreateCommentDTO,
  ): Promise<Comment> {
    return await this.postsService.createComment(user.id, postId, createCommentDTO);
  }

  @Mutation(() => Comment)
  async updateComment(
    @AuthUser() user: User,
    @Args('commentId') commentId: number,
    @Args('input') updateCommentDTO: UpdateCommentDTO,
  ): Promise<Comment> {
    return await this.postsService.updateComment(user.id, commentId, updateCommentDTO);
  }

  @Mutation(() => Boolean)
  async deleteComment(
    @AuthUser() user: User,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<boolean> {
    return await this.postsService.removeComment(user.id, commentId);
  }
}
