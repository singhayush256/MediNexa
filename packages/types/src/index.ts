/**
 * MediNexa Core Type Definitions (Day 9 Monorepo Shared Package)
 */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp?: string;
  database?: string;
}

export enum RoleCode {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  LAB_STAFF = 'LAB_STAFF',
  PHARMACY_STAFF = 'PHARMACY_STAFF',
  AMBULANCE_DRIVER = 'AMBULANCE_DRIVER',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  MEDINEXA_ADMIN = 'MEDINEXA_ADMIN',
  // Role codes and aliases
  INSURANCE_COORDINATOR = 'INSURANCE_COORDINATOR',
  BILLING_STAFF = 'BILLING_STAFF',
  HR_MANAGER = 'HR_MANAGER',
  PHARMACIST = 'PHARMACIST',
  EMS_OPERATOR = 'EMS_OPERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED',
}

export enum WardType {
  GENERAL = 'GENERAL',
  ICU = 'ICU',
  CCU = 'CCU',
  NICU = 'NICU',
  PICU = 'PICU',
  EMERGENCY = 'EMERGENCY',
  MATERNITY = 'MATERNITY',
  ISOLATION = 'ISOLATION',
  PRIVATE = 'PRIVATE',
  SEMI_PRIVATE = 'SEMI_PRIVATE',
}

export enum WardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum RoomType {
  GENERAL = 'GENERAL',
  PRIVATE = 'PRIVATE',
  SEMI_PRIVATE = 'SEMI_PRIVATE',
  ICU = 'ICU',
  ISOLATION = 'ISOLATION',
  EMERGENCY = 'EMERGENCY',
}

export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum BedType {
  GENERAL = 'GENERAL',
  ICU = 'ICU',
  CCU = 'CCU',
  NICU = 'NICU',
  PICU = 'PICU',
  EMERGENCY = 'EMERGENCY',
  PRIVATE = 'PRIVATE',
  SEMI_PRIVATE = 'SEMI_PRIVATE',
  OXYGEN = 'OXYGEN',
  VENTILATOR = 'VENTILATOR',
}

export enum BedBookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  ADMITTED = 'ADMITTED',
  CANCELLED = 'CANCELLED',
}

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  CONVERTED = 'CONVERTED',
}

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  RELEASED = 'RELEASED',
}

export enum AdmissionType {
  EMERGENCY = 'EMERGENCY',
  ELECTIVE = 'ELECTIVE',
  OBSERVATION = 'OBSERVATION',
  TRANSFER = 'TRANSFER',
  DAY_CARE = 'DAY_CARE',
}

export enum AdmissionStatus {
  PLANNED = 'PLANNED',
  ADMITTED = 'ADMITTED',
  TRANSFERRED = 'TRANSFERRED',
  DISCHARGE_PENDING = 'DISCHARGE_PENDING',
  DISCHARGED = 'DISCHARGED',
  CANCELLED = 'CANCELLED',
}

export enum EncounterType {
  INPATIENT = 'INPATIENT',
  OUTPATIENT = 'OUTPATIENT',
  EMERGENCY = 'EMERGENCY',
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum EncounterStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum NoteType {
  INITIAL_ASSESSMENT = 'INITIAL_ASSESSMENT',
  PROGRESS_NOTE = 'PROGRESS_NOTE',
  CONSULTATION = 'CONSULTATION',
  DISCHARGE_NOTE = 'DISCHARGE_NOTE',
  FOLLOW_UP = 'FOLLOW_UP',
  OTHER = 'OTHER',
}

export enum NoteStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  AMENDED = 'AMENDED',
}

export enum DiagnosisType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  WORKING = 'WORKING',
  DIFFERENTIAL = 'DIFFERENTIAL',
}

export enum DiagnosisStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum LabTestCategory {
  HEMATOLOGY = 'HEMATOLOGY',
  BIOCHEMISTRY = 'BIOCHEMISTRY',
  MICROBIOLOGY = 'MICROBIOLOGY',
  IMMUNOLOGY = 'IMMUNOLOGY',
  PATHOLOGY = 'PATHOLOGY',
  RADIOLOGY = 'RADIOLOGY',
  CARDIOLOGY = 'CARDIOLOGY',
  OTHER = 'OTHER',
}

export enum LabOrderPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

