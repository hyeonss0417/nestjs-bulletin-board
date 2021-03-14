import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import * as gqlBuilder from 'gql-query-builder';
import IQueryBuilderOptions from 'gql-query-builder/build/IQueryBuilderOptions';

const GRAPHQL_ENDPOINT = '/graphql';

export class ApiTest {
  app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  base() {
    return request(this.app.getHttpServer());
  }

  get(url: string) {
    return this.base()
      .get(url)
      .send();
  }

  post(url: string, body?: Object) {
    return this.base()
      .post(url)
      .send(body);
  }

  put(url: string, body?: Object) {
    return this.base()
      .put(url)
      .send(body);
  }

  patch(url: string, body?: Object) {
    return this.base()
      .patch(url)
      .send(body);
  }

  delete(url: string, body?: Object) {
    return this.base()
      .delete(url)
      .send(body);
  }

  gqlString(query: string) {
    return this.post(GRAPHQL_ENDPOINT, { query }).expect(res =>
      expect(res.body.errors).toBeUndefined(),
    );
  }

  gqlQuery(query: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    return this.post(GRAPHQL_ENDPOINT, gqlBuilder.query(query)).expect(res =>
      expect(res.body.errors).toBeUndefined(),
    );
  }

  gqlMutation(query: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    return this.post(GRAPHQL_ENDPOINT, gqlBuilder.mutation(query)).expect(res =>
      expect(res.body.errors).toBeUndefined(),
    );
  }

  gqlSubscription(query: IQueryBuilderOptions | IQueryBuilderOptions[]) {
    return this.post(GRAPHQL_ENDPOINT, gqlBuilder.subscription(query)).expect(res =>
      expect(res.body.errors).toBeUndefined(),
    );
  }

  // ========== Private Request ==========
  setToken(test: request.Test, token: string) {
    return test.set('Authorization', 'Bearer ' + token);
  }

  getPrivate(url: string, token: string) {
    return this.base()
      .get(url)
      .send();
  }

  postPrivate(url: string, token: string, body?: Object) {
    return this.setToken(this.base().post(url), token).send(body);
  }

  putPrivate(url: string, token: string, body?: Object) {
    return this.setToken(this.base().put(url), token).send(body);
  }

  patchPrivate(url: string, token: string, body?: Object) {
    return this.setToken(this.base().patch(url), token).send(body);
  }

  deletePrivate(url: string, token: string, body?: Object) {
    return this.setToken(this.base().delete(url), token).send(body);
  }

  gqlStringPrivate(query: string, token: string) {
    return this.setToken(this.base().post(GRAPHQL_ENDPOINT), token)
      .send({ query })
      .expect(res => expect(res.body.errors).toBeUndefined());
  }

  gqlQueryPrivate(query: IQueryBuilderOptions | IQueryBuilderOptions[], token: string) {
    return this.setToken(this.base().post(GRAPHQL_ENDPOINT), token)
      .send(gqlBuilder.query(query))
      .expect(res => expect(res.body.errors).toBeUndefined());
  }

  gqlMutationPrivate(query: IQueryBuilderOptions | IQueryBuilderOptions[], token: string) {
    return this.setToken(this.base().post(GRAPHQL_ENDPOINT), token)
      .send(gqlBuilder.mutation(query))
      .expect(res => expect(res.body.errors).toBeUndefined());
  }

  gqlSubscriptionPrivate(query: IQueryBuilderOptions | IQueryBuilderOptions[], token: string) {
    return this.setToken(this.base().post(GRAPHQL_ENDPOINT), token)
      .send(gqlBuilder.subscription(query))
      .expect(res => expect(res.body.errors).toBeUndefined());
  }
}

export const isPost = data => {
  expect(data).toHaveProperty('id');
  expect(data).toHaveProperty('writerId');
  expect(data).toHaveProperty('title');
  expect(data).toHaveProperty('content');
  expect(data).toHaveProperty('createdAt');
  expect(data).toHaveProperty('updatedAt');
};

export const isUser = data => {
  expect(data).toHaveProperty('email');
  expect(data).toHaveProperty('id');
  expect(data).toHaveProperty('createdAt');
  expect(data).toHaveProperty('updatedAt');
};

export const isComment = comment => {
  expect(comment).toHaveProperty('id');
  expect(comment).toHaveProperty('writerId');
  expect(comment).toHaveProperty('postId');
  expect(comment).toHaveProperty('content');
  expect(comment).toHaveProperty('createdAt');
  expect(comment).toHaveProperty('updatedAt');
};

export const isArrayOf = (data, callback: (t: any) => any) => {
  expect(data).toEqual(expect.any(Array));
  const comments = data as Comment[];
  comments.forEach(callback);
};

export async function createTestUserAndGetToken(api: ApiTest) {
  let id, token;
  const testUser = {
    email: `${Math.random()
      .toString(36)
      .substr(2, 11)}@test.com`,
    password: 'password',
  };

  await api
    .post('/users', testUser)
    .expect(201)
    .expect(res => {
      expect(res.body).toHaveProperty('id');
      id = res.body.id;
    });

  await api
    .post('/users/sign-in', testUser)
    .expect(200)
    .expect(res => {
      expect(res.body).toHaveProperty('accessToken');
      token = res.body.accessToken;
    });

  return { id, token };
}
