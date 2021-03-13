import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateCommentDTO } from './dto/create-comment.input';
import { UpdateCommentDTO } from './dto/update-comment.input';
import { Comment } from './entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginateCommentDto } from './dto/paginate-comments.dto';
import { UpdatePostDto } from './dto/update-post.input';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findAll(): Promise<Post[]> {
    return await this.postsRepository.find();
  }

  async findOneOrFail(id: number, option?: FindOneOptions<Post>): Promise<Post> {
    let post: Post;
    try {
      post = await this.postsRepository.findOneOrFail(id, option);
    } catch (error) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }
    return post;
  }

  async create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    return await this.postsRepository.save({ writer: { id: userId }, ...createPostDto });
  }

  async update(userId: number, postId: number, updatePostdto: UpdatePostDto): Promise<Post> {
    const post = await this.findOneOrFail(postId);

    if (post.writerId !== userId)
      throw new UnauthorizedException('게시물 작성자만 수정할 수 있습니다.');

    return this.postsRepository.save({
      ...post,
      ...updatePostdto,
    });
  }

  async remove(userId: number, postId: number): Promise<boolean> {
    const post = await this.findOneOrFail(postId, { select: ['id', 'writerId'] });

    if (post.writerId !== userId)
      throw new UnauthorizedException('게시물 작성자만 삭제할 수 있습니다.');

    await this.postsRepository.remove(post);
    return true;
  }

  // ========== Comments ==========
  async findCommentsAsPagination(
    postId: number,
    { page, pageSize }: PaginateCommentDto,
  ): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { postId },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }

  async findOneCommentOrFail(id: number, option?: FindOneOptions<Comment>): Promise<Comment> {
    let comment: Comment;
    try {
      comment = await this.commentsRepository.findOneOrFail(id, option);
    } catch (error) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }
    return comment;
  }

  async createComment(writerId: number, { postId, content }: CreateCommentDTO): Promise<Comment> {
    const post = await this.postsRepository.findOne(postId);
    if (!post) throw new NotFoundException('존재하지 않는 게시글입니다.');
    return await this.commentsRepository.save({ writerId, postId, content });
  }

  async updateComment(userId: number, { id, content }: UpdateCommentDTO): Promise<Comment> {
    const comment = await this.findOneCommentOrFail(id);

    if (comment.writerId !== userId)
      throw new UnauthorizedException('댓글 작성자만 수정할 수 있습니다.');

    comment.content = content;
    return this.commentsRepository.save(comment);
  }

  async removeComment(userId: number, id: number): Promise<boolean> {
    const comment = await this.commentsRepository.findOneOrFail(id, { relations: ['post'] });

    if (comment.writerId !== userId && comment.post.writerId)
      throw new UnauthorizedException('댓글 작성자 혹은 글 작성자만 삭제할 수 있습니다.');

    await this.commentsRepository.delete(id);
    return true;
  }
}
