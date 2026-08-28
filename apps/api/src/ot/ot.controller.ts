import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OtService } from './ot.service';
import { CreateOtRoomDto } from './dto/create-ot-room.dto';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryStatusDto } from './dto/update-surgery-status.dto';
import { SurgicalChecklistDto } from './dto/surgical-checklist.dto';
import { AnesthesiaRecordDto } from './dto/anesthesia-record.dto';
import { ImplantUsageDto } from './dto/implant-usage.dto';
import { PostOpNoteDto } from './dto/post-op-note.dto';

@Controller('ot')
export class OtController {
  constructor(private readonly otService: OtService) {}

  // --- OT ROOMS ---
  @UseGuards(JwtAuthGuard)
  @Get('rooms')
  async getRooms(@Req() req: any) {
    return this.otService.getRooms(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms')
  async createRoom(@Body() dto: CreateOtRoomDto, @Req() req: any) {
    return this.otService.createRoom(dto, req.user);
  }

  // --- SURGERIES ---
  @UseGuards(JwtAuthGuard)
  @Get('surgeries')
  async getSurgeries(@Req() req: any) {
    return this.otService.getSurgeries(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('surgeries')
  async scheduleSurgery(@Body() dto: CreateSurgeryDto, @Req() req: any) {
    return this.otService.scheduleSurgery(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('surgeries/:id/status')
  async updateSurgeryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSurgeryStatusDto,
    @Req() req: any,
  ) {
    return this.otService.updateSurgeryStatus(id, dto, req.user);
  }

  // --- CHECKLIST ---
  @UseGuards(JwtAuthGuard)
  @Get('checklist/:surgeryId')
  async getChecklist(@Param('surgeryId') surgeryId: string, @Req() req: any) {
    return this.otService.getChecklist(surgeryId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checklist')
  async recordChecklist(@Body() dto: SurgicalChecklistDto, @Req() req: any) {
    return this.otService.recordChecklist(dto, req.user);
  }

  // --- ANESTHESIA ---
  @UseGuards(JwtAuthGuard)
  @Get('anesthesia/:surgeryId')
  async getAnesthesiaRecords(@Param('surgeryId') surgeryId: string, @Req() req: any) {
    return this.otService.getAnesthesiaRecords(surgeryId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('anesthesia')
  async recordAnesthesia(@Body() dto: AnesthesiaRecordDto, @Req() req: any) {
    return this.otService.recordAnesthesia(dto, req.user);
  }

  // --- IMPLANTS ---
  @UseGuards(JwtAuthGuard)
  @Get('implants/:surgeryId')
  async getImplants(@Param('surgeryId') surgeryId: string, @Req() req: any) {
    return this.otService.getImplants(surgeryId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('implants')
  async recordImplant(@Body() dto: ImplantUsageDto, @Req() req: any) {
    return this.otService.recordImplant(dto, req.user);
  }

  // --- POST-OP NOTES ---
  @UseGuards(JwtAuthGuard)
  @Get('post-op/:surgeryId')
  async getPostOpNotes(@Param('surgeryId') surgeryId: string, @Req() req: any) {
    return this.otService.getPostOpNotes(surgeryId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('post-op')
  async recordPostOpNote(@Body() dto: PostOpNoteDto, @Req() req: any) {
    return this.otService.recordPostOpNote(dto, req.user);
  }

  // --- ANALYTICS ---
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.otService.getAnalytics(req.user);
  }
}
