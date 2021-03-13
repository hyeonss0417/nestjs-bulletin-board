import { IsEmail, IsString } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../posts/entities/comment.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Column({ unique: true })
  @Field(type => String)
  @IsEmail({}, { message: '올바른 이메일을 입력해주세요' })
  email: string;

  @Column({ select: false })
  @Field(type => String)
  @IsString()
  password: string;

  @Field(type => [Post])
  @OneToMany(
    type => Post,
    post => post.writer,
  )
  posts: Post[];

  @Field(type => [Comment])
  @OneToMany(
    type => Comment,
    comment => comment.user,
  )
  comments: Comment[];

  @CreateDateColumn()
  @Field(type => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(type => Date)
  updatedAt: Date;

  // ===== Security =====
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        const saltOrRounds = 10;
        this.password = await bcrypt.hash(this.password, saltOrRounds);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  // ===== Methods =====
  public async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
