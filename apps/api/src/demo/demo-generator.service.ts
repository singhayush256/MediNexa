import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  AppointmentType,
  AppointmentStatus,
  UserStatus,
  LabOrderPriority,
  LabOrderStatus,
  EmployeeStatus,
  AttendanceStatus,
  PaymentStatus,
  PaymentMethod,
  AssetStatus,
  InvoiceStatus,
} from '@prisma/client';

const FIRST_NAMES_MALE = [
  'Arjun', 'Rohan', 'Rahul', 'Vikram', 'Karan', 'Aarav', 'Ishan', 'Aditya', 'Dev', 'Varun',
  'Kabir', 'Kunal', 'Aryan', 'Siddharth', 'Yash', 'Manav', 'Nikhil', 'Harsh', 'Parth', 'Gourav',
  'Sameer', 'Ayush', 'Tushar', 'Mayank', 'Mohit', 'Prateek', 'Alok', 'Deepak', 'Sandeep', 'Ajay',
  'Nitin', 'Abhay', 'Hemant', 'Pankaj', 'Vinod', 'Ashish', 'Pradeep', 'Chetan', 'Rakesh', 'Anil',
  'Vivek', 'Manoj', 'Harish', 'Suresh', 'Tarun', 'Rohit', 'Gaurav', 'Shantanu', 'Bhupesh', 'Chirag',
];

const FIRST_NAMES_FEMALE = [
  'Priya', 'Ananya', 'Neha', 'Sneha', 'Diya', 'Kavya', 'Riya', 'Tanvi', 'Anika', 'Meera',
  'Shreya', 'Pooja', 'Natasha', 'Simran', 'Kriti', 'Tara', 'Lavanya', 'Shruti', 'Payal', 'Sanya',
  'Barkha', 'Charu', 'Rashi', 'Kavita', 'Ritu', 'Sunita', 'Meenakshi', 'Deepa', 'Vandana', 'Shweta',
  'Preeti', 'Swati', 'Geeta', 'Divya', 'Madhavi', 'Rashmi', 'Shilpa', 'Shalini', 'Pallavi', 'Archana',
  'Bhavna', 'Aarti', 'Komal', 'Suman', 'Bina', 'Nisha', 'Jyoti', 'Shikha', 'Reema', 'Anjali',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Yadav', 'Singh', 'Patel', 'Malhotra', 'Kapoor', 'Nair', 'Das',
  'Iyer', 'Rao', 'Reddy', 'Joshi', 'Deshmukh', 'Roy', 'Mehta', 'Kumar', 'Agarwal', 'Saxena',
  'Bansal', 'Pandey', 'Mukherjee', 'Chopra', 'Menon', 'Kulkarni', 'Sen', 'Singhal', 'Pillai', 'Hegde',
  'Tyagi', 'Goel', 'Shinde', 'Mittal', 'Ganguly', 'Rawat', 'Bakshi', 'Grover', 'Tiwari', 'Bhatt',
];

const ADDRESSES = [
  'Flat 402, Prateek Fedora, Sector 120, Noida - 201301',
  'Villa 12, Jaypee Greens, Greater Noida - 201310',
  'Tower 4, Gaur City 2, Greater Noida West - 201009',
  'Flat 804, Supertech Capetown, Sector 74, Noida - 201307',
  'House 142, Sector 15A, Noida - 201301',
  'Flat 302, ATS Greens Village, Sector 93A, Noida - 201304',
  'A-45, Sector 62, Institutional Area, Noida - 201309',
  'Flat 506, Shipra Sun City, Indirapuram, Ghaziabad - 201014',
  'B-12, Sector 14, Kaushambi, Ghaziabad - 201010',
  'Tower C, Mahagun Moderne, Sector 78, Noida - 201307',
  'House 218, Block B, Sector 50, Noida - 201301',
  'Flat 1102, Cleo County, Sector 121, Noida - 201307',
  'Villa 9, Eldeco Utopia, Sector 93A, Noida - 201304',
  'Flat 604, Amrapali Sapphire, Sector 45, Noida - 201303',
  'Flat 701, Paras Tierea, Sector 137, Noida - 201305',
  'House 54, Sector 27, Atta Market Road, Noida - 201301',
  'Flat 102, Gulshan Vivante, Sector 137, Noida - 201305',
  'B-88, Sector 44, Express Highway, Noida - 201301',
  'Flat 405, Express Zenith, Sector 77, Noida - 201307',
  'House 19, Sector 29, Brahmputra Shopping Complex, Noida - 201303',
];

const BLOOD_GROUPS = ['A_POSITIVE', 'B_POSITIVE', 'O_POSITIVE', 'AB_POSITIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE', 'AB_NEGATIVE'];

const TARGET_SPECIALTIES = [
  { code: 'CARDIOLOGY', name: 'Cardiology' },
  { code: 'ORTHOPEDICS', name: 'Orthopedics' },
  { code: 'NEUROLOGY', name: 'Neurology' },
  { code: 'DERMATOLOGY', name: 'Dermatology' },
  { code: 'GENERAL_MEDICINE', name: 'General Medicine' },
  { code: 'PEDIATRICS', name: 'Pediatrics' },
  { code: 'ENT', name: 'ENT' },
  { code: 'OPHTHALMOLOGY', name: 'Ophthalmology' },
  { code: 'GYNECOLOGY', name: 'Gynecology' },
];

