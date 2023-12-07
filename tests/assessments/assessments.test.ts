import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { makeServer } from '../../src/app';
import { userRepository } from '../../src/modules/accounts/repositories';

import { cleanupDp } from '../_utils';
import { addUsers, users } from '../_utils/users';
import { expectAuthError, generateToken } from '../_utils/auth';
import { UserAccountStatus, UserRoles } from '../../src/shared/types';

import { addAssessments } from '../_utils/assessments';

const { SECURITY_ADMIN, USER } = UserRoles;
const { BLOCKED, DELETED } = UserAccountStatus;

let api: request.SuperTest<request.Test>, server: any;

const BASE_URL = '/api/v1/assessments';

describe('Assessments', () => {
  beforeAll(() => {
    server = makeServer();
    api = request(server);
  });

  afterAll(async () => {
    await server?.close();
  });

  beforeEach(async () => {
    await addUsers();
    await addAssessments();
  });

  afterEach(async () => await cleanupDp());

  describe('GET /assessments/', () => {
    let token = '';
    let assessment_id = '';
    const user = users.SECURITY_ADMIN;
    let url_assessment = `${BASE_URL}/assessment`;

    beforeEach(async () => {
      token = generateToken({ user });
    });

    it('should return all assessments', async () => {
      let { body, status } = await api.get(`${BASE_URL}/`);

      let { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();
    });
  });

  describe('GET /assessments/assessment/:id', () => {
    let token = '';
    let assessment_id = '';
    const user = users.SECURITY_ADMIN;
    let url_assessment = `${BASE_URL}/assessment`;

    beforeEach(async () => {
      token = generateToken({ user });

      const { body, status } = await api
        .post(url_assessment)
        .field(
          'description',
          'This is a random assessment that has no questions.',
        )
        .field('title', 'Random Assessment')
        .attach('image', './tests/assets/spongeGovID.png')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');
      assessment_id = body.data._id;

      let input = {
        questionText: 'What do you think about Naruto?',
        answerType: 'mcq',
        options: ['Horrible', 'Bad', 'Ok', 'Good', 'Great'],
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      await api.post(url).set('Authorization', `Bearer ${token}`).send(input);
    });

    it('should allow retrieval of an assessment and the questions upon correct call', async () => {
      let url = `${BASE_URL}/assessment/${assessment_id}`;
      const { body, status } = await api.get(url);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();
    });
  });

  describe('GET /assessments/published', () => {
    let token = '';
    const user = users.SECURITY_ADMIN;

    beforeEach(async () => {
      token = generateToken({ user });
    });

    it('should return all assessments that are published', async () => {
      let { body, status } = await api.get(`${BASE_URL}/published`);

      let { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();
    });
  });

  describe('POST /assessments/assessment', () => {
    let token = '';

    const user = users.SECURITY_ADMIN;
    let url = `${BASE_URL}/assessment`;

    beforeEach(() => {
      token = generateToken({ user });
    });

    it('should allow creation of an assessment with correct information provided', async () => {
      const { body, status } = await api
        .post(url)
        .field(
          'description',
          'This is a random assessment that has no questions.',
        )
        .field('title', 'Random Assessment')
        .attach('image', './tests/assets/spongeGovID.png')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject({
        description: 'This is a random assessment that has no questions.',
        title: 'Random Assessment',
      });
    });

    it('should reject creation of an assessment if no title is provided (Too short)', async () => {
      const { body, status } = await api
        .post(url)
        .field(
          'description',
          'This is a random assessment that has no questions.',
        )
        .field('title', '')
        .attach('image', './tests/assets/spongeGovID.png')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.payload.title.reasons).toMatchObject(['Too short']);
    });
  });

  describe('POST /assessments/question/:id', () => {
    let token = '';
    let assessment_id = '';
    const user = users.SECURITY_ADMIN;
    let url_assessment = `${BASE_URL}/assessment`;

    beforeEach(async () => {
      token = generateToken({ user });

      const { body } = await api
        .post(url_assessment)
        .field(
          'description',
          'This is a random assessment that has no questions.',
        )
        .field('title', 'Random Assessment')
        .attach('image', './tests/assets/spongeGovID.png')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');
      assessment_id = body.data._id;
    });

    it('should allow creation of question with type "free" when correct information provided', async () => {
      let input = {
        questionText: 'What do you think about Naruto?',
        answerType: 'free',
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(input);
    });

    it('should allow creation of question with type "mcq" when correct information provided', async () => {
      let input = {
        questionText: 'What do you think about Naruto?',
        answerType: 'mcq',
        options: ['Horrible', 'Bad', 'Ok', 'Good', 'Great'],
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(input);
    });

    it('should allow creation of question with type "tf" when correct information provided', async () => {
      let input = {
        questionText: 'Naruto is a bad Anime.',
        answerType: 'tf',
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject({
        ...input,
        options: ['true', 'false'],
      });
    });

    it('should allow creation of question with type "scale" when correct information provided', async () => {
      let input = {
        questionText: 'Rate Naruto 1-10:', // Note!! If you add a space at the end, the test will fail
        answerType: 'scale',
        startNumber: 1,
        endNumber: 10,
        step: 1,
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data).toMatchObject(input);
    });

    it('should error when given assessment id does not exist', async () => {
      let input = {
        questionText: 'Rate Naruto 1-10:', // Note!! If you add a space at the end, the test will fail
        answerType: 'scale',
        startNumber: 1,
        endNumber: 10,
        step: 1,
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/1234`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toMatch('Assessment ID could not be found!');
    });

    it('should error when "mcq" is given no options', async () => {
      let input = {
        questionText: 'What do you think about Naruto?',
        answerType: 'mcq',
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toMatch('mcq question has no options!');
    });

    it('should error when "scale" is not given "startNumber"', async () => {
      let input = {
        questionText: 'Rate Naruto 1-10:', // Note!! If you add a space at the end, the test will fail
        answerType: 'scale',
        endNumber: 10,
        step: 1,
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toMatch('No startNumber provided');
    });

    it('should error when "scale" is not given "endNumber"', async () => {
      let input = {
        questionText: 'Rate Naruto 1-10:', // Note!! If you add a space at the end, the test will fail
        answerType: 'scale',
        startNumber: 1,
        step: 1,
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toMatch('No endNumber provided');
    });

    it('should error when "scale" is not given "startNumber"', async () => {
      let input = {
        questionText: 'Rate Naruto 1-10:', // Note!! If you add a space at the end, the test will fail
        answerType: 'scale',
        startNumber: 1,
        endNumber: 10,
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      const { body, status } = await api
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send(input);

      const { data, error } = body;

      expect(status).toBe(400);

      expect(data).toBeUndefined();

      expect(error.message).toMatch('No step provided');
    });
  });

  describe('POST /assessments/publish/:id', () => {
    let token = '';
    const user = users.SECURITY_ADMIN;

    beforeEach(async () => {
      token = generateToken({ user });
    });

    it('should allow retrieval of an assessment and the questions upon correct call', async () => {
      await api.post(`${BASE_URL}/publish/1`);

      let { body, status } = await api.get(`${BASE_URL}/assessment/1`);

      let { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data.assessment.published).toBe(true);
    });
  });

  describe('PATCH /assessments/assessment/:id', () => {
    let token = '';
    let assessment_id = '';
    const user = users.SECURITY_ADMIN;
    let url_assessment = `${BASE_URL}/assessment`;

    beforeEach(async () => {
      token = generateToken({ user });

      const { body, status } = await api
        .post(url_assessment)
        .field(
          'description',
          'This is a random assessment that has no questions.',
        )
        .field('title', 'Random Assessment')
        .attach('image', './tests/assets/spongeGovID.png')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');
      assessment_id = body.data._id;

      let input = {
        questionText: 'What do you think about Naruto?',
        answerType: 'mcq',
        options: ['Horrible', 'Bad', 'Ok', 'Good', 'Great'],
        assessment: assessment_id,
      };

      let url = `${BASE_URL}/question/${assessment_id}`;
      await api.post(url).set('Authorization', `Bearer ${token}`).send(input);
    });

    it('should allow retrieval of an assessment and the questions upon correct call', async () => {
      let url = `${BASE_URL}/assessment/${assessment_id}`;
      const { body, status } = await api
        .patch(url)
        .field('description', 'This description has been changed')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'multipart/form-data');

      const { data, error } = body;

      expect(status).toBe(200);

      expect(error).toBeUndefined();

      expect(data.modifiedCount).toBe(1);
    });
  });
});
