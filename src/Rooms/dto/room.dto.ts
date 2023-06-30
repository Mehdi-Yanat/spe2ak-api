import { IsString, MinLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  roomName: string;

  @MinLength(3)
  @IsString()
  roomLanguage: string;

  @IsString()
  roomTopic: string;

  @IsString()
  roomPassword: string;
}

export class EditRoomDto {
  @IsString()
  @MinLength(3)
  roomName: string;

  @MinLength(3)
  @IsString()
  roomLanguage: string;

  @IsString()
  roomTopic: string;

  @IsString()
  @MinLength(4)
  roomPassword: string;

  @IsString()
  roomRole: string;
}
