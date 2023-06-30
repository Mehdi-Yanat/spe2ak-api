import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { isJWT } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { User } from 'src/Users/user.schema';

interface AuthRequest extends Request {
  user?: User;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization;

      if (!isJWT(token)) {
        throw new HttpException(
          'Token Not Valid'.toLocaleUpperCase(),
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { id } = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });

      if (!id) {
        throw new HttpException(
          'Invalid Token'.toLocaleUpperCase(),
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userModel.findById(id);

      if (!user) {
        throw new HttpException(
          'User Not Found'.toLocaleUpperCase(),
          HttpStatus.UNAUTHORIZED,
        );
      }

      req.user = user.toObject();
      next();
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized'.toLocaleUpperCase(),
        error: error.message || 'Invalid token',
      });
    }
  }
}
