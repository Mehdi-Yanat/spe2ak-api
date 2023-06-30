import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './room.schema';
import { Model, Types } from 'mongoose';
import { CreateRoomDto, EditRoomDto } from './dto/room.dto';
import { interfaceRequest } from 'src/Interfaces/interface';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/Users/user.schema';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getAllRooms() {
    try {
      const room = await this.roomModel.find();

      if (!room)
        throw new HttpException('Something is wrong', HttpStatus.BAD_REQUEST);
      else {
        throw new HttpException(
          {
            message: '',
            data: room,
          },
          HttpStatus.FOUND,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async create(createRoomDto: CreateRoomDto, req: interfaceRequest) {
    try {
      const user = req.user;

      const isRoomNameExist = await this.roomModel.findOne({
        roomName: createRoomDto.roomName,
      });

      if (isRoomNameExist)
        throw new HttpException(
          'Room name already exist try other one! ',
          HttpStatus.FORBIDDEN,
        );

      const room = await this.roomModel.create({
        ...createRoomDto,
        roomOwner: [
          {
            ownerId: user._id,
            role: 'owner',
          },
        ],
      });

      if (!room)
        throw new HttpException('Something is wrong', HttpStatus.BAD_REQUEST);
      else {
        throw new HttpException(
          {
            message: 'Room created!',
            data: room,
          },
          HttpStatus.CREATED,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async edit(editRoomDto: EditRoomDto, id: string, req: interfaceRequest) {
    try {
      const objectId = new Types.ObjectId(id);
      const ownerId = req.user._id;

      const room = await this.roomModel.findById(objectId);

      const isRoomNameExist = await this.roomModel.findOne({
        roomName: editRoomDto.roomName,
      });

      if (isRoomNameExist) {
        throw new HttpException(
          'Room name already exist try other one! ',
          HttpStatus.FORBIDDEN,
        );
      }

      const changeRole = room.roomOwner.find(
        (el) => el.ownerId.toString() === ownerId.toString(),
      );

      changeRole.role = editRoomDto.roomRole;

      const updateRoleArray = room.roomOwner.filter(
        (el) => el.ownerId.toString() !== ownerId.toString(),
      );

      updateRoleArray.push(changeRole);

      await this.roomModel.findByIdAndUpdate(objectId, {
        ...editRoomDto,
        roomOwner: updateRoleArray,
      });

      throw new HttpException(
        {
          message: 'Room information was changed successfully!',
          data: room,
        },
        HttpStatus.ACCEPTED,
      );
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const objectId = new Types.ObjectId(id);

      const room = await this.roomModel.findById(objectId);

      if (!room)
        throw new HttpException('Room not found!', HttpStatus.NOT_FOUND);

      await this.roomModel.findByIdAndDelete(room._id);

      throw new HttpException(
        {
          message: 'Room deleted!',
          data: room,
        },
        HttpStatus.ACCEPTED,
      );
    } catch (error) {
      throw error;
    }
  }

  async authenticate(token: string): Promise<User> {
    try {
      const { id } = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });

      if (!id) {
        throw new WsException('Invalid token !');
      }

      const user = await this.userModel.findById(id);

      if (!user) {
        throw new WsException('User not found!');
      }

      return user;
    } catch (error) {
      throw new WsException('Invalid credentials.');
    }
  }
}
