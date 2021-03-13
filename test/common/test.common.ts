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
  setToken(test: request.Test, token: String) {
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
