import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsOptional, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lng?: number;
}
