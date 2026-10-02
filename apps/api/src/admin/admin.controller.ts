import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleCode } from '@medinexa/types';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.HOSPITAL_ADMIN, RoleCode.MEDINEXA_ADMIN, 'ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // =========================================================================
  // 1. DASHBOARD & KPIS
  // =========================================================================
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.adminService.getDashboard(req.user);
  }

  // =========================================================================
  // 2. HOSPITAL PROFILE
  // =========================================================================
  @Get('hospital')
  async getHospitalProfile(@Req() req: any) {
    return this.adminService.getHospitalProfile(req.user);
  }

  @Patch('hospital')
  async updateHospitalProfile(@Body() body: any, @Req() req: any) {
    return this.adminService.updateHospitalProfile(req.user, body);
  }

  // =========================================================================
  // 3. DEPARTMENTS
  // =========================================================================
  @Get('departments')
  async getDepartments(@Req() req: any) {
    return this.adminService.getDepartments(req.user);
  }

  @Post('departments')
  async createDepartment(@Body() body: { name: string; code: string; status?: string }, @Req() req: any) {
    return this.adminService.createDepartment(req.user, body);
  }

  @Patch('departments/:id')
  async updateDepartment(
    @Param('id') id: string,
    @Body() body: { name?: string; code?: string; status?: string },
    @Req() req: any,
  ) {
    return this.adminService.updateDepartment(req.user, id, body);
  }

  // =========================================================================
  // 4. STAFF MANAGEMENT
  // =========================================================================
  @Get('staff')
  async getStaff(
    @Query('role') role: string,
    @Query('department') department: string,
    @Query('search') search: string,
    @Req() req: any,
  ) {
    return this.adminService.getStaff(req.user, { role, department, search });
  }

  @Post('staff')
  async createStaff(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      roleCode: string;
      department?: string;
      designation?: string;
      password?: string;
    },
    @Req() req: any,
  ) {
    return this.adminService.createStaff(req.user, body);
  }

  @Patch('staff/:id')
  async updateStaff(
    @Param('id') id: string,
    @Body() body: { status?: string; department?: string; designation?: string; roleCode?: string },
    @Req() req: any,
  ) {
    return this.adminService.updateStaff(req.user, id, body);
  }

  // =========================================================================
  // 5. MANAGERS
  // =========================================================================
  @Get('managers')
  async getManagers(@Req() req: any) {
    return this.adminService.getManagers(req.user);
  }

  @Post('managers')
  async createManager(
    @Body() body: { firstName: string; lastName: string; email: string; phone: string; department?: string },
    @Req() req: any,
  ) {
    return this.adminService.createManager(req.user, body);
  }

  // =========================================================================
  // 6. ROLES & PERMISSIONS
  // =========================================================================
  @Get('roles')
  async getRoles() {
    return this.adminService.getRolesAndPermissions();
  }

  @Get('permissions')
  async getPermissions() {
    return this.adminService.getRolesAndPermissions();
  }

  // =========================================================================
  // 7. DOCTOR ADMINISTRATION
  // =========================================================================
  @Get('doctors')
  async getDoctors(@Req() req: any) {
    return this.adminService.getDoctors(req.user);
  }

  // =========================================================================
  // 8. SHIFTS & ROSTERS
  // =========================================================================
  @Get('shifts')
  async getShifts(@Req() req: any) {
    return this.adminService.getShifts(req.user);
  }

  @Post('shifts')
  async assignShift(
    @Body() body: { employeeId: string; shiftName: string; startTime: string; endTime: string },
    @Req() req: any,
  ) {
    return this.adminService.assignShift(req.user, body);
  }

  // =========================================================================
  // 9. ASSETS & EQUIPMENT
  // =========================================================================
  @Get('assets')
  async getAssets(@Req() req: any) {
    return this.adminService.getAssets(req.user);
  }

  @Post('assets')
  async createAsset(
    @Body()
    body: {
      assetName: string;
      category: string;
      departmentId?: string;
      location?: string;
      warrantyMonths?: number;
      maintenanceFrequency?: string;
      purchaseCost?: number;
    },
    @Req() req: any,
  ) {
    return this.adminService.createAsset(req.user, body);
  }

  @Patch('assets/:id')
  async updateAsset(
    @Param('id') id: string,
    @Body() body: { status?: 'ACTIVE' | 'UNDER_MAINTENANCE' | 'RETIRED'; currentLocation?: string },
    @Req() req: any,
  ) {
    return this.adminService.updateAsset(req.user, id, body);
  }

  // =========================================================================
  // 10. UNIFIED SCOPED SEARCH
  // =========================================================================
  @Get('search')
  async search(@Query('q') q: string, @Req() req: any) {
    return this.adminService.search(req.user, q);
  }

  // =========================================================================
  // 11. AUDIT LOGS
  // =========================================================================
  @Get('audit')
  async getAuditLogs(@Req() req: any) {
    return this.adminService.getAuditLogs(req.user);
  }
}
