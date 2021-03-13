import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { IsInt, IsNumber, IsString } from 'class-validator';

@InputType('CommentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  @IsInt()
  @Field(type => Int)
  id: number;

  @Column()
  @Field(type => Int)
  @IsInt()
  writerId: number;

  @Column()
  @Field(type => Int)
  @IsInt()
  postId: number;

  @Column()
  @Field(type => String)
  @IsString()
  content: string;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.posts,
  )
  @JoinColumn({ name: 'writerId' })
  user: User;

  @Field(type => Post)
  @ManyToOne(
    type => Post,
    comment => comment.comments,
  )
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn()
  @Field(type => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(type => Date)
  updatedAt: Date;
}
