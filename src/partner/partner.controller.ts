import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // The main JWT guard
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UpdatePartnerDto } from '../dto';

// Use the AuthGuard to protect all endpoints in this controller.
// This ensures that only users with a valid JWT (i.e., logged-in admins)
// can access these routes.
@UseGuards(AuthGuard('jwt'))
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnersService: PartnerService) {}

  @Post()
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    // ParseUUIDPipe automatically validates that the 'id' parameter is a valid UUID.
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.remove(id);
  }
}
