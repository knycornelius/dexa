import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum AttendanceStatus {
  ON_TIME = 'ON_TIME',
  LATE = 'LATE',
}

@Entity('attendance_records')
@Index(['userId', 'workDate'], { unique: true })
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'work_date', type: 'date' })
  workDate: string;

  @Column({ name: 'check_in_at', type: 'timestamptz', nullable: true })
  checkInAt: Date | null;

  @Column({ name: 'check_out_at', type: 'timestamptz', nullable: true })
  checkOutAt: Date | null;

  @Column({ name: 'check_in_photo_path', type: 'text', nullable: true })
  checkInPhotoPath: string | null;

  @Column({ name: 'check_in_lat', type: 'double precision', nullable: true })
  checkInLat: number | null;

  @Column({ name: 'check_in_lng', type: 'double precision', nullable: true })
  checkInLng: number | null;

  @Column({ type: 'enum', enum: AttendanceStatus, nullable: true })
  status: AttendanceStatus | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
