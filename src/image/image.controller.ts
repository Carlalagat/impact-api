import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from '../dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('products/:productId/images')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AdminRole.SUPERADMIN, AdminRole.STAFF)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  addImage(@Param('productId') productId: string, @Body() dto: CreateImageDto) {
    return this.imageService.addImageToProduct(productId, dto);
  }

  @Delete(':imageId')
  removeImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.imageService.removeImage(productId, imageId);
  }
}
