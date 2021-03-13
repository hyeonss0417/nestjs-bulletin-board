import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UesrsController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersResolver } from './users.resolver';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../posts/entities/comment.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Post, Comment])],
  controllers: [UesrsController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
