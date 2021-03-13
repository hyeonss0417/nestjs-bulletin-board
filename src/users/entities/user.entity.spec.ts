import { User } from './user.entity';

describe('UserEntity', () => {
  let user: User;

  describe('hashPassword', () => {
    const testPassword = 'passwod123';
    it('should hash password', async () => {
      user = new User();
      user.password = testPassword;
      await user.hashPassword();
      expect(user.password).not.toEqual(testPassword);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });
  });

  describe('checkPassword', () => {
    const testPassword = 'passwod123';
    it('should be true when password is right', async () => {
      user = new User();
      user.password = testPassword;
      await user.hashPassword();
      expect(await user.checkPassword(testPassword)).toBe(true);
    });
    it('should be false when password is wrong', async () => {
      user = new User();
      user.password = testPassword;
      await user.hashPassword();
      expect(await user.checkPassword('wrongPassword')).toBe(false);
    });
  });
});
