import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { AuthMiddleware } from 'src/Middlewares/auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/users/:id', method: RequestMethod.GET },
        { path: '/users/profile', method: RequestMethod.GET },
        { path: '/users/edit', method: RequestMethod.PUT },
        { path: '/users/delete', method: RequestMethod.DELETE },
      );
  }
}
