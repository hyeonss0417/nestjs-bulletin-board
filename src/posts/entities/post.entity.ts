import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
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
  @IsNumber()
  @Field(type => Number)
  id: number;

  @Column()
  @Field(type => Number)
  @IsNumber()
  writerId: number;

  @Column()
  @Field(type => String)
  @IsString()
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
