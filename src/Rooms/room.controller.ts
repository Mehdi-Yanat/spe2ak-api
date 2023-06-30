import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, EditRoomDto } from './dto/room.dto';
import { interfaceRequest } from 'src/Interfaces/interface';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('')
  getAllRooms() {
    return this.roomService.getAllRooms();
  }

  @Post('create')
  create(
    @Body(new ValidationPipe()) createRoomDto: CreateRoomDto,
    @Req() req: interfaceRequest,
  ) {
    return this.roomService.create(createRoomDto, req);
  }

  @Put(':id')
  edit(
    @Body(new ValidationPipe()) editRoomDto: EditRoomDto,
    @Param() id: string,
    @Req() req: interfaceRequest,
  ) {
    return this.roomService.edit(editRoomDto, id, req);
  }

  @Delete(':id')
  delete(@Param() id: string) {
    return this.roomService.delete(id);
  }
}
