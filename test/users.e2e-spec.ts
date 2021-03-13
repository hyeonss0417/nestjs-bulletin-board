import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Post } from '../src/posts/entities/post.entity';
import { ApiTest } from './common/test.common';
import { CreateUserDTO } from '../src/users/dto/create-user.input';
import { LoginUserDTO } from '../src/users/dto/login-user.dto';

const testUser = {
  email: 'test1@test.com',
  password: 'string',
};

const testUser2 = {
  email: 'test2@test.com',
  password: 'string',
};

describe('Users (e2e)', () => {
  let app: INestApplication;
  let apiTest: ApiTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    apiTest = new ApiTest(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('sign-up', () => {
    const url = '/users';
    const operation = 'signUp';
    const request = user => apiTest.post(url, user);
    const gqlRequest = (user: CreateUserDTO) =>
      apiTest.gqlMutation({
        operation,
        variables: { input: { type: 'CreateUserDTO!', value: user } },
        fields: ['email', 'id', 'createdAt', 'updatedAt'],
      });
    const isValid = data => {
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    };

    it('should create account', () => {
      return request(testUser)
        .expect(201)
        .expect(res => isValid(res.body));
    });

    it('should create account (GraphQL)', () => {
      return gqlRequest(testUser2).expect(res => isValid(res.body.data[operation]));
    });

    it('should fail if email is wrong', () => {
      return request({ ...testUser, email: 'wrongEmail' })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '올바른 이메일을 입력해주세요');
        });
    });
    it('should fail if email already registered', () => {
      return request(testUser)
        .expect(409)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '이미 가입된 이메일입니다');
        });
    });
  });

  describe('sign-in', () => {
    const url = '/users/sign-in';
    const operation = 'signIn';
    const request = user => apiTest.post(url, user);
    const gqlRequest = (user: LoginUserDTO) =>
      apiTest.gqlMutation({
        operation,
        variables: { input: { type: 'LoginUserDTO!', value: user } },
        fields: ['accessToken'],
      });
    const isValid = data => {
      const JWTRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      expect(data).toHaveProperty('accessToken');
      expect(data.accessToken).toMatch(JWTRegex); // JWT regex
    };

    it('should log user in', () => {
      return request(testUser)
        .expect(200)
        .expect(res => isValid(res.body));
    });
    it('should log user in (GraphQL)', () => {
      return gqlRequest(testUser).expect(res => isValid(res.body.data[operation]));
    });
    it('should fail if user does not exist', () => {
      return request({ email: 'nope@nope.com', password: testUser.password })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '아이디와 비밀번호를 확인해주세요');
        });
    });
    it('should fail if password is wrong', () => {
      return request({ email: testUser.email, password: 'wrongPassword' })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '아이디와 비밀번호를 확인해주세요');
        });
    });
  });

  describe('getUsers', () => {
    const url = '/users';
    const operation = 'users';
    const request = () => apiTest.get(url);
    const gqlRequest = () =>
      apiTest.gqlQuery({
        operation,
        fields: ['email', 'id', 'createdAt', 'updatedAt'],
      });
    const isValid = data => {
      expect(data).toEqual(expect.any(Array));
      const users = data as User[];
      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
      });
    };

    it('should reponse all users', () => {
      request()
        .expect(200)
        .expect(res => isValid(res.body));
    });
    it('should reponse all users (GraphQL)', () => {
      gqlRequest().expect(res => isValid(res.body.data[operation]));
    });
  });

  describe('getUser', () => {
    const url = id => `/users/${id}`;
    const operation = 'user';
    const request = id => apiTest.get(url(id));
    const gqlRequest = (id: number) =>
      apiTest.gqlQuery({
        operation,
        variables: { id: { type: 'Int!', value: id } },
        fields: ['email', 'id', 'createdAt', 'updatedAt'],
      });
    const userId = 1;
    const isValid = data => {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
    };

    it('should reponse a user', () => {
      return request(userId)
        .expect(200)
        .expect(res => isValid(res.body));
    });
    it('should reponse a user (GraphQL)', () => {
      return gqlRequest(userId).expect(res => isValid(res.body.data[operation]));
    });
    it('should fail if user id is invalid', () => {
      return request(-1)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 유저입니다');
        });
    });
  });

  describe('getPostsByUser', () => {
    const url = id => `/users/${id}/posts`;
    const operation = 'user';
    const request = id => apiTest.get(url(id));
    const gqlRequest = id =>
      apiTest.gqlQuery({
        operation,
        variables: { id: { type: 'Int!', value: id } },
        fields: [{ posts: ['id', 'writerId', 'title', 'content', 'createdAt', 'updatedAt'] }],
      });
    const userId = 1;
    const isValid = data => {
      expect(data).toEqual(expect.any(Array));
      const posts = data as Post[];
      posts.forEach(post => {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('writerId');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('createdAt');
        expect(post).toHaveProperty('updatedAt');
      });
    };

    it(`should reponse the user's posts`, () => {
      return request(userId)
        .expect(200)
        .expect(res => isValid(res.body));
    });
    it(`should reponse the user's posts (GraphQL)`, () => {
      return gqlRequest(userId).expect(res => isValid(res.body.data[operation].posts));
    });
    it('should fail if user id is invalid', () => {
      return request(-1)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 유저입니다');
        });
    });
  });

  describe('getCommentsByUser', () => {
    const url = id => `/users/${id}/comments`;
    const operation = 'user';
    const request = id => apiTest.get(url(id));
    const gqlRequest = id =>
      apiTest.gqlQuery({
        operation,
        variables: { id: { type: 'Int!', value: id } },
        fields: [{ comments: ['id', 'writerId', 'postId', 'content', 'createdAt', 'updatedAt'] }],
      });
    const userId = 1;
    const isValid = data => {
      expect(data).toEqual(expect.any(Array));
      const comments = data as Comment[];
      comments.forEach(comment => {
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('writerId');
        expect(comment).toHaveProperty('postId');
        expect(comment).toHaveProperty('content');
        expect(comment).toHaveProperty('createdAt');
        expect(comment).toHaveProperty('updatedAt');
      });
    };

    it(`should reponse the user's comments`, () => {
      return request(userId)
        .expect(200)
        .expect(res => isValid(res.body));
    });
    it(`should reponse the user's comments (GraphQL)`, () => {
      return gqlRequest(userId).expect(res => res.body.data[operation].comments);
    });
    it('should fail if user id is invalid', () => {
      return request(-1)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 유저입니다');
        });
    });
  });
});
