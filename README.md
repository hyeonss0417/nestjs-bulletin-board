# Bulletin Board API

Bulletin board REST/GraphQL API with NestJS + TypeORM + GraphQL

## Tech Stack

- NestJS
- TypeScript
- TypeORM
- SQLite3
- GraphQL
- Docker
- PM2

## API Specification

GraphQL Endpoint: `http://${hostname}:3000/graphql/`

### User

1. 모든 유저 정보 조회 (Public)

   - REST: `GET http://${hostname}:3000/users/`
   - GraphQL: `Query users`
   - Reponses: `200 OK`

2. 특정 유저 정보 조회 (Public)

   - REST: `GET http://${hostname}:3000/users/${id}`
   - GraphQL: `Query user(id)`
   - Reponses: `200 OK`, `404 Not Found`

3. 특정 유저의 게시물 조회 (Public)

   - REST: `GET http://${hostname}:3000/users/${id}/posts`
   - GraphQL: `Query user(id) { posts }`
   - Reponses: `200 OK`, `404 Not Found`

4. 특정 유저의 댓글 조회 (Public)

   - REST: `GET http://${hostname}:3000/users/${id}/comments`
   - GraphQL: `Query user(id) { comments }`
   - Reponses: `200 OK`, `404 Not Found`

5. 계정 생성 (Public)

   - REST: `POST http://${hostname}:3000/users/`
   - GraphQL: `Mutation signUp(input)`
   - Reponses: `201 Created`, `400 Bad Request`, `409 Conflict`

6. 로그인 (Public)

   - REST: `POST http://${hostname}:3000/users/sign-in`
   - GraphQL: `Mutation signIn(input)`
   - Reponses: `200 OK`, `400 Bad Request`

### Post

1. 모든 게시물 정보 조회 (Public)

   - REST: `GET http://${hostname}:3000/posts/`
   - GraphQL: `Query posts`
   - Reponses: `200 OK`

2. 특정 게시물 정보 조회 (Public)

   - REST: `GET http://${hostname}:3000/posts/${id}`
   - GraphQL: `Query user(id)`
   - Reponses: `200 OK`, `404 Not Found`

3. 특정 게시물의 댓글 조회 (Public)

   - REST: `GET http://${hostname}:3000/posts/${id}/comments`
   - GraphQL: `Query user(id) { posts }`
   - Reponses: `200 OK`, `404 Not Found`

4. 게시물 작성 (Authentication)

   - REST: `POST http://${hostname}:3000/posts/`
   - GraphQL: `Mutation createPost(input)`
   - Reponses: `201 Created`, `400 Bad Request`, `401 Unauthorized`

5. 게시물 수정 (Authentication)

   - REST: `PATCH http://${hostname}:3000/posts/${id}`
   - GraphQL: `Mutation updatePost(id, input)`
   - Reponses: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

6. 게시물 삭제 (Authentication)

   - REST: `DELETE http://${hostname}:3000/posts/${id}`
   - GraphQL: `Mutation deletePost(id)`
   - Reponses: `200 OK`, `401 Unauthorized`, `404 Not Found`

7. 댓글 작성 (Authentication)

   - REST: `POST http://${hostname}:3000/posts/${postId}/comments`
   - GraphQL: `Mutation createComment(input)`
   - Reponses: `201 Created`, `400 Bad Request`, `401 Unauthorized`

8. 댓글 수정 (Authentication)

   - REST: `PATCH http://${hostname}:3000/posts/${postId}/comments/${id}`
   - GraphQL: `Mutation updateComment(id, input)`
   - Reponses: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

9. 댓글 삭제 (Authentication)

   - REST: `DELETE http://${hostname}:3000/posts/${postId}/comments/${id}`
   - GraphQL: `Mutation deleteComment(id, input)`
   - Reponses: `200 OK`, `401 Unauthorized`, `404 Not Found`

## 실행 방법

### 도커환경 (배포모드)

```bash
$ docker build -t ${imageName} .
$ docker run -it --name ${containerName} -p ${port}:3000 ${imageName}
```

### Node.js 환경

1. 설치

```bash
$ npm install
```

2. 실행 (개발모드 / 배포모드)

```bash
# development (watch mode)
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod

# production mode pm2 버전 (성능 향상과 무중단 배포를 위해 cluster mode 사용)
$ npm install -g pm2
$ pm2-runtime start ecosystem.config.js
```

## 데이터베이스 스키마

- User: `src/users/entities/user.entity.ts`

- Post: `src/posts/entities/post.entity.ts`

- Comment: `src/posts/entities/comment.entity.ts`

- Database 위치: `data/db.*.sqlite`

## 테스트

### 테스트 실행 방법

```bash
# e2e tests
$ npm run test:e2e

# test coverage (e2e) -> /coverage-e2e 폴더 생성
$ npm run test:cov

# unit tests
$ npm run test
```

### e2e 테스트 결과

테스트 파일: `test/*.e2e-spec.ts`

```bash
PASS  test/users.e2e-spec.ts (10.422 s)
PASS  test/posts.e2e-spec.ts (15.787 s)

Test Suites: 2 passed, 2 total
Tests:       55 passed, 55 total
Snapshots:   0 total
Time:        16.433 s, estimated 32 s
```

커버리지: `/coverage-e2e/lcov-report/index.html` 파일에서 확인 가능

- 96.07% Statements 465/484
- 82.35% Branches 28/34
- 93.41% Functions 156/167
- 95.87% Lines 418/436

### unit 테스트 결과

테스트 파일: `src/**/entities/*.entity.spec.ts`

```bash
 PASS  src/users/entities/user.entity.spec.ts (10.496 s)
  UserEntity
    hashPassword
      ✓ should hash password (94 ms)
    checkPassword
      ✓ should be true when password is right (141 ms)
      ✓ should be false when password is wrong (140 ms)
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        10.666 s
```

## 환경설정

- DB 및 PORT 관련 설정은 .env.dev, .env.prod, .env.test 파일에서 가능
- `src/app.module.ts` 에서 Config 및 ORM 설정 가능
