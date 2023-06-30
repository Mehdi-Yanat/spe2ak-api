import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/user.dto';
import { User } from './user.schema';

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  describe('login', () => {
    it('should login the user or show incorrect', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'test',
        email: loginUserDto.email,
        password: loginUserDto.password,
      };

      const mockUserModel = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };

      const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('mockToken'),
      };
    });
  });
});