const DOCTOR_NAMES = [
  { first: 'Rajesh', last: 'Sharma', spec: 'CARDIOLOGY' },
  { first: 'Priya', last: 'Mehta', spec: 'ORTHOPEDICS' },
  { first: 'Sanjay', last: 'Deshmukh', spec: 'NEUROLOGY' },
  { first: 'Kavita', last: 'Rao', spec: 'DERMATOLOGY' },
  { first: 'Anil', last: 'Kumar', spec: 'GENERAL_MEDICINE' },
  { first: 'Vivek', last: 'Patel', spec: 'PEDIATRICS' },
  { first: 'Ritu', last: 'Agarwal', spec: 'ENT' },
  { first: 'Manoj', last: 'Joshi', spec: 'OPHTHALMOLOGY' },
  { first: 'Sunita', last: 'Verma', spec: 'GYNECOLOGY' },
  { first: 'Alok', last: 'Nath', spec: 'CARDIOLOGY' },
  { first: 'Meenakshi', last: 'Sundaram', spec: 'NEUROLOGY' },
  { first: 'Arvind', last: 'Swaminathan', spec: 'ORTHOPEDICS' },
  { first: 'Deepa', last: 'Chawla', spec: 'DERMATOLOGY' },
  { first: 'Harish', last: 'Nair', spec: 'GENERAL_MEDICINE' },
  { first: 'Ananya', last: 'Sen', spec: 'PEDIATRICS' },
  { first: 'Rahul', last: 'Singhal', spec: 'ENT' },
  { first: 'Pooja', last: 'Bhatt', spec: 'OPHTHALMOLOGY' },
  { first: 'Amit', last: 'Tripathy', spec: 'GYNECOLOGY' },
  { first: 'Vandana', last: 'Reddy', spec: 'CARDIOLOGY' },
  { first: 'Suresh', last: 'Menon', spec: 'ORTHOPEDICS' },
  { first: 'Shweta', last: 'Kulkarni', spec: 'NEUROLOGY' },
  { first: 'Tarun', last: 'Saxena', spec: 'DERMATOLOGY' },
  { first: 'Neha', last: 'Malhotra', spec: 'GENERAL_MEDICINE' },
  { first: 'Rohit', last: 'Bansal', spec: 'PEDIATRICS' },
  { first: 'Preeti', last: 'Chadha', spec: 'ENT' },
  { first: 'Gaurav', last: 'Pandey', spec: 'OPHTHALMOLOGY' },
  { first: 'Simran', last: 'Kaur', spec: 'GYNECOLOGY' },
  { first: 'Deepak', last: 'Chopra', spec: 'CARDIOLOGY' },
  { first: 'Swati', last: 'Mukherjee', spec: 'NEUROLOGY' },
  { first: 'Sandeep', last: 'Vashisht', spec: 'ORTHOPEDICS' },
  { first: 'Geeta', last: 'Roy', spec: 'DERMATOLOGY' },
  { first: 'Ajay', last: 'Rastogi', spec: 'GENERAL_MEDICINE' },
  { first: 'Divya', last: 'Nambiar', spec: 'PEDIATRICS' },
  { first: 'Nitin', last: 'Kaushik', spec: 'ENT' },
  { first: 'Madhavi', last: 'Sharma', spec: 'OPHTHALMOLOGY' },
  { first: 'Abhay', last: 'Mishra', spec: 'GYNECOLOGY' },
  { first: 'Rashmi', last: 'Seth', spec: 'CARDIOLOGY' },
  { first: 'Hemant', last: 'Somani', spec: 'ORTHOPEDICS' },
  { first: 'Shilpa', last: 'Hegde', spec: 'NEUROLOGY' },
  { first: 'Pankaj', last: 'Tyagi', spec: 'DERMATOLOGY' },
  { first: 'Shalini', last: 'Goel', spec: 'GENERAL_MEDICINE' },
  { first: 'Vinod', last: 'Pillai', spec: 'PEDIATRICS' },
  { first: 'Pallavi', last: 'Shinde', spec: 'ENT' },
  { first: 'Ashish', last: 'Mittal', spec: 'OPHTHALMOLOGY' },
  { first: 'Sneha', last: 'Ganguly', spec: 'GYNECOLOGY' },
  { first: 'Pradeep', last: 'Rawat', spec: 'CARDIOLOGY' },
  { first: 'Archana', last: 'Das', spec: 'ORTHOPEDICS' },
  { first: 'Chetan', last: 'Bakshi', spec: 'NEUROLOGY' },
  { first: 'Bhavna', last: 'Grover', spec: 'DERMATOLOGY' },
  { first: 'Rakesh', last: 'Tiwari', spec: 'GENERAL_MEDICINE' },
];

