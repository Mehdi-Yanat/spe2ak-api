import mongoose, { Model, Types } from 'mongoose';
import { HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { CreateUserDto, EditUserDto, LoginUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { interfaceRequest } from 'src/Interfaces/interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const isEmailAlreadyExist = await this.userModel.findOne({
      email: createUserDto.email,
    });

    const isUserNameAlreadyExist = await this.userModel.findOne({
      username: createUserDto.username,
    });

    if (isEmailAlreadyExist) {
      throw new HttpException('Email is already exist', HttpStatus.FORBIDDEN);
    }

    if (isUserNameAlreadyExist) {
      throw new HttpException(
        'Username is already exist',
        HttpStatus.FORBIDDEN,
      );
    }

    const hash = await bcrypt.hash(createUserDto.password, 10);

    //const hashedPassword = await crypto.Hash(createUserDto.password, 10);

    const create = await this.userModel.create({
      email: createUserDto.email,
      password: hash,
      username: createUserDto.username,
    });

    if (create) {
      throw new HttpException(
        'Account created successfully!',
        HttpStatus.CREATED,
      );
    } else {
      throw new HttpException('Something wrong', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({
      email,
    });

    if (!user) {
      throw new HttpException(
        "Email doesn't exist create account",
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    // ----------------------------- login
    if (passwordMatched) {
      const token: string = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '3d' },
      );
      if (user.tokens.length) {
        const pushToken: string[] = user.tokens;
        pushToken.push(token);

        await this.userModel.findByIdAndUpdate(user._id, {
          tokens: pushToken,
        });
      } else {
        await this.userModel.findByIdAndUpdate(user._id, {
          tokens: [token],
        });
      }

      throw new HttpException(
        { statusCode: 200, message: 'Login successfully !', token },
        HttpStatus.ACCEPTED,
      );
    } else {
      throw new HttpException('Incorrect credentials!', HttpStatus.FORBIDDEN);
    }
  }

  async getUser(id) {
    try {
      const objectId = new Types.ObjectId(id);
      const user = await this.userModel.findById(objectId);

      if (!user) {
        throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
      }

      const { tokens, ...userData } = user.toObject();
      return { message: 'AUTHORIZED', data: userData };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
  }

  async getProfile(user) {
    try {
      if (Object.keys(user).length === 0) {
        throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
      } else {
        const { tokens, ...userData } = user;

        throw new HttpException(
          { message: 'AUTHORIZED', user: userData },
          HttpStatus.ACCEPTED,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
  }

  async editUser(editUserDto: EditUserDto, req: interfaceRequest) {
    try {
      const userId = req.user._id; // Get the id from req.user
      const password = req.user.password;

      if (!userId) {
        throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
      }

      const isUserNameExist = await this.userModel.findOne({
        username: editUserDto.username,
      });

      const passwordMatched = await bcrypt.compare(
        editUserDto.password,
        password,
      );

      const isEmailExist = await this.userModel.findOne({
        email: editUserDto.email,
      });

      if (isUserNameExist) {
        throw new HttpException('Username already taken', HttpStatus.FORBIDDEN);
      }

      if (isEmailExist) {
        throw new HttpException('Email already taken', HttpStatus.FORBIDDEN);
      }

      const hash = await bcrypt.hash(editUserDto.password, 10);

      const user = await this.userModel.findByIdAndUpdate(
        userId,
        passwordMatched
          ? {
              email: editUserDto.email,
              username: editUserDto.username,
            }
          : {
              email: editUserDto.email,
              username: editUserDto.username,
              password: hash,
            },
        {
          new: true,
        },
      );

      if (!user) {
        throw new HttpException("User doesn't exist", HttpStatus.NOT_FOUND);
      }

      const { tokens, ...userData } = user.toObject();
      return { message: 'User updated successfully!', data: userData };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(req: interfaceRequest) {
    try {
      const userId = req.user._id;

      const deletedUser = await this.userModel.findByIdAndDelete(userId);

      if (deletedUser) {
        throw new HttpException(
          'User deleted successfully!',
          HttpStatus.ACCEPTED,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
  }
}
