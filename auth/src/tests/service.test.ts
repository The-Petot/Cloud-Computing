import { describe, expect, test } from 'bun:test';
import userService from '../services/auth.service';
import { isServiceMethodSuccess } from '../libs';
import { User } from '../types/global.types';

describe('User Service', () => {
  // create
  // getTotalUsers
  // getUserByEmai1
  // getUserById
  // toggleTwoFactorAuth
  // updateGoog1eUser
  // upsert
  test('create should fail to create an already existing user', async () => {
    const createResult = await userService.create({
      email: 'email@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      profileImgUrl: 'http://example.com/profile.jpg',
    });
    if (isServiceMethodSuccess<User>(createResult)) {
      const duplicateCreateResult = await userService.create({
        email: 'email@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        profileImgUrl: 'http://example.com/profile.jpg',
      });
      if (!isServiceMethodSuccess<User>(duplicateCreateResult)) {
        expect(duplicateCreateResult).toHaveProperty('errors');
        expect(duplicateCreateResult.errors[0].messages[0]).toBe(
          'User already exists'
        );
      }
    }
  });

  test('getTotalUsers should return total number of users', async () => {
    const totalUsers = await userService.getTotalUsers();
    if (isServiceMethodSuccess<{ totalUser: number }>(totalUsers)) {
      expect(totalUsers.data.totalUser).toBeGreaterThan(0);
    }
  });

  test('getUserByEmail should return a user', async () => {
    const user = await userService.getUserByEmail('email@example.com');
    if (isServiceMethodSuccess<User>(user)) {
      expect(user.data.firstName).toBe('John');
      expect(user.data.lastName).toBe('Doe');
    }
  });

  test('getUserById should return a user', async () => {
    const createResult = await userService.create({
      email: `email${Math.random().toString(36).substring(2, 12)}@example.com`,
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      profileImgUrl: 'http://example.com/profile.jpg',
    });

    if (isServiceMethodSuccess<User>(createResult)) {
      const user = await userService.getUserById(createResult.data.id!);
      if (isServiceMethodSuccess<User>(user)) {
        expect(user.data.firstName).toBe('John');
        expect(user.data.lastName).toBe('Doe');
      }
    }
  });

  test('toggleTwoFactorAuth should toggle two factor auth', async () => {
    const createResult = await userService.create({
      email: `email${Math.random().toString(36).substring(2, 12)}@example.com`,
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      profileImgUrl: 'http://example.com/profile.jpg',
    });
    if (isServiceMethodSuccess<User>(createResult)) {
      const user = await userService.toggleTwoFactorAuth(
        createResult.data.id!,
        true
      );
      if (isServiceMethodSuccess<{ userId: number }>(user)) {
        const updatedUser = await userService.getUserById(user.data.userId);
        if (isServiceMethodSuccess<User>(updatedUser)) {
          expect(updatedUser.data.twoFactorEnabled).toBe(true);
        }
      }
    }
  });

  test('updateGoogleUser should update a Google user', async () => {
    const user = await userService.updateGoogleUser({
      given_name: 'New',
      family_name: 'Doe',
    });
    if (isServiceMethodSuccess<User>(user)) {
      expect(user.data.firstName).toBe('New');
    }
  });

  test('upsert should insert a user if not exists', async () => {
    const user = await userService.upsert({
      email: 'upsert@example.com',
      firstName: 'upsert',
      lastName: 'user',
      profileImgUrl: 'http://example.com/profile.jpg',
      currentRank: 1,
      totalScore: 100,
      twoFactorEnabled: false,
      notificationEnabled: true,
    });
    if (isServiceMethodSuccess<User>(user)) {
      expect(user.data.firstName).toBe('upsert');
    }
  });

  test('upsert should update a user if exists', async () => {
    const user = await userService.upsert({
      email: 'upsert@example.com',
      firstName: 'new',
      lastName: 'user',
      profileImgUrl: 'http://example.com/profile.jpg',
      currentRank: 1,
      totalScore: 100,
      twoFactorEnabled: false,
      notificationEnabled: true,
    });

    if (isServiceMethodSuccess<User>(user)) {
      expect(user.data.firstName).toBe('new');
    }
  })
});
