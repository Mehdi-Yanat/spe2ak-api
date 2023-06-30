import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { CreateUserDto, EditUserDto, LoginUserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { interfaceRequest } from 'src/Interfaces/interface';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  login(@Body(new ValidationPipe()) loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('create')
  create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get('user/:id')
  getUser(@Param('id', new ValidationPipe()) id: string) {
    return this.userService.getUser(id);
  }

  @Get('profile')
  getProfile(@Req() req: { user: User }) {
    return this.userService.getProfile(req.user);
  }

  @Put('edit')
  editUser(
    @Body(new ValidationPipe()) editUserDto: EditUserDto,
    @Req() req: interfaceRequest,
  ) {
    return this.userService.editUser(editUserDto, req);
  }

  @Delete('delete')
  deleteUser(@Req() req: interfaceRequest) {
    return this.userService.deleteUser(req);
  }
}
