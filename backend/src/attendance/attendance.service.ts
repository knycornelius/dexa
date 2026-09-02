import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service.js';
import { UsersService } from '../users/users.service.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { CheckOutDto } from './dto/check-out.dto.js';
import {
  AttendanceRecord,
  AttendanceStatus,
} from './entities/attendance-record.entity.js';

const TIMEZONE = process.env.ATTENDANCE_TIMEZONE ?? 'Asia/Jakarta';
const CUTOFF_HOUR = Number(process.env.ATTENDANCE_CUTOFF_HOUR ?? 9);

function officeDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function officeHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hour: get('hour'), minute: get('minute') };
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  async checkIn(
    dto: CheckInDto,
    photo?: Express.Multer.File,
  ): Promise<AttendanceRecord> {
    if (!photo)
      throw new BadRequestException('A photo is required to check in');
    await this.usersService.findOne(dto.userId);

    const now = new Date();
    const workDate = officeDateString(now);

    const existing = await this.attendanceRepository.findOne({
      where: { userId: dto.userId, workDate },
    });
    if (existing) throw new ConflictException('Already checked in today');

    const photoPath = await this.storageService.uploadCheckInPhoto(
      dto.userId,
      photo,
    );
    const { hour, minute } = officeHourMinute(now);
    const status =
      hour > CUTOFF_HOUR || (hour === CUTOFF_HOUR && minute > 0)
        ? AttendanceStatus.LATE
        : AttendanceStatus.ON_TIME;

    const record = this.attendanceRepository.create({
      userId: dto.userId,
      workDate,
      checkInAt: now,
      checkInPhotoPath: photoPath,
      checkInLat: dto.lat,
      checkInLng: dto.lng,
      status,
    });
    return this.attendanceRepository.save(record);
  }

  async checkOut(dto: CheckOutDto): Promise<AttendanceRecord> {
    const workDate = officeDateString(new Date());
    const record = await this.attendanceRepository.findOne({
      where: { userId: dto.userId, workDate },
    });
    if (!record)
      throw new NotFoundException(
        'No check-in found for today — check in first',
      );
    if (record.checkOutAt)
      throw new ConflictException('Already checked out today');

    record.checkOutAt = new Date();
    return this.attendanceRepository.save(record);
  }

  findAll(userId?: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepository.find({
      where: userId ? { userId } : {},
      order: { workDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRepository.findOne({ where: { id } });
    if (!record)
      throw new NotFoundException(`Attendance record ${id} not found`);
    return record;
  }

  async getPhotoUrl(id: string): Promise<string> {
    const record = await this.findOne(id);
    if (!record.checkInPhotoPath)
      throw new NotFoundException('This record has no photo');
    return this.storageService.getSignedUrl(record.checkInPhotoPath);
  }
}
