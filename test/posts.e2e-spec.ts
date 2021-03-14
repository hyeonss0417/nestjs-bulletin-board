import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import {
  ApiTest,
  createTestUserAndGetToken,
  isArrayOf,
  isComment,
  isPost,
} from './common/test.common';
import { CreatePostDto } from '../src/posts/dto/create-post.dto';
import { UpdatePostDto } from '../src/posts/dto/update-post.input';
import { CreateCommentDTO } from '../src/posts/dto/create-comment.input';
import { UpdateCommentDTO } from '../src/posts/dto/update-comment.input';

const testPost = {
  title: 'test post',
  content: 'this is a post',
};

describe('Posts (e2e)', () => {
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

  let userToken, otherUserToken;
  it('create test account', async () => {
    const user = await createTestUserAndGetToken(apiTest);
    userToken = user.token;
    const otherUser = await createTestUserAndGetToken(apiTest);
    otherUserToken = otherUser.token;
  });

  describe('createPost', () => {
    const url = '/posts';
    const operation = 'createPost';
    const request = (post, token) => apiTest.postPrivate(url, token, post);
    const gqlRequest = (post: CreatePostDto) =>
      apiTest.gqlMutationPrivate(
        {
          operation,
          variables: { input: { type: 'CreatePostDto!', value: post } },
          fields: ['id', 'writerId', 'title', 'content', 'createdAt', 'updatedAt'],
        },
        userToken,
      );

    it('should create post', () => {
      return request(testPost, userToken)
        .expect(201)
        .expect(res => isPost(res.body));
    });

    it('should create post (GraphQL)', () => {
      return gqlRequest(testPost).expect(res => isPost(res.body.data[operation]));
    });

    it('should fail if title is empty', () => {
      return request({ title: '', content: testPost.content }, userToken)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '제목은 1자 이상 100자 이하로 입력해주세요');
        });
    });

    it('should fail if token is invalid', () => {
      return request({ title: '', content: testPost.content }, 'invalidToken')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });
  });

  describe('getPosts', () => {
    const url = '/posts';
    const operation = 'posts';
    const request = () => apiTest.get(url);
    const gqlRequest = () =>
      apiTest.gqlQuery({
        operation,
        fields: ['id', 'writerId', 'title', 'content', 'createdAt', 'updatedAt'],
      });
    const isValid = data => isArrayOf(data, isPost);

    it('should reponse all posts', () => {
      return request()
        .expect(200)
        .expect(res => isValid(res.body));
    });

    it('should reponse all posts (GraphQL)', () => {
      return gqlRequest().expect(res => isValid(res.body.data[operation]));
    });
  });

  describe('getPost', () => {
    const url = id => `/posts/${id}`;
    const operation = 'post';
    const request = id => apiTest.get(url(id));
    const gqlRequest = (id: number) =>
      apiTest.gqlQuery({
        operation,
        variables: { id: { type: 'Int!', value: id } },
        fields: ['id', 'writerId', 'title', 'content', 'createdAt', 'updatedAt'],
      });
    const postId = 1;

    it('should reponse a post', () => {
      return request(postId)
        .expect(200)
        .expect(res => isPost(res.body));
    });
    it('should reponse a post (GraphQL)', () => {
      return gqlRequest(postId).expect(res => isPost(res.body.data[operation]));
    });
    it('should fail if post id is invalid', () => {
      return request(-1)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 게시글입니다');
        });
    });
  });

  describe('updatePost', () => {
    const url = (id: number) => `/posts/${id}`;
    const operation = 'updatePost';
    const request = (id, post: UpdatePostDto, token) => apiTest.patchPrivate(url(id), token, post);
    const gqlRequest = (id: number, post: UpdatePostDto) =>
      apiTest.gqlStringPrivate(
        `mutation {
          updatePost(id:${id}, input: {title:"${post.title}", content:"${post.content}"}) {
            id, writerId, title, content, createdAt, updatedAt
          }
        }`,
        userToken,
      );
    const postId = 1;
    it('should update post', () => {
      return request(postId, { title: 'updated title', content: 'updated content' }, userToken)
        .expect(200)
        .expect(res => isPost(res.body));
    });

    it('should update post (GraphQL)', () => {
      return gqlRequest(postId, {
        title: 'updated title',
        content: 'updated content',
      }).expect(res => isPost(res.body.data[operation]));
    });

    it('should fail if title is empty', () => {
      return request(postId, { title: '', content: testPost.content }, userToken)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '제목은 1자 이상 100자 이하로 입력해주세요');
        });
    });

    it('should fail if token is invalid', () => {
      return request(postId, { title: '', content: testPost.content }, 'invalidToken')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });

    it('should fail if post id is invalid', () => {
      return request(
        -1,
        {
          title: 'updated title',
          content: 'updated content',
        },
        userToken,
      )
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 게시글입니다');
        });
    });
  });

  describe('createComment', () => {
    const url = id => `/posts/${id}/comments`;
    const operation = 'createComment';
    const request = (id: number, comment: CreateCommentDTO, token: string) =>
      apiTest.postPrivate(url(id), token, comment);
    const gqlRequest = (postId: number, comment: CreateCommentDTO) =>
      apiTest.gqlStringPrivate(
        `mutation {
          createComment(postId:${postId}, input:{content: "${comment.content}"}) {
            id, writerId, postId, content, createdAt, updatedAt
          }
        }`,
        userToken,
      );

    const postId = 1;
    it('should create comment', () => {
      return request(postId, { content: 'new comment' }, userToken)
        .expect(201)
        .expect(res => isComment(res.body));
    });

    it('should create post (GraphQL)', () => {
      return gqlRequest(postId, { content: 'new comment' }).expect(res =>
        isComment(res.body.data[operation]),
      );
    });

    it('should fail if content is empty', () => {
      return request(postId, { content: '' }, userToken)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '댓글은 1자 이상 1000자 이하로 입력해주세요');
        });
    });

    it('should fail if token is invalid', () => {
      return request(postId, { content: 'new comment' }, 'invalidToken')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });

    it('should fail if post id is invalid', () => {
      return request(-1, { content: 'new comment' }, userToken)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 게시글입니다');
        });
    });
  });

  describe('updateComment', () => {
    const url = commentId => `/posts/0/comments/${commentId}`;
    const operation = 'updateComment';
    const request = (commentId: number, comment: UpdateCommentDTO, token: string) =>
      apiTest.patchPrivate(url(commentId), token, comment);
    const gqlRequest = (commentId: number, comment: UpdateCommentDTO) =>
      apiTest.gqlStringPrivate(
        `mutation {
          updateComment(commentId:${commentId}, input:{content: "${comment.content}"}) {
            id, writerId, postId, content, createdAt, updatedAt
          }
        }`,
        userToken,
      );

    const commentId = 1;
    it('should update comment', () => {
      return request(commentId, { content: 'updated content' }, userToken)
        .expect(200)
        .expect(res => isComment(res.body));
    });

    it('should update comment (GraphQL)', () => {
      return gqlRequest(commentId, { content: 'updated content' }).expect(res =>
        isComment(res.body.data[operation]),
      );
    });

    it('should fail if content is empty', () => {
      return request(commentId, { content: '' }, userToken)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '댓글은 1자 이상 1000자 이하로 입력해주세요');
        });
    });

    it('should fail if non-writer edit comment', () => {
      return request(commentId, { content: 'new comment' }, otherUserToken)
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '댓글 작성자만 수정할 수 있습니다');
        });
    });

    it('should fail if comment id is invalid', () => {
      return request(
        -1,
        {
          content: 'updated content',
        },
        userToken,
      )
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 댓글입니다');
        });
    });
  });

  describe('getCommentsByPost', () => {
    const url = id => `/posts/${id}/comments?page=1&pageSize=10`;
    const operation = 'post';
    const request = id => apiTest.get(url(id));
    const gqlRequest = id =>
      apiTest.gqlString(
        `{
          post(id: ${id}) {
            comments(input: {page:1, pageSize:10}) {
              id, writerId, postId, content, createdAt, updatedAt
            }
          }
        }`,
      );
    const postId = 1;
    const isValid = data => isArrayOf(data, isComment);

    it(`should reponse the post's comments`, () => {
      return request(postId)
        .expect(200)
        .expect(res => isValid(res.body));
    });

    it(`should reponse the post's comments (GraphQL)`, () => {
      return gqlRequest(postId).expect(res => res.body.data[operation].comments);
    });

    it('should fail if post id is invalid', () => {
      return request(-1)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 게시글입니다');
        });
    });
  });

  describe('deleteComment', () => {
    const url = commentId => `/posts/0/comments/${commentId}`;
    const operation = 'deleteComment';
    const request = (commentId: number, token: string) =>
      apiTest.deletePrivate(url(commentId), token);
    const gqlRequest = (commentId: number) =>
      apiTest.gqlStringPrivate(
        `mutation {
          deleteComment(commentId:${commentId})
        }`,
        userToken,
      );

    const commentId = 1;
    it('should delete comment', () => {
      return request(commentId, userToken).expect(200);
    });

    it('should delete comment (GraphQL)', () => {
      return gqlRequest(commentId + 1).expect(res => expect(res.body.data[operation]).toBe(true));
    });

    it('should fail if token is invalid', () => {
      return request(commentId, 'invalidToken')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });

    it('should fail if comment id is invalid', () => {
      return request(-1, userToken)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 댓글입니다');
        });
    });
  });

  describe('deletePost', () => {
    const url = id => `/posts/${id}`;
    const operation = 'deletePost';
    const request = (id: number, token: string) => apiTest.deletePrivate(url(id), token);
    const gqlRequest = (id: number) =>
      apiTest.gqlStringPrivate(
        `mutation {
          deletePost(id:${id})
        }`,
        userToken,
      );

    const postId = 1;
    it('should delete post', () => {
      return request(postId, userToken).expect(200);
    });

    it('should delete post (GraphQL)', () => {
      return gqlRequest(postId + 1).expect(res => expect(res.body.data[operation]).toBe(true));
    });

    it('should fail if token is invalid', () => {
      return request(postId, 'invalidToken')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '로그인이 필요합니다');
        });
    });

    it('should fail if post id is invalid', () => {
      return request(-1, userToken)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', '존재하지 않는 게시글입니다');
        });
    });
  });
});
