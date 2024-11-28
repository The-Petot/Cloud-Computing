import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';


const app = new Elysia()
.use(swagger({
  documentation: {
    info: {
      title: 'Mindcraft API',
      description: 'This is the API documentation for Mindcraft',
      version: '1.0.0',
    },
  }
}))
.group('/api/v1/auth', (auth) => {
  auth
    .post('/login', () => {}, {
      detail: {}
    })
    .post('/register', () => {}, {
      detail: {}
    })
    .post('/logout', () => {}, {
      detail: {}
    })
    .post('/refresh', () => {}, {
      detail: {}
    })
    .put('/two-factor', () => {}, {
      detail: {}
    })
  return auth;
})
.group('/api/v1/users', (users) => {
  users
    .get('/', () => {}, {
      detail: {}
    })
    .get('/:userId', () => {}, {
      detail: {}
    })
    .get('/:userId/challenges', () => {}, {
      detail: {}
    })
    .get('/:userId/participations', () => {}, {
      detail: {}
    })
    .post('/', () => {}, {
      detail: {}
    })
    .put('/:userId', () => {}, {
      detail: {}
    })
  return users;
})
.group('/api/v1/challenges', (challenges) => {
  challenges
    .get('/', () => {}, {
      detail: {}
    })
    .get('/:challengeId', () => {}, {
      detail: {}
    })
    .get('/:challengeId/participants', () => {}, {
      detail: {}
    })
    .post('/', () => {}, {
      detail: {}
    })
    .put('/:challengeId', () => {}, {
      detail: {}
    })
  return challenges;
})
.group('/api/v1/participations', (participations) => {
  participations
    .get('/', () => {}, {
      detail: {}
    })
    .get('/:participationId', () => {}, {
      detail: {}
    })
    .post('/', () => {}, {
      detail: {}
    })
  return participations;
})
.listen(8080, () => {
  console.log('Server is running on port 8080');
})