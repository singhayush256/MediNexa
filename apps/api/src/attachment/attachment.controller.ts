import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentService } from './attachment.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('attachments/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @UploadedFile() file: any,
    @Body() dto: UploadAttachmentDto,
    @Req() req: any,
  ) {
    return this.attachmentService.uploadAttachment(file, dto, req.user);
  }

  @Get('attachments')
  async getAttachments(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.attachmentService.getAttachments(req.user, category, patientId);
  }

  @Get('patients/:id/attachments')
  async getPatientAttachments(
    @Param('id') patientId: string,
    @Req() req: any,
  ) {
    return this.attachmentService.getPatientAttachments(patientId, req.user);
  }

  @Get('attachments/:id')
  async getAttachmentById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.attachmentService.getAttachmentById(id, req.user);
  }

  @Get('attachments/:id/download')
  async downloadAttachment(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const fileStream = await this.attachmentService.getFileStream(id, req.user);
    res.setHeader('Content-Type', fileStream.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileStream.fileName}"`);
    res.send(fileStream.buffer);
  }

  @Delete('attachments/:id')
  async deleteAttachment(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.attachmentService.deleteAttachment(id, req.user);
  }
}
