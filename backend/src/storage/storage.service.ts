import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService implements OnModuleInit {
  private client: SupabaseClient;
  private bucket: string;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.client = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    this.bucket = this.config.get<string>(
      'SUPABASE_STORAGE_BUCKET',
      'attendance-photos',
    );

    const { data, error } = await this.client.storage.getBucket(this.bucket);
    if (error || !data) {
      throw new Error(
        `Supabase Storage bucket "${this.bucket}" is not reachable, check SUPABASE_URL, ` +
          `SUPABASE_SERVICE_ROLE_KEY, and that the bucket exists. (${error?.message})`,
      );
    }
  }

  async uploadCheckInPhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const path = `${userId}/${Date.now()}-${file.originalname}`;
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file.buffer, { contentType: file.mimetype });
    if (error) throw error;
    return path;
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  }
}