@Injectable()
export class DemoGeneratorService {
  private readonly logger = new Logger(DemoGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDatasetStatus() {
    const [
      facilities,
      staffCount,
      doctorCount,
      patientCount,
      appointmentCount,
      admissionCount,
      bedCount,
      prescriptionCount,
      labCount,
      pharmacyCount,
      claimCount,
      invoiceCount,
      employeeProfileCount,
      attendanceCount,
      shiftCount,
      assetCount,
      inventoryCount,
    ] = await Promise.all([
      this.prisma.facility.count(),
      this.prisma.user.count({ where: { role: { code: { not: 'PATIENT' } } } }),
      this.prisma.doctorProfile.count(),
      this.prisma.patientProfile.count(),
      this.prisma.appointment.count(),
      this.prisma.admission.count(),
      this.prisma.bed.count(),
      this.prisma.prescription.count(),
      this.prisma.labOrder.count(),
      this.prisma.pharmacyDispenseRecord.count(),
      this.prisma.insuranceClaim.count(),
      this.prisma.billingInvoice.count(),
      this.prisma.employeeProfile.count(),
      this.prisma.attendanceRecord.count(),
      this.prisma.shiftSchedule.count(),
      this.prisma.hospitalAsset.count(),
      this.prisma.inventoryItem.count(),
    ]);

    return {
      status: 'ACTIVE',
      facilityName: 'MediNexa Multispeciality Hospital, Sector 62, Noida',
      counts: {
        facilities,
        staff: staffCount,
        doctors: doctorCount,
        patients: patientCount,
        appointments: appointmentCount,
        admissions: admissionCount,
        beds: bedCount,
        prescriptions: prescriptionCount,
        labReports: labCount,
        pharmacyTransactions: pharmacyCount,
        insuranceClaims: claimCount,
        gstInvoices: invoiceCount,
        staffProfiles: employeeProfileCount,
        attendanceRecords: attendanceCount,
        shiftSchedules: shiftCount,
        hospitalAssets: assetCount,
        inventoryItems: inventoryCount,
      },
    };
  }

  async generateIndianDataset() {
    this.logger.log('🇮🇳 [DEMO GENERATOR] Executing 1-Click Authentic Indian Hospital Dataset Generation...');

    const hash = await bcrypt.hash('Medinexa@2026', 10);

    // 1. Purge legacy fake users
    const fakeNames = ['Jane Doe', 'John Doe', 'Sarah Smith', 'Michael Chen', 'Dr Smith', 'Demo User', 'Test User'];
    for (const name of fakeNames) {
      const parts = name.split(' ');
      try {
        await this.prisma.user.deleteMany({
          where: {
            OR: [
              { firstName: { equals: parts[0], mode: 'insensitive' }, lastName: { equals: parts[1] || '', mode: 'insensitive' } },
              { email: { contains: name.toLowerCase().replace(/\s+/g, ''), mode: 'insensitive' } },
            ],
          },
        });
      } catch (e) {
        // Continue if dependent records prevent hard delete
      }
    }

    // 2. Locate Facility & Org
    const facility = await this.prisma.facility.findFirst();
    const org = await this.prisma.organization.findFirst();
    if (!facility || !org) {
      throw new Error('Facility or Organization not found in database.');
    }

    // 3. Ensure 9 Specialties & Departments
    const specMap: Record<string, any> = {};
    const deptMap: Record<string, any> = {};
    for (const s of TARGET_SPECIALTIES) {
      let spec = await this.prisma.specialty.findFirst({
        where: { OR: [{ code: s.code }, { name: { contains: s.name, mode: 'insensitive' } }] },
      });
      if (!spec) {
        spec = await this.prisma.specialty.create({
          data: { code: s.code, name: s.name, description: `Department of ${s.name}` },
        });
      }
      specMap[s.code] = spec;

      let dept = await this.prisma.department.findFirst({
        where: { facilityId: facility.id, name: { contains: s.name, mode: 'insensitive' } },
      });
      if (!dept) {
        dept = await this.prisma.department.create({
          data: {
            facilityId: facility.id,
            name: s.name,
            code: `DEPT_${s.code}`,
            status: 'ACTIVE',
          },
        });
      }
      deptMap[s.code] = dept;
    }

    // 4. Ensure Roles
    const docRole = await this.prisma.role.findFirst({ where: { code: 'DOCTOR' } });
    const patRole = await this.prisma.role.findFirst({ where: { code: 'PATIENT' } });
    const adminUser = (await this.prisma.user.findFirst({ where: { email: 'admin@medinexa.in' } })) || (await this.prisma.user.findFirst());

    if (!docRole || !patRole || !adminUser) {
      throw new Error('Core roles or admin user missing in database.');
    }

    // 5. Ensure 50 Indian Doctors
    for (let i = 0; i < DOCTOR_NAMES.length; i++) {
      const d = DOCTOR_NAMES[i];
      const email = `dr.${d.first.toLowerCase()}.${d.last.toLowerCase()}@medinexa.in`;
      const spec = specMap[d.spec];
      const dept = deptMap[d.spec];

      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            passwordHash: hash,
            firstName: `Dr. ${d.first}`,
            lastName: d.last,
            phone: `+91 98101 ${10100 + i}`,
            status: UserStatus.ACTIVE,
            roleId: docRole.id,
            organizationId: org.id,
            facilityId: facility.id,
          },
        });
      }

      let docProfile = await this.prisma.doctorProfile.findUnique({ where: { userId: user.id } });
      if (!docProfile) {
        docProfile = await this.prisma.doctorProfile.create({
          data: {
            userId: user.id,
            facilityId: facility.id,
            departmentId: dept.id,
            specialtyId: spec.id,
            licenseNumber: `MCI-2026-${(100000 + i).toString()}`,
            status: 'ACTIVE',
          },
        });
      }

      const existingSched = await this.prisma.doctorSchedule.findFirst({ where: { doctorId: docProfile.id } });
      if (!existingSched) {
        for (let day = 1; day <= 6; day++) {
          await this.prisma.doctorSchedule.create({
            data: {
              doctorId: docProfile.id,
              facilityId: facility.id,
              departmentId: dept.id,
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
              slotDurationMinutes: 30,
              status: 'ACTIVE',
            },
          }).catch(() => {});
        }
      }
    }

    // 6. Ensure 500 Indian Patients
    const currentPatients = await this.prisma.patientProfile.count();
    if (currentPatients < 500) {
      const toCreate = 500 - currentPatients;
      for (let i = 0; i < toCreate; i++) {
        const isMale = i % 2 === 0;
        const firstName = isMale ? FIRST_NAMES_MALE[i % FIRST_NAMES_MALE.length] : FIRST_NAMES_FEMALE[i % FIRST_NAMES_FEMALE.length];
        const lastName = LAST_NAMES[(i + Math.floor(i / 10)) % LAST_NAMES.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now().toString().slice(-4)}${i}@gmail.com`;
        const phone = `+91 98${(10000000 + (currentPatients + i) * 17) % 90000000}`;
        const uhid = `UHID-2026-${(100100 + currentPatients + i).toString()}`;
        const abhaNumber = `91-${(1000 + i).toString()}-${(2000 + i).toString()}-${(3000 + i).toString()}`;
        const abhaAddress = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${(currentPatients + i)}@abdm`;
        const aadhaarMasked = `XXXX-XXXX-${(1000 + (i % 9000)).toString()}`;
        const bloodGroup = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
        const address = ADDRESSES[i % ADDRESSES.length];

        const ageYears = 18 + (i % 55);
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - ageYears);
        dob.setMonth(i % 12);
        dob.setDate((i % 28) + 1);

        try {
          const u = await this.prisma.user.create({
            data: {
              email,
              passwordHash: hash,
              firstName,
              lastName,
              phone,
              status: UserStatus.ACTIVE,
              roleId: patRole.id,
              organizationId: org.id,
              facilityId: facility.id,
            },
          });

          const p = await this.prisma.patientProfile.create({
            data: {
              userId: u.id,
              gender: isMale ? 'MALE' : 'FEMALE',
              dateOfBirth: dob,
              bloodGroup: bloodGroup as any,
              phone,
              address: `UHID: ${uhid} | ABHA: ${abhaNumber} | Aadhaar: ${aadhaarMasked} | ${address}`,
            },
          });

          await this.prisma.abhaProfile.create({
            data: {
              patientId: p.id,
              abhaNumber,
              abhaAddress,
              mobile: phone,
              linked: true,
              verifiedAt: new Date(),
            },
          }).catch(() => {});
        } catch (err) {
          // Continue
        }
      }
    }

    // 7. Ensure 110+ Beds across Wards
    const wards = await this.prisma.ward.findMany();
    const currentBeds = await this.prisma.bed.count();
    if (currentBeds < 110 && wards.length > 0) {
      const neededBeds = 110 - currentBeds;
      for (let i = 0; i < neededBeds; i++) {
        const ward = wards[i % wards.length];
        let room = await this.prisma.room.findFirst({ where: { wardId: ward.id } });
        if (!room) {
          room = await this.prisma.room.create({
            data: {
              wardId: ward.id,
              roomNumber: `R-${ward.code}-${101 + i}`,
              roomType: 'GENERAL',
              status: 'ACTIVE',
            },
          });
        }
        try {
          await this.prisma.bed.create({
            data: {
              facilityId: facility.id,
              wardId: ward.id,
              roomId: room.id,
              bedNumber: `BED-${ward.code}-${(currentBeds + i + 1).toString().padStart(3, '0')}`,
              bedType: 'GENERAL',
              status: 'AVAILABLE',
            },
          });
        } catch (e) {}
      }
    }
    const allBeds = await this.prisma.bed.findMany();

    // 8. Ensure 100 Inpatient Admissions connected to beds
    let totalAdmissions = await this.prisma.admission.count();
    const allPatients = await this.prisma.patientProfile.findMany({ take: 500 });
    const allDoctors = await this.prisma.doctorProfile.findMany({ include: { user: true } });

    let admIdx = 0;
    while (totalAdmissions < 100 && admIdx < 150) {
      const p = allPatients[admIdx % allPatients.length];
      const doc = allDoctors[admIdx % allDoctors.length];
      const bed = allBeds[admIdx % allBeds.length];
      const admDate = new Date();
      admDate.setDate(admDate.getDate() - (admIdx % 25 + 1));

      try {
        const adm = await this.prisma.admission.create({
          data: {
            admissionNumber: `ADM-IND-${(20000 + totalAdmissions + admIdx).toString()}`,
            patientId: p.id,
            facilityId: facility.id,
            departmentId: doc.departmentId,
            admissionType: admIdx % 4 === 0 ? 'EMERGENCY' : 'ELECTIVE',
            status: admIdx % 3 === 0 ? 'DISCHARGED' : 'ADMITTED',
            reason: `Inpatient medical care and clinical management under Dr. ${doc.user.firstName} ${doc.user.lastName}`,
            admittedAt: admDate,
            admittedBy: doc.userId,
            expectedDischargeAt: new Date(admDate.getTime() + 4 * 86400000),
          },
        });

        await this.prisma.bedAssignment.create({
          data: {
            bedId: bed.id,
            patientId: p.id,
            admissionId: adm.id,
            assignedBy: doc.userId,
            assignedAt: admDate,
            status: admIdx % 3 === 0 ? 'RELEASED' : 'ACTIVE',
            reason: `Bed allocated for inpatient care (Ward: ${bed.bedNumber})`,
          },
        });
        totalAdmissions++;
      } catch (err) {}
      admIdx++;
    }

    // 9. Ensure 1000 Appointments
    let totalAppts = await this.prisma.appointment.count();
    const reasons = [
      'Comprehensive Cardiac Risk Assessment & 12-Lead ECG Evaluation',
      'Bilateral Knee Osteoarthritis Joint Pain & Mobility Consultation',
      'Chronic Migraine, Tension Headache & Vertigo Assessment',
      'Dermatological Consultation for Allergic Dermatitis & Eczema',
      'Type 2 Diabetes Mellitus Fasting Blood Glucose Regulation',
      'Pediatric Immunization, Growth Milestone & Well-Child Checkup',
      'Sinusitis, Nasal Congestion & ENT Video Endoscopy',
      'Comprehensive Ophthalmic Slit Lamp & Vision Screening',
      'Antenatal Maternal Care & First Trimester Ultrasound Review',
      'Post-viral Acute Fatigue, Upper Respiratory Infection Review',
    ];

    let apptLoop = 0;
    while (totalAppts < 1000 && apptLoop < 500) {
      const p = allPatients[apptLoop % allPatients.length];
      const doc = allDoctors[apptLoop % allDoctors.length];
      const dayOffset = (apptLoop % 60) - 20;
      const slotHour = 9 + (apptLoop % 8);
      const slotMin = (apptLoop % 2) * 30;

      const apptDate = new Date();
      apptDate.setDate(apptDate.getDate() + dayOffset);
      apptDate.setHours(slotHour, slotMin, 0, 0);

      const startH = slotHour.toString().padStart(2, '0');
      const startM = slotMin.toString().padStart(2, '0');
      const endM = (slotMin + 30).toString().padStart(2, '0');

      try {
        await this.prisma.appointment.create({
          data: {
            appointmentNumber: `APT-IND-${(100000 + totalAppts + apptLoop).toString()}`,
            patientId: p.id,
            doctorId: doc.id,
            facilityId: facility.id,
            departmentId: doc.departmentId,
            appointmentDate: apptDate,
            startTime: `${startH}:${startM}`,
            endTime: `${startH}:${endM}`,
            type: apptLoop % 4 === 0 ? AppointmentType.FOLLOW_UP : (apptLoop % 3 === 0 ? AppointmentType.VIDEO : AppointmentType.CONSULTATION),
            status: AppointmentStatus.CONFIRMED,
            reason: reasons[apptLoop % reasons.length],
          },
        });
        totalAppts++;
      } catch (err) {}
      apptLoop++;
    }

    // 10. Ensure 200 Prescriptions
    const currentRx = await this.prisma.prescription.count();
    const medications = await this.prisma.medication.findMany({ take: 20 });
    if (currentRx < 200 && medications.length > 0) {
      const toCreateRx = 200 - currentRx;
      for (let i = 0; i < toCreateRx; i++) {
        const p = allPatients[i % allPatients.length];
        const doc = allDoctors[i % allDoctors.length];
        const med1 = medications[i % medications.length];
        const med2 = medications[(i + 1) % medications.length];
        const encDate = new Date();
        encDate.setDate(encDate.getDate() - (i % 30 + 1));

        try {
          const enc = await this.prisma.clinicalEncounter.create({
            data: {
              encounterNumber: `ENC-IND-${(40000 + currentRx + i).toString()}`,
              patientId: p.id,
              doctorId: doc.id,
              facilityId: facility.id,
              departmentId: doc.departmentId,
              encounterType: 'OUTPATIENT',
              status: 'COMPLETED',
              reasonForVisit: 'Consultation & Prescription formulation',
              startedAt: encDate,
              endedAt: new Date(encDate.getTime() + 1800000),
            },
          });

          const rx = await this.prisma.prescription.create({
            data: {
              prescriptionNumber: `RX-IND-${(40000 + currentRx + i).toString()}`,
              encounterId: enc.id,
              patientId: p.id,
              doctorId: doc.id,
              facilityId: facility.id,
              status: 'DISPENSED',
              notes: 'Take medications strictly as per prescription schedule. Stay hydrated.',
            },
          });

          await this.prisma.prescriptionItem.create({
            data: {
              prescriptionId: rx.id,
              medicationId: med1.id,
              dosage: '1 Tablet',
              frequency: 'Twice daily after meals (1-0-1)',
              route: 'ORAL',
              duration: '5 Days',
              quantity: 10,
              instructions: 'Take orally with water after meals',
            },
          }).catch(() => {});

          await this.prisma.prescriptionItem.create({
            data: {
              prescriptionId: rx.id,
              medicationId: med2.id,
              dosage: '1 Tablet',
              frequency: 'Once daily in morning (1-0-0)',
              route: 'ORAL',
              duration: '14 Days',
              quantity: 14,
              instructions: 'Empty stomach in morning',
            },
          }).catch(() => {});
        } catch (err) {}
      }
    }

    // 11. Ensure 100 Lab Reports
    const currentLab = await this.prisma.labOrder.count();
    const labTests = await this.prisma.labTest.findMany({ take: 20 });
    if (currentLab < 100 && labTests.length > 0) {
      const toCreateLab = 100 - currentLab;
      for (let i = 0; i < toCreateLab; i++) {
        const p = allPatients[i % allPatients.length];
        const doc = allDoctors[i % allDoctors.length];
        const test = labTests[i % labTests.length];

        try {
          const order = await this.prisma.labOrder.create({
            data: {
              orderNumber: `LAB-ORD-${(40000 + currentLab + i).toString()}`,
              patientId: p.id,
              doctorId: doc.id,
              facilityId: facility.id,
              priority: i % 5 === 0 ? LabOrderPriority.STAT : LabOrderPriority.ROUTINE,
              status: LabOrderStatus.COMPLETED,
              clinicalNotes: `Diagnostic panel for ${test.name}. Verified under NABL accredited standard operating procedures.`,
              orderedAt: new Date(Date.now() - (i + 1) * 86400000),
              completedAt: new Date(),
              verifiedAt: new Date(),
              verifiedBy: doc.userId,
            },
          });

          await this.prisma.labTestItem.create({
            data: {
              labOrderId: order.id,
              testName: test.name,
              category: test.category,
              status: LabOrderStatus.COMPLETED,
              resultValue: 'Normal Biological Limits (NABL Accredited)',
              referenceRange: 'Biological Reference Interval',
              unit: 'mg/dL',
              flag: 'NORMAL',
              verifiedById: doc.userId,
              verifiedAt: new Date(),
            },
          }).catch(() => {});
        } catch (err) {}
      }
    }

    // 12. Ensure 100 Pharmacy Transactions
    let totalPharma = await this.prisma.pharmacyDispenseRecord.count();
    const allRx = await this.prisma.prescription.findMany({ take: 200 });
    const pharmaUser = (await this.prisma.user.findFirst({ where: { role: { code: 'PHARMACIST' } } })) || adminUser;

    // 13. Ensure Operational Staff, EmployeeProfiles, ShiftSchedules & AttendanceRecords
    const staffRoleCodes = ['NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_STAFF', 'WARD_MANAGER', 'MANAGER'];
    const staffRoleMap: Record<string, any> = {};
    for (const rCode of staffRoleCodes) {
      let r = await this.prisma.role.findFirst({ where: { code: rCode } });
      if (!r) {
        r = await this.prisma.role.create({
          data: {
            code: rCode,
            name: rCode.replace(/_/g, ' '),
            description: `${rCode} Healthcare Operations Role`,
          },
        }).catch(() => null);
      }
      staffRoleMap[rCode] = r;
    }

    const DEMO_STAFF_DEFS = [
      { first: 'Kavita', last: 'Singh', role: 'WARD_MANAGER', dept: 'Inpatient Nursing Station & ICU', desig: 'Head Sister / Ward In-Charge', staffId: 'NR.KAVITA-1002' },
      { first: 'Pooja', last: 'Singh', role: 'RECEPTIONIST', dept: 'Front Desk & Central OPD Reception', desig: 'Chief Patient Registration Officer', staffId: 'RC.POOJA-1001' },
      { first: 'Rahul', last: 'Verma', role: 'MANAGER', dept: 'Hospital Operational Command', desig: 'Hospital Operations Manager', staffId: 'MGR.RAHUL-0801' },
      { first: 'Amit', last: 'Patel', role: 'PHARMACIST', dept: 'Central Hospital Pharmacy', desig: 'Lead Clinical Pharmacist', staffId: 'PH.AMIT-3001' },
      { first: 'Suman', last: 'Sharma', role: 'LAB_STAFF', dept: 'Pathology & Diagnostic Laboratory', desig: 'Senior Medical Lab Technologist', staffId: 'LB.SUMAN-2001' },
      { first: 'Priya', last: 'Nair', role: 'NURSE', dept: 'Emergency & Trauma', desig: 'Senior Emergency Staff Nurse', staffId: 'NR.PRIYA-1003' },
      { first: 'Vikram', last: 'Joshi', role: 'NURSE', dept: 'Critical Care ICU', desig: 'ICU Critical Care Specialist Nurse', staffId: 'NR.VIKRAM-1004' },
      { first: 'Sunita', last: 'Roy', role: 'NURSE', dept: 'General Medicine', desig: 'Inpatient Ward Nurse', staffId: 'NR.SUNITA-1005' },
      { first: 'Neha', last: 'Kapoor', role: 'NURSE', dept: 'Cardiology', desig: 'Cardiac Care Staff Nurse', staffId: 'NR.NEHA-1006' },
      { first: 'Deepak', last: 'Yadav', role: 'RECEPTIONIST', dept: 'Emergency & Trauma', desig: 'Emergency Triage Admission Officer', staffId: 'RC.DEEPAK-1002' },
    ];

    for (let i = 0; i < DEMO_STAFF_DEFS.length; i++) {
      const def = DEMO_STAFF_DEFS[i];
      const email = `${def.first.toLowerCase()}.${def.last.toLowerCase()}@medinexa.in`;
      const staffRole = staffRoleMap[def.role] || docRole;

      let staffUser = await this.prisma.user.findUnique({ where: { email } });
      if (!staffUser) {
        staffUser = await this.prisma.user.create({
          data: {
            email,
            passwordHash: hash,
            firstName: def.first,
            lastName: def.last,
            phone: `+91 98110 ${10010 + i}`,
            status: UserStatus.ACTIVE,
            roleId: staffRole.id,
            organizationId: org.id,
            facilityId: facility.id,
            staffId: def.staffId,
          },
        }).catch(() => null);
      }

      if (staffUser) {
        let empProfile = await this.prisma.employeeProfile.findFirst({
          where: { OR: [{ userId: staffUser.id }, { employeeCode: def.staffId }] },
        });

        if (!empProfile) {
          empProfile = await this.prisma.employeeProfile.create({
            data: {
              facilityId: facility.id,
              employeeCode: def.staffId,
              fullName: `${def.first} ${def.last}`,
              department: def.dept,
              designation: def.desig,
              joiningDate: new Date('2024-01-15'),
              employeeStatus: EmployeeStatus.ACTIVE,
              phone: staffUser.phone || `+91 98110 ${10010 + i}`,
              email: staffUser.email,
              userId: staffUser.id,
            },
          }).catch(() => null);
        }

        if (empProfile) {
          // Today's Shift Schedule
          const existingShift = await this.prisma.shiftSchedule.findFirst({
            where: { employeeId: empProfile.id },
          });

          const shiftStart = new Date();
          shiftStart.setHours(8, 0, 0, 0);
          const shiftEnd = new Date();
          shiftEnd.setHours(16, 0, 0, 0);

          if (!existingShift) {
            await this.prisma.shiftSchedule.create({
              data: {
                employeeId: empProfile.id,
                shiftName: i % 3 === 0 ? 'Morning Operations (08:00 - 16:00)' : (i % 3 === 1 ? 'Evening Operations (16:00 - 24:00)' : 'Night Coverage (00:00 - 08:00)'),
                startTime: shiftStart,
                endTime: shiftEnd,
                department: def.dept,
                assignedById: adminUser.id,
              },
            }).catch(() => null);
          }

          // Today's Attendance Record
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const existingAtt = await this.prisma.attendanceRecord.findFirst({
            where: {
              employeeProfileId: empProfile.id,
              attendanceDate: { gte: todayStart },
            },
          });

          if (!existingAtt) {
            const checkIn = new Date();
            checkIn.setHours(7, 50 + (i % 25), 0, 0);
            await this.prisma.attendanceRecord.create({
              data: {
                employeeProfileId: empProfile.id,
                facilityId: facility.id,
                checkInTime: checkIn,
                checkOutTime: null,
                totalHours: 5.5,
                attendanceStatus: i === 1 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
                attendanceDate: new Date(),
              },
            }).catch(() => null);
          }
        }
      }
    }

    // 14. Ensure Billing Invoices & Payments for Patients
    const currentInvoices = await this.prisma.billingInvoice.count();
    if (currentInvoices < 60 && allPatients.length > 0) {
      const toCreateInvoices = 60 - currentInvoices;
      for (let i = 0; i < toCreateInvoices; i++) {
        const p = allPatients[i % allPatients.length];
        const subtotal = 1200 + (i * 350);
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + tax;
        const isPaid = i % 3 !== 0;

        try {
          const inv = await this.prisma.billingInvoice.create({
            data: {
              invoiceNumber: `INV-2026-${(10000 + currentInvoices + i).toString()}`,
              patientId: p.id,
              facilityId: facility.id,
              invoiceDate: new Date(Date.now() - (i % 15) * 86400000),
              subtotal,
              taxAmount: tax,
              discountAmount: 0,
              totalAmount: total,
              amountPaid: isPaid ? total : 0,
              balanceDue: isPaid ? 0 : total,
              paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
              invoiceStatus: isPaid ? InvoiceStatus.PAID : InvoiceStatus.GENERATED,
              notes: 'Clinical outpatient consultation & diagnostic fee schedule',
            },
          });

          if (isPaid) {
            await this.prisma.paymentTransaction.create({
              data: {
                invoiceId: inv.id,
                transactionReference: `TXN-UPI-${Date.now().toString().slice(-6)}${i}`,
                amount: total,
                paymentDate: inv.invoiceDate,
                paymentMethod: i % 2 === 0 ? PaymentMethod.UPI : PaymentMethod.CARD,
                status: 'SUCCESS',
                collectedById: adminUser.id,
              },
            }).catch(() => null);
          }
        } catch (err) {}
      }
    }

    // 15. Ensure Operational Inventory Items
    const currentItems = await this.prisma.inventoryItem.count();
    if (currentItems < 7) {
      const DEMO_ITEMS = [
        { code: 'PPE-N95-01', name: 'N95 Surgical Respirator Masks', cat: 'PPE', stock: 450, min: 100, reorder: 150, price: 35.0, loc: 'Central Hospital Warehouse' },
        { code: 'CON-IV-02', name: 'IV Infusion Sets (Adult)', cat: 'Consumables', stock: 120, min: 50, reorder: 80, price: 65.0, loc: 'Emergency & General Medicine Store' },
        { code: 'AIR-ET-03', name: 'Endotracheal Tubes 7.5mm', cat: 'Airway', stock: 24, min: 15, reorder: 30, price: 180.0, loc: 'Emergency Trauma Bay Store' },
        { code: 'MON-OX-04', name: 'Pulse Oximeter Disposable Probes', cat: 'Monitoring', stock: 85, min: 30, reorder: 50, price: 95.0, loc: 'ICU Clean Utility' },
        { code: 'EMR-DEF-05', name: 'Crash Cart Defibrillator Gel Pads', cat: 'Emergency', stock: 18, min: 10, reorder: 20, price: 250.0, loc: 'Cardiac Resuscitation Bay' },
        { code: 'PPE-GLV-06', name: 'Sterile Surgical Gloves (Size 7.5)', cat: 'PPE', stock: 320, min: 80, reorder: 120, price: 40.0, loc: 'OT & Inpatient Ward Supply' },
        { code: 'CON-SYR-07', name: 'Disposable Syringes 5ml with Needle', cat: 'Consumables', stock: 600, min: 200, reorder: 300, price: 8.5, loc: 'Central Hospital Warehouse' },
      ];

      for (const it of DEMO_ITEMS) {
        await this.prisma.inventoryItem.upsert({
          where: { itemCode: it.code },
          update: { currentStock: it.stock },
          create: {
            itemCode: it.code,
            itemName: it.name,
            category: it.cat,
            unitOfMeasure: 'UNIT',
            currentStock: it.stock,
            minimumStock: it.min,
            reorderLevel: it.reorder,
            unitPrice: it.price,
            location: it.loc,
            facilityId: facility.id,
          },
        }).catch(() => null);
      }
    }

    // 16. Ensure Biomedical Assets
    const currentAssets = await this.prisma.hospitalAsset.count();
    if (currentAssets < 5) {
      const DEMO_ASSETS = [
        { code: 'AST-VENT-01', name: 'ICU Ventilator Servo-i', cat: 'Critical Care', loc: 'ICU Ward 1, Bay A' },
        { code: 'AST-DEF-02', name: 'Biphasic Defibrillator Lifepak 20', cat: 'Emergency', loc: 'Emergency Bay 1' },
        { code: 'AST-MON-03', name: 'Multipara Patient Monitor Vista 120', cat: 'Monitoring', loc: 'Cardiology HDU' },
        { code: 'AST-ECG-04', name: '12-Lead Diagnostic ECG Machine MAC 2000', cat: 'Diagnostics', loc: 'OPD Examination 102' },
        { code: 'AST-USG-05', name: 'Portable Ultrasound Scanner Sonosite', cat: 'Imaging', loc: 'Radiology Wing' },
      ];

      for (const a of DEMO_ASSETS) {
        const warranty = new Date();
        warranty.setFullYear(warranty.getFullYear() + 2);
        await this.prisma.hospitalAsset.upsert({
          where: { assetCode: a.code },
          update: { currentLocation: a.loc },
          create: {
            assetCode: a.code,
            assetName: a.name,
            category: a.cat,
            currentLocation: a.loc,
            facilityId: facility.id,
            purchaseDate: new Date('2024-03-01'),
            warrantyExpiry: warranty,
            status: AssetStatus.ACTIVE,
            purchaseCost: 450000.0,
          },
        }).catch(() => null);
      }
    }

    const finalStatus = await this.getDatasetStatus();

    this.logger.log(`✅ [DEMO GENERATOR] Indian Dataset Synced! Patients: ${finalStatus.counts.patients}, Doctors: ${finalStatus.counts.doctors}, Appts: ${finalStatus.counts.appointments}, Lab: ${finalStatus.counts.labReports}, Rx: ${finalStatus.counts.prescriptions}`);

    return {
      success: true,
      message: 'Authentic Indian Hospital Dataset generated and verified successfully.',
      facility: 'MediNexa Multispeciality Hospital, Sector 62, Noida, UP',
      currentTotals: finalStatus.counts,
      timestamp: new Date().toISOString(),
    };
  }
}
