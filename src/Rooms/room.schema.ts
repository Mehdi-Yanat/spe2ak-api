import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema()
export class Room {
  @Prop({ unique: true, required: true })
  roomName: string;

  @Prop({ required: true })
  roomLanguage: string;

  @Prop()
  roomTopic: string;

  @Prop()
  roomPassword: string;

  @Prop()
  roomOwner: [{ ownerId: string; role: string }];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