export enum LabOrderStatus {
  ORDERED = 'ORDERED',
  COLLECTION_PENDING = 'COLLECTION_PENDING',
  COLLECTED = 'COLLECTED',
  PROCESSING = 'PROCESSING',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SpecimenStatus {
  PENDING = 'PENDING',
  COLLECTED = 'COLLECTED',
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export enum LabResultStatus {
  PRELIMINARY = 'PRELIMINARY',
  FINAL = 'FINAL',
  AMENDED = 'AMENDED',
  CANCELLED = 'CANCELLED',
}

export enum AbnormalFlag {
  NORMAL = 'NORMAL',
  LOW = 'LOW',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  ABNORMAL = 'ABNORMAL',
}

export enum PrescriptionStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_DISPENSED = 'PARTIALLY_DISPENSED',
  DISPENSED = 'DISPENSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum DispenseStatus {
  PENDING = 'PENDING',
  PARTIALLY_DISPENSED = 'PARTIALLY_DISPENSED',
  DISPENSED = 'DISPENSED',
  CANCELLED = 'CANCELLED',
}

// Day 9 Enums
export enum EmergencyType {
  MEDICAL = 'MEDICAL',
  TRAUMA = 'TRAUMA',
  ACCIDENT = 'ACCIDENT',
  CARDIAC = 'CARDIAC',
  STROKE = 'STROKE',
  RESPIRATORY = 'RESPIRATORY',
  MATERNITY = 'MATERNITY',
  PEDIATRIC = 'PEDIATRIC',
  OTHER = 'OTHER',
}

export enum EmergencySeverity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EmergencyStatus {
  REPORTED = 'REPORTED',
  TRIAGED = 'TRIAGED',
  DISPATCH_REQUESTED = 'DISPATCH_REQUESTED',
  AMBULANCE_ASSIGNED = 'AMBULANCE_ASSIGNED',
  EN_ROUTE_TO_PICKUP = 'EN_ROUTE_TO_PICKUP',
  AT_PICKUP = 'AT_PICKUP',
  PATIENT_ONBOARD = 'PATIENT_ONBOARD',
  ARRIVED_AT_FACILITY = 'ARRIVED_AT_FACILITY',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export enum AmbulanceType {
  BASIC_LIFE_SUPPORT = 'BASIC_LIFE_SUPPORT',
  ADVANCED_LIFE_SUPPORT = 'ADVANCED_LIFE_SUPPORT',
  PATIENT_TRANSPORT = 'PATIENT_TRANSPORT',
  NEONATAL = 'NEONATAL',
  OTHER = 'OTHER',
}

export enum AmbulanceStatus {
  AVAILABLE = 'AVAILABLE',
  DISPATCHED = 'DISPATCHED',
  EN_ROUTE = 'EN_ROUTE',
  AT_SCENE = 'AT_SCENE',
  PATIENT_ONBOARD = 'PATIENT_ONBOARD',
  RETURNING = 'RETURNING',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_DUTY = 'ON_DUTY',
  ASSIGNED = 'ASSIGNED',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
}

export enum DispatchStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  AT_PICKUP = 'AT_PICKUP',
  PATIENT_ONBOARD = 'PATIENT_ONBOARD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReferralUrgency {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
  CRITICAL = 'CRITICAL',
}

export enum ReferralStatus {
  DRAFT = 'DRAFT',
  REQUESTED = 'REQUESTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  TRANSFER_IN_PROGRESS = 'TRANSFER_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum CrossFacilityTransferStatus {
  PLANNED = 'PLANNED',
  READY = 'READY',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RecordAuthorizationType {
  FULL_RECORD = 'FULL_RECORD',
  ENCOUNTER_SUMMARY = 'ENCOUNTER_SUMMARY',
  LAB_RESULTS = 'LAB_RESULTS',
  PRESCRIPTIONS = 'PRESCRIPTIONS',
  OTHER = 'OTHER',
}

export enum RecordAuthorizationStatus {
  REQUESTED = 'REQUESTED',
  AUTHORIZED = 'AUTHORIZED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export interface RoleDto {
  id: string;
  name: string;
  code: RoleCode;
  description?: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  code: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityDto {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  facilityType?: string;
  rating?: number;
  servicesOffered?: string[];
  status: string;
  organization?: OrganizationDto;
  departments?: DepartmentDto[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDto {
  id: string;
  facilityId: string;
  name: string;
  code: string;
  status: string;
  facility?: FacilityDto;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialtyDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WardDto {
  id: string;
  facilityId: string;
  departmentId: string;
  name: string;
  code: string;
  wardType: WardType;
  genderPolicy?: string;
  floor?: string;
  status: WardStatus;
  facility?: FacilityDto;
  department?: DepartmentDto;
  totalBeds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomDto {
  id: string;
  wardId: string;
  roomNumber: string;
  roomType: RoomType;
  floor?: string;
  capacity: number;
  status: RoomStatus;
  ward?: WardDto;
  totalBeds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BedReservationDto {
  id: string;
  bedId: string;
  patientId: string;
  reservedBy: string;
  reservedAt: string;
  expiresAt: string;
  convertedAt?: string;
  cancelledAt?: string;
  status: ReservationStatus;
  reason?: string;
  patient?: PatientProfileDto;
  reservingUser?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface BedAssignmentDto {
  id: string;
  bedId: string;
  patientId: string;
  assignedBy: string;
  reservationId?: string;
  admissionId?: string;
  assignedAt: string;
  releasedAt?: string;
  status: AssignmentStatus;
  reason?: string;
  patient?: PatientProfileDto;
  assigningUser?: UserDto;
  reservation?: BedReservationDto;
  bed?: BedDto;
  createdAt: string;
  updatedAt: string;
}

export interface BedStatusHistoryDto {
  id: string;
  bedId: string;
  previousStatus: BedStatus;
  newStatus: BedStatus;
  changedBy: string;
  patientId?: string;
  reason?: string;
  changingUser?: UserDto;
  patient?: PatientProfileDto;
  createdAt: string;
}

export interface BedDto {
  id: string;
  roomId: string;
  wardId: string;
  facilityId: string;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  genderPolicy?: string;
  isActive: boolean;
  room?: RoomDto;
  ward?: WardDto;
  facility?: FacilityDto;
  activeReservation?: BedReservationDto;
  activeAssignment?: BedAssignmentDto;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityCapacityDto {
  facilityId: string;
  facilityName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  reservedBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  outOfServiceBeds: number;
  occupancyRate: number;
  totalWards?: number;
  totalRooms?: number;
}

export interface BedStatusChangedEvent {
  facilityId: string;
  bedId: string;
  previousStatus: BedStatus;
  newStatus: BedStatus;
  timestamp: string;
}

export interface AdmissionTransferDto {
  id: string;
  admissionId: string;
  patientId: string;
  fromBedId: string;
  toBedId: string;
  fromRoomId?: string;
  toRoomId?: string;
  fromWardId?: string;
  toWardId?: string;
  fromDepartmentId?: string;
  toDepartmentId?: string;
  reason?: string;
  transferredBy: string;
  transferredAt: string;
  fromBed?: BedDto;
  toBed?: BedDto;
  transferrer?: UserDto;
  createdAt: string;
}

export interface AdmissionStatusHistoryDto {
  id: string;
  admissionId: string;
  previousStatus: AdmissionStatus;
  newStatus: AdmissionStatus;
  changedBy: string;
  reason?: string;
  changer?: UserDto;
  createdAt: string;
}

export interface BedBookingDto {
  id: string;
  bookingNumber: string;
  facilityId: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  bedType: BedType;
  priority: string;
  chiefComplaint?: string;
  medicalCondition?: string;
  allocatedBedId?: string;
  admissionId?: string;
  status: BedBookingStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  admittedAt?: string;
  expectedDate?: string;
  expiresAt?: string;
  facility?: FacilityDto;
  allocatedBed?: BedDto;
  createdAt: string;
  updatedAt: string;
}

export interface NearbyHospitalDto {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  facilityType?: string;
  rating: number;
  latitude: number;
  longitude: number;
  distanceKm: number;
  estimatedDriveMinutes: number;
  totalBeds: number;
  availableBeds: number;
  availableIcuBeds: number;
  availableEmergencyBeds: number;
  availableOxygenBeds: number;
  availableVentilatorBeds: number;
  availableGeneralBeds: number;
  bedBreakdown: Record<string, { total: number; available: number }>;
  servicesOffered: string[];
}

export interface OccupancyReportDto {
  facilityId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'peak';
  metrics: {
    overallRate: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    peakOccupancyRate: number;
    peakTimestamp?: string;
    averageTurnaroundHours: number;
  };
  trendData: Array<{
    period: string;
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  }>;
  wardBreakdown: Array<{
    wardId: string;
    wardName: string;
    wardType: string;
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  }>;
  typeBreakdown: Record<string, { total: number; occupied: number; available: number; rate: number }>;
}

export interface OccupancyForecastDto {
  facilityId: string;
  model: string;
  forecastDate: string;
  currentOccupancyRate: number;
  predictedOccupancyTomorrow: number;
  dailyForecasts: Array<{
    date: string;
    dayOfWeek: string;
    overallRate: number;
    icuRate: number;
    emergencyRate: number;
    predictedSurgeRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  recommendations: string[];
  alerts: Array<{
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    department: string;
  }>;
}

export interface AdmissionDto {
  id: string;
  patientId: string;
  facilityId: string;
  departmentId: string;
  admissionNumber: string;
  admissionType: AdmissionType;
  status: AdmissionStatus;
  admittedAt: string;
  admittedBy: string;
  expectedDischargeAt?: string;
  dischargedAt?: string;
  dischargeReason?: string;
  reason?: string;
  patient?: PatientProfileDto;
  facility?: FacilityDto;
  department?: DepartmentDto;
  admitter?: UserDto;
  currentAssignment?: BedAssignmentDto;
  bedAssignments?: BedAssignmentDto[];
  transfers?: AdmissionTransferDto[];
  statusHistory?: AdmissionStatusHistoryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalNoteVersionDto {
  id: string;
  noteId: string;
  versionNumber: number;
  content: string;
  reason?: string;
  createdBy: string;
  creator?: UserDto;
  createdAt: string;
}

export interface ClinicalNoteDto {
  id: string;
  encounterId: string;
  authorId: string;
  noteType: NoteType;
  content: string;
  status: NoteStatus;
  signedAt?: string;
  signedBy?: string;
  author?: UserDto;
  signer?: UserDto;
  versions?: ClinicalNoteVersionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface VitalSignDto {
  id: string;
  encounterId: string;
  patientId: string;
  recordedBy: string;
  recordedAt: string;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
  recorder?: UserDto;
  createdAt: string;
}

export interface DiagnosisDto {
  id: string;
  encounterId: string;
  patientId: string;
  recordedBy: string;
  diagnosisCode?: string;
  diagnosisName: string;
  description?: string;
  diagnosisType: DiagnosisType;
  status: DiagnosisStatus;
  diagnosedAt: string;
  diagnoser?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalEncounterDto {
  id: string;
  patientId: string;
  doctorId: string;
  facilityId: string;
  departmentId: string;
  admissionId?: string;
  encounterNumber: string;
  encounterType: EncounterType;
  status: EncounterStatus;
  reasonForVisit?: string;
  startedAt: string;
  endedAt?: string;
  patient?: PatientProfileDto;
  doctor?: DoctorProfileDto;
  facility?: FacilityDto;
  department?: DepartmentDto;
  admission?: AdmissionDto;
  clinicalNotes?: ClinicalNoteDto[];
  vitalSigns?: VitalSignDto[];
  diagnoses?: DiagnosisDto[];
  createdAt: string;
  updatedAt: string;
}

export interface LabTestDto {
  id: string;
  code: string;
  name: string;
  category: LabTestCategory;
  description?: string;
  specimenType: string;
  turnaroundTimeMinutes: number;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResultVersionDto {
  id: string;
  resultId: string;
  versionNumber: number;
  resultValue: string;
  numericValue?: number;
  abnormalFlag: AbnormalFlag;
  reason?: string;
  createdBy: string;
  creator?: UserDto;
  createdAt: string;
}

export interface LabResultDto {
  id: string;
  labOrderItemId: string;
  patientId: string;
  resultValue: string;
  numericValue?: number;
  unit?: string;
  referenceRange?: string;
  abnormalFlag: AbnormalFlag;
  resultStatus: LabResultStatus;
  interpretation?: string;
  enteredBy: string;
  verifiedBy?: string;
  enteredAt: string;
  verifiedAt?: string;
  enterer?: UserDto;
  verifier?: UserDto;
  versions?: LabResultVersionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface LabOrderItemDto {
  id: string;
  labOrderId: string;
  labTestId: string;
  status: string;
  notes?: string;
  labTest?: LabTestDto;
  results?: LabResultDto[];
  createdAt: string;
  updatedAt: string;
}

export interface SpecimenDto {
  id: string;
  specimenNumber: string;
  labOrderId: string;
  patientId: string;
  specimenType: string;
  status: SpecimenStatus;
  collectedBy?: string;
  collectedAt?: string;
  receivedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  collector?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface LabOrderDto {
  id: string;
  orderNumber: string;
  encounterId: string;
  patientId: string;
  doctorId: string;
  facilityId: string;
  priority: LabOrderPriority;
  status: LabOrderStatus;
  clinicalNotes?: string;
  orderedAt: string;
  collectedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  patient?: PatientProfileDto;
  doctor?: DoctorProfileDto;
  facility?: FacilityDto;
  encounter?: ClinicalEncounterDto;
  items?: LabOrderItemDto[];
  specimens?: SpecimenDto[];
  verifier?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDto {
  id: string;
  code: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  route: string;
  category: string;
  manufacturer?: string;
  prescriptionRequired: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionDispenseDto {
  id: string;
  dispenseNumber: string;
  prescriptionId: string;
  prescriptionItemId: string;
  dispensedBy: string;
  quantityDispensed: number;
  batchNumber?: string;
  expirationDate?: string;
  dispensedAt: string;
  status: DispenseStatus;
  notes?: string;
  dispenser?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItemDto {
  id: string;
  prescriptionId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: number;
  instructions?: string;
  refillsAllowed: number;
  refillsUsed: number;
  medication?: MedicationDto;
  dispenses?: PrescriptionDispenseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionAmendmentDto {
  id: string;
  prescriptionId: string;
  amendmentNumber: number;
  reason: string;
  createdBy: string;
  creator?: UserDto;
  createdAt: string;
}

export interface PrescriptionDto {
  id: string;
  prescriptionNumber: string;
  encounterId: string;
  patientId: string;
  doctorId: string;
  facilityId: string;
  status: PrescriptionStatus;
  prescribedAt: string;
  validUntil?: string;
  notes?: string;
  patient?: PatientProfileDto;
  doctor?: DoctorProfileDto;
  facility?: FacilityDto;
  encounter?: ClinicalEncounterDto;
  items?: PrescriptionItemDto[];
  dispenses?: PrescriptionDispenseDto[];
  amendments?: PrescriptionAmendmentDto[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyRequestDto {
  id: string;
  emergencyNumber: string;
  patientId?: string;
  callerName: string;
  callerPhone: string;
  pickupAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  sourceFacilityId?: string;
  destinationFacilityId?: string;
  requestedAt: string;
  dispatchedAt?: string;
  resolvedAt?: string;
  patient?: PatientProfileDto;
  sourceFacility?: FacilityDto;
  destinationFacility?: FacilityDto;
  dispatches?: AmbulanceDispatchDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceDto {
  id: string;
  vehicleNumber: string;
  registrationNumber: string;
  ambulanceType: AmbulanceType;
  status: AmbulanceStatus;
  facilityId: string;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationAt?: string;
  equipmentSummary?: string;
  facility?: FacilityDto;
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceDriverProfileDto {
  id: string;
  userId: string;
  facilityId: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  user?: UserDto;
  facility?: FacilityDto;
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceDispatchDto {
  id: string;
  dispatchNumber: string;
  emergencyRequestId: string;
  ambulanceId: string;
  driverId: string;
  dispatchedBy: string;
  status: DispatchStatus;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  emergencyRequest?: EmergencyRequestDto;
  ambulance?: AmbulanceDto;
  driver?: AmbulanceDriverProfileDto;
  dispatcher?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface AmbulanceLocationDto {
  id: string;
  ambulanceId: string;
  latitude: number;
  longitude: number;
  recordedAt: string;
  source?: string;
  createdAt: string;
}

export interface HospitalReferralDto {
  id: string;
  referralNumber: string;
  patientId: string;
  sourceFacilityId: string;
  destinationFacilityId: string;
  referringDoctorId: string;
  receivingDoctorId?: string;
  admissionId?: string;
  encounterId?: string;
  reason: string;
  clinicalSummary: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  requestedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  patient?: PatientProfileDto;
  sourceFacility?: FacilityDto;
  destinationFacility?: FacilityDto;
  referringDoctor?: DoctorProfileDto;
  receivingDoctor?: DoctorProfileDto;
  admission?: AdmissionDto;
  encounter?: ClinicalEncounterDto;
  bedReservations?: BedReservationDto[];
  crossFacilityTransfers?: CrossFacilityTransferDto[];
  recordAuthorizations?: MedicalRecordTransferAuthorizationDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CrossFacilityTransferDto {
  id: string;
  transferNumber: string;
  referralId: string;
  patientId: string;
  sourceFacilityId: string;
  destinationFacilityId: string;
  sourceAdmissionId?: string;
  destinationAdmissionId?: string;
  sourceBedId?: string;
  destinationBedId?: string;
  ambulanceDispatchId?: string;
  status: CrossFacilityTransferStatus;
  initiatedAt: string;
  departedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  initiatedBy: string;
  completedBy?: string;
  referral?: HospitalReferralDto;
  patient?: PatientProfileDto;
  sourceFacility?: FacilityDto;
  destinationFacility?: FacilityDto;
  sourceBed?: BedDto;
  destinationBed?: BedDto;
  ambulanceDispatch?: AmbulanceDispatchDto;
  initiator?: UserDto;
  completer?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordTransferAuthorizationDto {
  id: string;
  referralId: string;
  patientId: string;
  sourceFacilityId: string;
  destinationFacilityId: string;
  authorizedBy: string;
  authorizationType: RecordAuthorizationType;
  status: RecordAuthorizationStatus;
  authorizedAt: string;
  expiresAt?: string;
  authorizer?: UserDto;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalTimelineItemDto {
  id: string;
  itemType: 'ENCOUNTER' | 'CLINICAL_NOTE' | 'VITAL_SIGN' | 'DIAGNOSIS' | 'LAB_ORDER' | 'LAB_RESULT' | 'PRESCRIPTION' | 'EMERGENCY' | 'REFERRAL';
  timestamp: string;
  title: string;
  summary: string;
  details: any;
}

export interface PatientProfileDto {
  id: string;
  userId: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  status: string;
  user?: UserDto;
  emergencyContacts?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfileDto {
  id: string;
  userId: string;
  facilityId: string;
  departmentId: string;
  specialtyId: string;
  licenseNumber: string;
  status: string;
  user?: UserDto;
  facility?: FacilityDto;
  department?: DepartmentDto;
  specialty?: SpecialtyDto;
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  roleId: string;
  roleCode?: string;
  organizationId: string;
  facilityId?: string;
  uhid?: string;
  role?: RoleDto;
  organization?: OrganizationDto;
  facility?: FacilityDto;
  patientProfile?: PatientProfileDto;
  doctorProfile?: DoctorProfileDto;
  twoFactorEnabled?: boolean;
  lastVerificationTime?: string;
  failedTotpAttempts?: number;
  totpLockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
  backupCodes?: string[];
  message?: string;
}

export interface LoginResponseDto {
  requires2fa?: boolean;
  challengeToken?: string;
  email?: string;
  accessToken?: string;
  user?: UserDto;
  backupCodes?: string[];
  message?: string;
}

export interface TotpSetupResponseDto {
  registrationToken?: string;
  qrCodeUrl: string;
  manualSetupKey: string;
  backupCodes: string[];
  email: string;
}

export interface VerifyTotpDto {
  code: string;
  challengeToken?: string;
  registrationToken?: string;
  isBackupCode?: boolean;
  rememberMe?: boolean;
}

export interface Admin2faUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleCode: string;
  roleName: string;
  twoFactorEnabled: boolean;
  lastVerificationTime?: string;
  failedTotpAttempts: number;
  isLocked: boolean;
  totpLockedUntil?: string;
  createdAt: string;
}

export interface CreateEmergencyRequestDto {
  patientId?: string;
  callerName: string;
  callerPhone: string;
  pickupAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  emergencyType: EmergencyType;
  severity?: EmergencySeverity;
  sourceFacilityId?: string;
  destinationFacilityId?: string;
}

export interface CreateAmbulanceDto {
  vehicleNumber: string;
  registrationNumber: string;
  ambulanceType: AmbulanceType;
  facilityId: string;
  equipmentSummary?: string;
}

export interface CreateDriverDto {
  userId: string;
  facilityId: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export interface DispatchAmbulanceDto {
  emergencyRequestId: string;
  ambulanceId: string;
  driverId: string;
}

export interface UpdateLocationDto {
  latitude: number;
  longitude: number;
  source?: string;
}

export interface CreateReferralDto {
  patientId: string;
  sourceFacilityId: string;
  destinationFacilityId: string;
  destinationDepartmentId?: string;
  destinationBedId?: string;
  admissionId?: string;
  encounterId?: string;
  reason: string;
  clinicalSummary: string;
  urgency?: ReferralUrgency;
}

export interface AuthorizeRecordAccessDto {
  authorizationType: RecordAuthorizationType;
  expiresInDays?: number;
}

// =========================================================================
// DAY 10 — APPOINTMENTS, NOTIFICATIONS, REMINDERS, ANALYTICS, SEARCH & AI TYPES
// =========================================================================

export enum AppointmentType {
  IN_PERSON = 'IN_PERSON',
  VIDEO = 'VIDEO',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
}

export enum AppointmentStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum NotificationType {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  AMBULANCE_ASSIGNED = 'AMBULANCE_ASSIGNED',
  REFERRAL_REQUESTED = 'REFERRAL_REQUESTED',
  REFERRAL_ACCEPTED = 'REFERRAL_ACCEPTED',
  REFERRAL_REJECTED = 'REFERRAL_REJECTED',
  BED_RESERVED = 'BED_RESERVED',
  BED_AVAILABLE = 'BED_AVAILABLE',
  LAB_RESULT_READY = 'LAB_RESULT_READY',
  PRESCRIPTION_ISSUED = 'PRESCRIPTION_ISSUED',
  PRESCRIPTION_DISPENSED = 'PRESCRIPTION_DISPENSED',
  MEDICATION_REMINDER = 'MEDICATION_REMINDER',
  SYSTEM = 'SYSTEM',
  LAB_REPORT_AVAILABLE = 'LAB_REPORT_AVAILABLE',
  PRESCRIPTION_UPDATED = 'PRESCRIPTION_UPDATED',
  TELEHEALTH_SESSION_STARTING = 'TELEHEALTH_SESSION_STARTING',
  BED_BOOKING_APPROVED = 'BED_BOOKING_APPROVED',
  BED_BOOKING_REJECTED = 'BED_BOOKING_REJECTED',
  BED_BOOKING_EXPIRED = 'BED_BOOKING_EXPIRED',
}

export enum ReminderStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum FoodTiming {
  BEFORE_FOOD = 'BEFORE_FOOD',
  AFTER_FOOD = 'AFTER_FOOD',
  WITH_FOOD = 'WITH_FOOD',
  NO_RESTRICTION = 'NO_RESTRICTION',
}

export enum ReminderAction {
  TAKEN = 'TAKEN',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
  SNOOZED = 'SNOOZED',
}

export enum ReminderNotificationChannel {
  BROWSER_PUSH = 'BROWSER_PUSH',
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

export enum ReminderFrequency {
  DAILY = 'DAILY',
  ALTERNATE_DAY = 'ALTERNATE_DAY',
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM',
}

export enum ReminderNotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export interface AppointmentDto {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  facilityId: string;
  departmentId: string;
  specialtyId?: string;
  encounterId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
  patient?: any;
  doctor?: any;
  facility?: any;
  department?: any;
  specialty?: any;
}

export interface DoctorScheduleDto {
  id: string;
  doctorId: string;
  facilityId: string;
  departmentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlotDto {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CreateAppointmentDto {
  patientId?: string;
  doctorId: string;
  facilityId?: string;
  departmentId?: string;
  specialtyId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  reason: string;
  notes?: string;
}

export interface CreateDoctorScheduleDto {
  doctorId: string;
  facilityId: string;
  departmentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  status?: ScheduleStatus;
}

export interface RescheduleAppointmentDto {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  readAt?: string;
  isRead?: boolean;
  createdAt: string;
}

export interface PatientMedicationDto {
  id: string;
  patientId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: string[];
  beforeMeal: boolean;
  startDate?: string | null;
  endDate?: string | null;
  prescribedBy?: string | null;
  status: 'active' | 'completed' | string;
  createdAt?: string;
  updatedAt?: string;
  logs?: MedicationLogDto[];
}

export interface MedicationLogDto {
  id: string;
  medicationId: string;
  patientId: string;
  doseTime: string;
  status: 'taken' | 'missed' | 'pending';
  scheduledFor: string;
  takenAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface TodayMedicationItemDto {
  id: string;
  medicationId: string;
  medicineName: string;
  dosage: string;
  doseTime: string;
  formattedTime: string;
  beforeMeal: boolean;
  status: 'Due' | 'Taken' | 'Missed';
  takenAt?: string | null;
  frequency: string;
  prescribedBy?: string | null;
}

export interface NotificationPreferenceDto {
  id?: string;
  userId: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  labReportAlerts: boolean;
}

export interface NotificationDeliveryLogDto {
  id: string;
  recipient: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'IN_APP' | string;
  notificationType: string;
  title: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING' | string;
  failureReason?: string | null;
  sentAt?: string | null;
  metadata?: any;
  createdAt: string;
}

export interface MedicationReminderDto {
  id: string;
  patientId: string;
  prescriptionItemId?: string | null;
  doctorId?: string | null;
  medicineName: string;
  dosage?: string | null;
  frequency: string;
  foodTiming: FoodTiming;
  startDate: string;
  endDate?: string | null;
  reminderTime?: string | null;
  scheduledTime: string;
  instructions?: string | null;
  status: ReminderStatus;
  lastTakenAt?: string | null;
  skippedAt?: string | null;
  lastNotifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: PatientProfileDto;
  doctor?: DoctorProfileDto;
  prescriptionItem?: any;
  histories?: ReminderHistoryDto[];
  notifications?: ReminderNotificationDto[];
}

export interface CreateMedicationReminderDto {
  patientId?: string;
  prescriptionItemId?: string;
  doctorId?: string;
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  foodTiming?: FoodTiming;
  startDate?: string;
  endDate?: string;
  reminderTime?: string;
  scheduledTime?: string;
  instructions?: string;
  times?: string[];
}

export interface UpdateMedicationReminderDto {
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  foodTiming?: FoodTiming;
  startDate?: string;
  endDate?: string;
  reminderTime?: string;
  scheduledTime?: string;
  instructions?: string;
  status?: ReminderStatus;
}

export interface RecordDoseActionDto {
  action: ReminderAction;
  scheduledFor?: string;
  notes?: string;
}

export interface ReminderHistoryDto {
  id: string;
  reminderId: string;
  patientId: string;
  scheduledFor: string;
  action: ReminderAction;
  actionTime: string;
  notes?: string | null;
  createdAt: string;
  reminder?: MedicationReminderDto;
}

export interface ReminderNotificationDto {
  id: string;
  reminderId: string;
  patientId: string;
  channel: ReminderNotificationChannel;
  status: ReminderNotificationStatus;
  title: string;
  message: string;
  sentAt?: string | null;
  readAt?: string | null;
  scheduledTime?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  reminder?: MedicationReminderDto;
}

export interface TodayScheduleItemDto {
  reminderId: string;
  medicineName: string;
  dosage?: string | null;
  frequency: string;
  foodTiming: FoodTiming;
  scheduledTime: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  instructions?: string | null;
  status: 'PENDING' | 'TAKEN' | 'SKIPPED' | 'MISSED';
  actionTime?: string | null;
  historyId?: string | null;
  reminder: MedicationReminderDto;
}

export interface TodayScheduleGroupDto {
  morning: TodayScheduleItemDto[];
  afternoon: TodayScheduleItemDto[];
  evening: TodayScheduleItemDto[];
  night: TodayScheduleItemDto[];
  totalDoses: number;
  takenDoses: number;
  skippedDoses: number;
  missedDoses: number;
  pendingDoses: number;
}

export interface MedicationAdherenceAnalyticsDto {
  patientId: string;
  weeklyAdherencePercentage: number;
  monthlyAdherencePercentage: number;
  complianceScore: number;
  streakDays: number;
  totalScheduledDoses: number;
  takenCount: number;
  skippedCount: number;
  missedCount: number;
  dailyBreakdown: {
    date: string;
    dayName: string;
    taken: number;
    missed: number;
    skipped: number;
    total: number;
    adherenceRate: number;
  }[];
  monthlyBreakdown?: {
    week: string;
    adherenceRate: number;
    taken: number;
    missed: number;
  }[];
}

export interface AiChatDto {
  message: string;
  contextType?: string;
  contextId?: string;
}

export interface AiChatResponseDto {
  answer: string;
  sources?: string[];
}

export interface SearchQueryDto {
  query: string;
  facilityId?: string;
  category?: string;
}

export interface Patient360Dto {
  patient: PatientProfileDto;
  vitals: VitalSignDto[];
  diagnoses: DiagnosisDto[];
  prescriptions: PrescriptionDto[];
  medicationReminders: MedicationReminderDto[];
  encounters: ClinicalEncounterDto[];
  labOrders: LabOrderDto[];
}

export interface DischargeSummaryDto {
  summaryNumber: string;
  admission: AdmissionDto;
  patient: PatientProfileDto;
  facility: FacilityDto;
  department: DepartmentDto;
  attendingDoctor?: DoctorProfileDto;
  bedLocation?: {
    bedNumber: string;
    roomNumber?: string;
    wardName?: string;
    wardType?: string;
  } | null;
  vitals: VitalSignDto[];
  diagnoses: DiagnosisDto[];
  clinicalNotes: ClinicalNoteDto[];
  prescriptions: PrescriptionDto[];
  generatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}

export interface UnifiedDashboardMetricsDto {
  bedOccupancy: {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    reservedBeds: number;
    occupancyRate: number;
    byType: Record<string, { total: number; occupied: number; available: number; reserved: number }>;
  };
  admissionTrends: {
    date: string;
    admissions: number;
    discharges: number;
  }[];
  medicationAdherence: {
    overallComplianceScore: number;
    totalScheduledDoses: number;
    takenDoses: number;
    missedDoses: number;
    skippedDoses: number;
    adherenceRate: number;
  };
  emergencyMonitoring: {
    activeSosRequests: number;
    dispatchedAmbulances: number;
    availableAmbulances: number;
    avgResponseTimeMinutes: number;
    criticalBedHeadroom: number;
  };
  hospitalUtilization: {
    averageLengthOfStayDays: number;
    bedTurnoverRate: number;
    icuLoadPercentage: number;
    emergencyOccupancyPercentage: number;
  };
}

