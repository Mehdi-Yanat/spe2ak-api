import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './room.schema';
import { AuthMiddleware } from 'src/Middlewares/auth.middleware';
import { User, UserSchema } from 'src/Users/user.schema';
import { WebsocketGateway } from './chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [RoomService, WebsocketGateway],
  controllers: [RoomController],
})
export class RoomModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/rooms/create', method: RequestMethod.POST },
        { path: '/rooms/:id', method: RequestMethod.PUT },
        { path: '/rooms/:id', method: RequestMethod.DELETE },
        { path: '/rooms', method: RequestMethod.GET },
      );
  }
}
