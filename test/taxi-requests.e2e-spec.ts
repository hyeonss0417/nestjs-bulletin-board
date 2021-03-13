import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { TaxiRequestStatus } from '../src/taxi-requests/entities/taxi-request.entity';

const driverUser = {
  id: undefined,
  email: 'driver@dramancompany.com',
  password: 'string',
  userType: 'driver',
  token: undefined,
};

const passengerUser = {
  id: undefined,
  email: 'passenger@dramancompany.com',
  password: 'string',
  userType: 'passenger',
  token: undefined,
};

const testAddress = '서울특별시 강남구 테헤란로 79길 6';

describe('Taxi Requests (e2e)', () => {
  let app: INestApplication;
  let taxiRequestId: number;

  const baseTest = () => request(app.getHttpServer());

  const signUp = user =>
    baseTest()
      .post('/users/sign-up')
      .send(user)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        user.id = res.body.id;
      });

  const signIn = user =>
    baseTest()
      .post('/users/sign-in')
      .send(user)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('accessToken');
        user.token = 'Token ' + res.body.accessToken;
      });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    await Promise.all([signUp(driverUser), signUp(passengerUser)]);
    await Promise.all([signIn(driverUser), signIn(passengerUser)]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('passenger - request taxiRequest', () => {
    const url = '/taxi-requests';
    const request = (token: string, address: string) =>
      baseTest()
        .post(url)
        .set('Authorization', token)
        .send({ address });

    it('should request taxiRequest', () => {
      return request(passengerUser.token, testAddress)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('address', testAddress);
          expect(res.body).toHaveProperty('passengerId', passengerUser.id);
          expect(res.body).toHaveProperty('status', TaxiRequestStatus.StandBy);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          taxiRequestId = res.body.id;
        });
    });
    it('should fail if the length of address is over 100', () => {
      return request(passengerUser.token, 'veryLongAddress'.repeat(10))
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '주소는 100자 이하로 입력해주세요');
        });
    });
    it('should fail if the token is not valid', () => {
      return request('wrongToken', testAddress)
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });
    it('should fail if non-passenger requests', () => {
      return request(driverUser.token, testAddress)
        .expect(403)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '승객만 배차 요청할 수 있습니다');
        });
    });
    it('should fail if the existing request is not accepted', () => {
      return request(passengerUser.token, testAddress)
        .expect(409)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '아직 대기중인 배차 요청이 있습니다');
        });
    });
  });

  describe('view taxiRequests', () => {
    const url = '/taxi-requests';
    const request = token =>
      baseTest()
        .get(url)
        .set('Authorization', token)
        .send();
    it('should return all requests if a driver views', () => {
      return request(driverUser.token).expect(res => {
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toBeGreaterThan(0);
      });
    });
    it(`should return the passenger's requests if a passenger views`, () => {
      return request(passengerUser.token).expect(res => {
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toBeGreaterThan(0);
      });
    });
  });

  describe('driver - accept taxiRequest', () => {
    const url = id => `/taxi-requests/${id}/accept`;
    const request = (token: string, id: number) =>
      baseTest()
        .post(url(id))
        .set('Authorization', token)
        .send();

    it('should accept taxiRequest', () => {
      return request(driverUser.token, taxiRequestId).expect(res => {
        expect(res.body).toHaveProperty('id', taxiRequestId);
        expect(res.body).toHaveProperty('address', testAddress);
        expect(res.body).toHaveProperty('driverId', driverUser.id);
        expect(res.body).toHaveProperty('passengerId', passengerUser.id);
        expect(res.body).toHaveProperty('acceptedAt');
        expect(res.body).toHaveProperty('createdAt');
        expect(res.body).toHaveProperty('updatedAt');
      });
    });
    it('should fail if the token is not valid', () => {
      return request('wrongToken', taxiRequestId)
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });
    it('should fail if non-driver requests', () => {
      return request(passengerUser.token, taxiRequestId)
        .expect(403)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '기사만 배차 요청을 수락할 수 있습니다');
        });
    });
    it('should fail if non-driver requests', () => {
      return request(driverUser.token, -1)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 배차 요청입니다');
        });
    });
    it('should fail if the existing request is not accepted', () => {
      return request(driverUser.token, taxiRequestId)
        .expect(409)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            '수락할 수 없는 배차 요청입니다. 다른 배차 요청을 선택하세요',
          );
        });
    });
  });
});
