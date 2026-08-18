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
  organizationId: string;
  facilityId?: string;
  role?: RoleDto;
  organization?: OrganizationDto;
  facility?: FacilityDto;
  patientProfile?: PatientProfileDto;
  doctorProfile?: DoctorProfileDto;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
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
}

export enum ReminderStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  patientId: string;
  doctorId: string;
  facilityId: string;
  departmentId: string;
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
  createdAt: string;
}

export interface MedicationReminderDto {
  id: string;
  patientId: string;
  prescriptionItemId: string;
  scheduledTime: string;
  frequency: string;
  status: ReminderStatus;
  lastTakenAt?: string;
  skippedAt?: string;
  lastNotifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  prescriptionItem?: any;
}

export interface CreateMedicationReminderDto {
  prescriptionItemId: string;
  scheduledTime: string; // e.g. "08:00" or "08:00, 20:00"
  frequency?: string;
  startDate?: string;
  endDate?: string;
  times?: string[];
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
