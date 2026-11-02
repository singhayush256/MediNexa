import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { WardService } from './ward.service';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateWardDto } from './dto/update-ward.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode, WardStatus } from '@medinexa/types';

@Controller('wards')
export class WardController {
  constructor(private readonly wardService: WardService) {}

  @Get()
  async getWards(
    @Query('facilityId') facilityId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: WardStatus,
    @Request() req?: any,
  ) {
    return this.wardService.getWards({ facilityId, departmentId, status }, req?.user);
  }

  @Get(':id/capacity')
  async getWardCapacity(@Param('id') id: string) {
    return this.wardService.getWardCapacity(id);
  }

  @Get(':id')
  async getWardById(@Param('id') id: string) {
    return this.wardService.getWardById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Post()
  async createWard(@Body() dto: CreateWardDto, @Request() req: any) {
    return this.wardService.createWard(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN)
  @Patch(':id')
  async updateWard(
    @Param('id') id: string,
    @Body() dto: UpdateWardDto,
    @Request() req: any,
  ) {
    return this.wardService.updateWard(id, dto, req.user);
  }
}
