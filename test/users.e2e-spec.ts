import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const testUser = {
  email: 'drama@dramancompany.com',
  password: 'string',
  userType: 'driver',
};

describe('Users (e2e)', () => {
  let app: INestApplication;

  const baseTest = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('sign-up', () => {
    const url = '/users/sign-up';
    it('should create account', () => {
      return baseTest()
        .post(url)
        .send(testUser)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('userType', testUser.userType);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });
    it('should fail if email is wrong', () => {
      return baseTest()
        .post(url)
        .send({
          email: 'dramadramancompany',
          password: 'et ea dolore dolore',
          userType: 'driver',
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '올바른 이메일을 입력해주세요');
        });
    });
    it('should fail if email already registered', () => {
      return baseTest()
        .post(url)
        .send(testUser)
        .expect(409)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '이미 가입된 이메일입니다');
        });
    });
  });
  describe('sign-in', () => {
    const url = '/users/sign-in';
    it('should log user in', () => {
      return baseTest()
        .post(url)
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.accessToken).toMatch(
            /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
          ); // JWT regex
        });
    });
    it('should fail if user does not exist', () => {
      return baseTest()
        .post(url)
        .send({ email: 'nope@nope.com', password: testUser.password })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '아이디와 비밀번호를 확인해주세요');
        });
    });
    it('should fail if password is wrong', () => {
      return baseTest()
        .post(url)
        .send({ email: testUser.email, password: 'wrongPassword' })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '아이디와 비밀번호를 확인해주세요');
        });
    });
  });
});
