import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Comment } from '../posts/entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateUesrDTO } from './dto/create-user.input';
import { LoginUserDTO } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }
  async findOneOrFail(id: number, option?: FindOneOptions<User>): Promise<User> {
    let user: User;
    try {
      user = await this.userRepository.findOneOrFail(id, option);
    } catch (error) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    return user;
  }

  async signUp(createUesrDto: CreateUesrDTO): Promise<User> {
    const { email } = createUesrDto;

    const exists = await this.userRepository.findOne({ email }, { select: ['id'] });
    if (exists) throw new ConflictException('이미 가입된 이메일입니다');

    const user = this.userRepository.create(createUesrDto);
    return await this.userRepository.save(user);
  }

  async login({ email, password }: LoginUserDTO): Promise<string> {
    const user = await this.userRepository.findOne(
      { email },
      { select: ['id', 'email', 'password'] },
    );

    if (user && (await user.checkPassword(password))) {
      const { id, email, password } = user;
      return this.authService.getAccessToken({ id, email });
    }

    throw new BadRequestException('아이디와 비밀번호를 확인해주세요');
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return (await this.userRepository.findOne(userId, { relations: ['posts'] })).posts;
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return (await this.userRepository.findOne(userId, { relations: ['comments'] })).comments;
  }
}
