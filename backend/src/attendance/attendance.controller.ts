import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AttendanceService } from './attendance.service.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PHOTO_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Photo must be an image file'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  checkIn(
    @Body() dto: CheckInDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.attendanceService.checkIn(dto, photo);
  }

  @Post('check-out')
  checkOut(@Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(dto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.attendanceService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Get(':id/photo-url')
  async getPhotoUrl(@Param('id', ParseUUIDPipe) id: string) {
    return { url: await this.attendanceService.getPhotoUrl(id) };
  }
}
