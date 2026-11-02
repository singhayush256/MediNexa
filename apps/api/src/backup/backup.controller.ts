import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';

@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'SUPER_ADMIN')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createBackup(@Body('type') type?: 'DAILY' | 'WEEKLY' | 'MANUAL') {
    return this.backupService.createBackup(type || 'MANUAL');
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async getBackups() {
    return this.backupService.getBackups();
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  async downloadBackup(@Param('id') id: string) {
    return this.backupService.getBackupDownload(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restoreBackup(@Param('id') id: string) {
    return this.backupService.restoreBackup(id);
  }
}
