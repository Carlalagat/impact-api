import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from '../dto';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async addImageToProduct(productId: string, dto: CreateImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.image.create({
      data: { ...dto, productId },
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image || image.productId !== productId) {
      throw new NotFoundException('Image not found for this product');
    }

    return this.prisma.image.delete({ where: { id: imageId } });
  }
}
