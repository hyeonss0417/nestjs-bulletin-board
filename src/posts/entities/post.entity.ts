import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Length } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../users/entities/user.entity';

@InputType('PostInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  @Field(type => Int)
  @IsInt()
  id: number;

  @Column()
  @Field(type => Int)
  @IsInt()
  writerId: number;

  @Column()
  @Field(type => String)
  @Length(1, 200, { message: '제목은 1자 이상 100자 이하로 입력해주세요' })
  title: string;

  @Column({ type: 'text' })
  @Field(type => String)
  @IsString()
  content: string;

  @Field(type => [Comment])
  @OneToMany(
    type => Comment,
    comment => comment.post,
  )
  comments: Comment[];

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.posts,
    { eager: true },
  )
  @JoinColumn({ name: 'writerId' })
  writer: User;

  @CreateDateColumn()
  @Field(type => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(type => Date)
  updatedAt: Date;
}
