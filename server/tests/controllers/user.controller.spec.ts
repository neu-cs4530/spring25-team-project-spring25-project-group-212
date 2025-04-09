import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/user.service';
import * as userController from '../../controllers/user.controller';
import { SafeDatabaseUser, User } from '../../types/types';

const mockUser: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  savedQuestions: [],
};

const mockSafeUser: SafeDatabaseUser = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  savedQuestions: [],
};

const mockUserJSONResponse = {
  _id: mockSafeUser._id.toString(),
  username: 'user1',
  dateJoined: new Date('2024-12-03').toISOString(),
  savedQuestions: [],
};

const saveUserSpy = jest.spyOn(util, 'saveUser');
const loginUserSpy = jest.spyOn(util, 'loginUser');
const updatedUserSpy = jest.spyOn(util, 'updateUser');
const getUserByUsernameSpy = jest.spyOn(util, 'getUserByUsername');
const getUsersListSpy = jest.spyOn(util, 'getUsersList');
const deleteUserByUsernameSpy = jest.spyOn(util, 'deleteUserByUsername');
const updateUserSpy = jest.spyOn(util, 'updateUser');
const isUpdateEmailBodyValidSpy = jest.spyOn(userController, 'isUpdateEmailBodyValid');

describe('Test userController', () => {
  describe('POST /signup', () => {
    it('should create a new user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
        biography: 'This is a test biography',
        savedQuestions: [],
      };

      saveUserSpy.mockResolvedValueOnce({ ...mockSafeUser, biography: mockReqBody.biography });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse, biography: mockReqBody.biography });
      expect(saveUserSpy).toHaveBeenCalledWith({
        ...mockReqBody,
        biography: mockReqBody.biography,
        dateJoined: expect.any(Date),
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      saveUserSpy.mockResolvedValueOnce({ error: 'Error saving user' });

      const response = await supertest(app).post('/user/signup').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should succesfully login for a user given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(loginUserSpy).toHaveBeenCalledWith(mockReqBody);
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: mockUser.password,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while saving', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: mockUser.password,
      };

      loginUserSpy.mockResolvedValueOnce({ error: 'Error authenticating user' });

      const response = await supertest(app).post('/user/login').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /resetPassword', () => {
    it('should succesfully return updated user object given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockUserJSONResponse });
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, { password: 'newPassword' });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        password: 'newPassword',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing password', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty password', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: '',
      };

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 for a database error while updating', async () => {
      const mockReqBody = {
        username: mockUser.username,
        password: 'newPassword',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/resetPassword').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getUser', () => {
    it('should return the user given correct arguments', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error finding user' });

      const response = await supertest(app).get(`/user/getUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      const response = await supertest(app).get('/user/getUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /getUsers', () => {
    it('should return the users from the database', async () => {
      getUsersListSpy.mockResolvedValueOnce([mockSafeUser]);

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockUserJSONResponse]);
      expect(getUsersListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getUsersListSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/user/getUsers`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteUser', () => {
    it('should return the deleted user given correct arguments', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(deleteUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
    });

    it('should return 500 if database error while searching username', async () => {
      deleteUserByUsernameSpy.mockResolvedValueOnce({ error: 'Error deleting user' });

      const response = await supertest(app).delete(`/user/deleteUser/${mockUser.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not provided', async () => {
      const response = await supertest(app).delete('/user/deleteUser/');
      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /updateBiography', () => {
    it('should successfully update biography given correct arguments', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'This is my new bio',
      };

      updatedUserSpy.mockResolvedValueOnce(mockSafeUser);

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserJSONResponse);
      expect(updatedUserSpy).toHaveBeenCalledWith(mockUser.username, {
        biography: 'This is my new bio',
      });
    });

    it('should return 400 for request missing username', async () => {
      const mockReqBody = {
        biography: 'some new biography',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request with empty username', async () => {
      const mockReqBody = {
        username: '',
        biography: 'a new bio',
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 400 for request missing biography field', async () => {
      const mockReqBody = {
        username: mockUser.username,
      };

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      const mockReqBody = {
        username: mockUser.username,
        biography: 'Attempting update biography',
      };

      updatedUserSpy.mockResolvedValueOnce({ error: 'Error updating user' });

      const response = await supertest(app).patch('/user/updateBiography').send(mockReqBody);

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error when updating user biography: Error: Error updating user',
      );
    });
  });

  describe('PATCH /updateEmail', () => {
    it('should return 400 when no username is provided', async () => {
      const response = await supertest(app)
        .patch('/user/updateEmail')
        .send({ email: 'test@example.com' });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid user body');
    });

    it('should return 400 for an invalid email', async () => {
      const response = await supertest(app)
        .patch('/user/updateEmail')
        .send({ username: 'alice', email: 'not-valid' });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid user body');
    });
  });

  describe('PATCH /toggleSaveQuestion', () => {
    const mockUser2: SafeDatabaseUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testUser',
      dateJoined: new Date('2024-12-03'),
      savedQuestions: [],
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should add the question ID to savedQuestions if not present', async () => {
      const questionToSave = 'q1';
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockUser2,
        savedQuestions: [],
      });
      updateUserSpy.mockResolvedValueOnce({
        ...mockUser2,
        savedQuestions: [questionToSave],
      });

      const response = await supertest(app).patch('/user/toggleSaveQuestion').send({
        username: mockUser.username,
        qid: questionToSave,
      });

      expect(response.status).toBe(200);
      expect(response.body.savedQuestions).toContain(questionToSave);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
      expect(updateUserSpy).toHaveBeenCalledWith(mockUser.username, {
        savedQuestions: [questionToSave],
      });
    });

    it('should remove the question ID from savedQuestions if already present', async () => {
      const questionToRemove = 'q2';
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockUser2,
        savedQuestions: [questionToRemove],
      });
      updateUserSpy.mockResolvedValueOnce({
        ...mockUser2,
        savedQuestions: [],
      });

      const response = await supertest(app).patch('/user/toggleSaveQuestion').send({
        username: mockUser.username,
        qid: questionToRemove,
      });

      expect(response.status).toBe(200);
      expect(response.body.savedQuestions).not.toContain(questionToRemove);
      expect(getUserByUsernameSpy).toHaveBeenCalledWith(mockUser.username);
      expect(updateUserSpy).toHaveBeenCalledWith(mockUser.username, {
        savedQuestions: [],
      });
    });

    it('should return 500 if getUserByUsername returns an error', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({ error: 'Some error' });

      const response = await supertest(app).patch('/user/toggleSaveQuestion').send({
        username: mockUser.username,
        qid: 'q1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when updating user biography');
    });

    it('should return 500 if updateUser returns an error', async () => {
      getUserByUsernameSpy.mockResolvedValueOnce({
        ...mockUser2,
        savedQuestions: [],
      });
      updateUserSpy.mockResolvedValueOnce({ error: 'DB update error' });

      const response = await supertest(app).patch('/user/toggleSaveQuestion').send({
        username: mockUser.username,
        qid: 'q1',
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when updating user biography');
    });
  });
  describe('PATCH /updateEmail', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return 400 if the request body is invalid', async () => {
      isUpdateEmailBodyValidSpy.mockReturnValueOnce(false);

      const response = await supertest(app)
        .patch('/user/updateEmail')
        .send({ username: 'testUser', email: 'invalidEmail' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid user body');
    });

    it('should return 500 if updateUser returns an error', async () => {
      isUpdateEmailBodyValidSpy.mockReturnValueOnce(true);

      updateUserSpy.mockResolvedValueOnce({ error: 'Some DB Error' });

      const response = await supertest(app)
        .patch('/user/updateEmail')
        .send({ username: 'testUser', email: 'valid@example.com' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when updating user email: Error: Some DB Error');
    });

    it('should return 500 if an unhandled error is thrown', async () => {
      isUpdateEmailBodyValidSpy.mockReturnValueOnce(true);

      updateUserSpy.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const response = await supertest(app)
        .patch('/user/updateEmail')
        .send({ username: 'testUser', email: 'valid@example.com' });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when updating user email: Error: Unexpected error');
    });
  });

  it('should return 200 with updated user object if email update is successful', async () => {
    const updatedUser = {
      ...mockSafeUser,
      email: 'updated@example.com',
    };

    updateUserSpy.mockResolvedValueOnce(updatedUser);

    const response = await supertest(app).patch('/user/updateEmail').send({
      username: updatedUser.username,
      email: updatedUser.email,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...updatedUser,
      _id: updatedUser._id.toString(),
      dateJoined: updatedUser.dateJoined.toISOString(),
    });

    expect(updateUserSpy).toHaveBeenCalledWith(updatedUser.username, {
      email: updatedUser.email,
    });
  });
});
