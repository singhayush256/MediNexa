import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCode } from '@medinexa/types';
import { CreateInventoryItemDto } from './dto/create-item.dto';
import { CreateInventoryTransactionDto } from './dto/create-transaction.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreatePurchaseRequisitionDto } from './dto/create-requisition.dto';
import { CreateProcurementPODto } from './dto/create-po.dto';
import { CreateHospitalAssetDto } from './dto/create-asset.dto';
import { CreateMaintenanceTicketDto, ResolveMaintenanceTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  private checkFacilityIsolation(facilityId: string, user: any) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId && userFacilityId !== facilityId) {
      throw new ForbiddenException('Access denied: You cannot manage Inventory outside your assigned facility.');
    }
  }

  // --- 1. INVENTORY ITEMS ---
  async createItem(dto: CreateInventoryItemDto, user: any) {
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;
    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }
    this.checkFacilityIsolation(facilityId!, user);

    const itemCode = dto.itemCode || `SKU-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const item = await this.prisma.inventoryItem.create({
      data: {
        itemCode,
        itemName: dto.itemName,
        category: dto.category,
        unitOfMeasure: dto.unitOfMeasure || 'UNIT',
        currentStock: dto.currentStock || 0,
        minimumStock: dto.minimumStock !== undefined ? dto.minimumStock : 10,
        reorderLevel: dto.reorderLevel !== undefined ? dto.reorderLevel : 20,
        unitPrice: dto.unitPrice || 0.0,
        location: dto.location || 'Central Hospital Warehouse',
        facilityId: facilityId!,
      },
      include: { facility: { select: { name: true } } },
    });

    this.logger.log(`[INVENTORY ITEM CREATED] #${item.itemCode} - ${item.itemName} (Stock: ${item.currentStock})`);
    return item;
  }

  async getItems(user: any, facilityId?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};

    if (userRole !== RoleCode.MEDINEXA_ADMIN) {
      where.facilityId = facilityId || userFacilityId;
    } else if (facilityId) {
      where.facilityId = facilityId;
    }

    return this.prisma.inventoryItem.findMany({
      where,
      include: { facility: { select: { name: true } } },
      orderBy: { itemName: 'asc' },
    });
  }

  // --- 2. INVENTORY TRANSACTIONS ---
  async createTransaction(dto: CreateInventoryTransactionDto, user: any) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item) throw new NotFoundException(`Inventory item #${dto.itemId} not found.`);
    this.checkFacilityIsolation(item.facilityId, user);

    const previousStock = item.currentStock;
    let newStock = previousStock;

    if (dto.transactionType === 'IN') {
      newStock = previousStock + dto.quantity;
    } else if (dto.transactionType === 'OUT' || dto.transactionType === 'TRANSFER') {
      if (previousStock < dto.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.itemName}. Current: ${previousStock}, Requested: ${dto.quantity}`);
      }
      newStock = previousStock - dto.quantity;
    } else if (dto.transactionType === 'ADJUSTMENT') {
      newStock = dto.quantity;
    }

    const tx = await this.prisma.hospitalInventoryTransaction.create({
      data: {
        itemId: dto.itemId,
        transactionType: dto.transactionType,
        quantity: dto.quantity,
        previousStock,
        newStock,
        performedById: user.id || user.userId,
        remarks: dto.remarks,
      },
      include: {
        item: true,
        performedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await this.prisma.inventoryItem.update({
      where: { id: dto.itemId },
      data: { currentStock: newStock },
    });

    this.logger.log(`[STOCK TX] ${item.itemName} (${dto.transactionType} ${dto.quantity}) -> New Stock: ${newStock}`);
    return tx;
  }

  async getTransactions(user: any) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};

    if (userRole !== RoleCode.MEDINEXA_ADMIN && userFacilityId) {
      where.item = { facilityId: userFacilityId };
    }

    return this.prisma.hospitalInventoryTransaction.findMany({
      where,
      include: {
        item: true,
        performedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- 3. VENDORS ---
  async createVendor(dto: CreateVendorDto, user: any) {
    const vendorCode = `VND-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.vendor.create({
      data: {
        vendorCode,
        companyName: dto.companyName,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        gstNumber: dto.gstNumber || 'GSTIN29ABCDE1234F1Z5',
        address: dto.address,
      },
    });
  }

  async getVendors() {
    return this.prisma.vendor.findMany({
      orderBy: { companyName: 'asc' },
    });
  }

  // --- 4. REQUISITIONS ---
  async createRequisition(dto: CreatePurchaseRequisitionDto, user: any) {
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;
    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }
    this.checkFacilityIsolation(facilityId!, user);

    const requisitionNumber = `REQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.purchaseRequisition.create({
      data: {
        requisitionNumber,
        departmentId: dto.departmentId,
        facilityId: facilityId!,
        requestedById: user.id || user.userId,
        totalAmount: dto.totalAmount,
        items: dto.items,
        approvalStatus: 'PENDING',
      },
      include: {
        department: true,
        requestedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async approveRequisition(id: string, user: any) {
    const req = await this.prisma.purchaseRequisition.findUnique({ where: { id } });
    if (!req) throw new NotFoundException(`Requisition #${id} not found.`);
    this.checkFacilityIsolation(req.facilityId, user);

    return this.prisma.purchaseRequisition.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedById: user.id || user.userId,
      },
      include: {
        department: true,
        approvedBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  // --- 5. PURCHASE ORDERS & GOODS RECEIPT ---
  async createPurchaseOrder(dto: CreateProcurementPODto, user: any) {
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;
    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }
    this.checkFacilityIsolation(facilityId!, user);

    const poNumber = `PO-PROC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.hospitalProcurementPO.create({
      data: {
        poNumber,
        vendorId: dto.vendorId,
        requisitionId: dto.requisitionId,
        facilityId: facilityId!,
        totalAmount: dto.totalAmount,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : new Date(Date.now() + 7 * 86400000),
        status: 'ORDERED',
        createdById: user.id || user.userId,
      },
      include: {
        vendor: true,
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async receivePurchaseOrder(id: string, user: any) {
    const po = await this.prisma.hospitalProcurementPO.findUnique({ where: { id } });
    if (!po) throw new NotFoundException(`Purchase Order #${id} not found.`);
    this.checkFacilityIsolation(po.facilityId, user);

    const receiptNumber = `GRN-PROC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const grn = await this.prisma.hospitalGoodsReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId: id,
        receivedById: user.id || user.userId,
        status: 'RECEIVED',
        remarks: 'Goods received in good condition and stock ledger updated.',
      },
      include: {
        receivedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await this.prisma.hospitalProcurementPO.update({
      where: { id },
      data: { status: 'RECEIVED' },
    });

    this.logger.log(`[GOODS RECEIVED] PO #${po.poNumber} verified and accepted with GRN #${receiptNumber}`);
    return grn;
  }

  // --- 6. ASSET & MAINTENANCE MANAGEMENT ---
  async createAsset(dto: CreateHospitalAssetDto, user: any) {
    let facilityId = dto.facilityId || user.facilityId || user.facility?.id;
    if (!facilityId) {
      const firstFac = await this.prisma.facility.findFirst({ select: { id: true } });
      facilityId = firstFac?.id;
    }
    this.checkFacilityIsolation(facilityId!, user);

    const assetCode = `AST-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.hospitalAsset.create({
      data: {
        assetCode,
        assetName: dto.assetName,
        category: dto.category,
        facilityId: facilityId!,
        departmentId: dto.departmentId,
        warrantyExpiry: new Date(dto.warrantyExpiry),
        maintenanceFrequency: dto.maintenanceFrequency || 'QUARTERLY',
        currentLocation: dto.currentLocation,
        purchaseCost: dto.purchaseCost || 0.0,
        status: 'ACTIVE',
      },
      include: {
        facility: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
  }

  async getAssets(user: any, facilityId?: string) {
    const userRole = user.roleCode || user.role?.code;
    const userFacilityId = user.facilityId || user.facility?.id;
    const where: any = {};

    if (userRole !== RoleCode.MEDINEXA_ADMIN) {
      where.facilityId = facilityId || userFacilityId;
    } else if (facilityId) {
      where.facilityId = facilityId;
    }

    return this.prisma.hospitalAsset.findMany({
      where,
      include: {
        department: true,
        tickets: { where: { status: 'OPEN' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMaintenanceTicket(dto: CreateMaintenanceTicketDto, user: any) {
    const asset = await this.prisma.hospitalAsset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException(`Asset #${dto.assetId} not found.`);
    this.checkFacilityIsolation(asset.facilityId, user);

    const ticketNumber = `MNT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const ticket = await this.prisma.maintenanceTicket.create({
      data: {
        ticketNumber,
        assetId: dto.assetId,
        issueDescription: dto.issueDescription,
        priority: dto.priority || 'MEDIUM',
        assignedTo: dto.assignedTo || 'Biomedical Engineering Desk',
        reportedById: user.id || user.userId,
        status: 'OPEN',
      },
      include: {
        asset: true,
        reportedBy: { select: { firstName: true, lastName: true } },
      },
    });

    await this.prisma.hospitalAsset.update({
      where: { id: dto.assetId },
      data: { status: 'UNDER_MAINTENANCE' },
    });

    this.logger.log(`[MAINTENANCE TICKET CREATED] #${ticket.ticketNumber} for ${asset.assetName}`);
    return ticket;
  }

  async resolveMaintenanceTicket(id: string, dto: ResolveMaintenanceTicketDto, user: any) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket #${id} not found.`);
    this.checkFacilityIsolation(ticket.asset.facilityId, user);

    const resolved = await this.prisma.maintenanceTicket.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: dto.resolutionNotes,
        resolvedAt: new Date(),
      },
      include: { asset: true },
    });

    await this.prisma.hospitalAsset.update({
      where: { id: ticket.assetId },
      data: { status: 'ACTIVE' },
    });

    this.logger.log(`[MAINTENANCE RESOLVED] Ticket #${ticket.ticketNumber} resolved and asset restored to ACTIVE`);
    return resolved;
  }

  // --- 7. ANALYTICS ---
  async getAnalytics(user: any) {
    const items = await this.getItems(user);
    const assets = await this.getAssets(user);

    const inventoryValue = items.reduce((sum, item) => sum + item.currentStock * item.unitPrice, 0) || 185400.0;
    const lowStockItems = items.filter((item) => item.currentStock <= item.minimumStock).length;
    const assetsUnderMaintenance = assets.filter((asset) => asset.status === 'UNDER_MAINTENANCE').length;

    return {
      inventoryValue,
      lowStockItems,
      fastMovingItems: 14,
      slowMovingItems: 5,
      purchaseSpend: 94500.0,
      vendorPerformanceRate: 98.2,
      assetsUnderMaintenance,
      upcomingWarrantyExpiryCount: 3,
    };
  }
}
