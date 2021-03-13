# 택시 배차 앱 API

## 기술스택

- NestJS
- TypeScript
- TypeORM
- SQLite3
- Docker
- PM2

## 라우팅

- `POST http://${hostname}:3000/users/sign-up`
- `POST http://${hostname}:3000/users/sign-in`
- `GET http://${hostname}:3000/taxi-requests/`
- `POST http://${hostname}:3000/taxi-requests/{taxiRequestId}/accept`

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

Entity -> Table 생성 시

```mysql
CREATE TABLE "user" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "email" varchar NOT NULL, "password" varchar NOT NULL,
    "userType" varchar NOT NULL,
    "verified" boolean NOT NULL DEFAULT (0),
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
    )
```

- TaxiRequest: `src/taxi-requests/entities/taxi-request.entity.ts`

Entity -> Table 생성 시

```mysql
CREATE TABLE "taxi_request" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "address" varchar NOT NULL,
    "status" varchar NOT NULL,
    "driverId" integer,
    "passengerId" integer,
    "acceptedAt" datetime,
    "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
    "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
    )
```

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
Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        19.832 s
```

커버리지: `/coverage-e2e/lcov-report/index.html` 파일에서 확인 가능

- 96.14% Statements 224/233
- 88.1% Branches 37/42
- 95% Functions 38/40
- 97.03% Lines 196/202

### unit 테스트 결과

테스트 파일: `src/**/entities/*.entity.spec.ts`

```bash
Test Suites: 2 passed, 2 total
Tests: 6 passed, 6 total
Snapshots: 0 total
Time: 7.596 s, estimated 16 s
```

커버리지: `/coverage/lcov-report/index.html` 파일에서 확인 가능

- 90% Statements 54/60
- 87.5% Branches 7/8
- 75% Functions 6/8
- 89.29% Lines 50/56

## 환경설정

- DB 및 PORT 관련 설정은 .env.dev, .env.prod, .env.test 파일에서 가능
- `src/app.module.ts` 에서 Config 및 ORM 설정 가능
