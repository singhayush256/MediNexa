import {
  PrismaClient,
  UserStatus,
  WardType,
  WardStatus,
  RoomType,
  RoomStatus,
  BedType,
  BedStatus,
  AdmissionType,
  AdmissionStatus,
  AppointmentType,
  AppointmentStatus,
  PaymentStatus,
  InvoiceStatus,
  PaymentMethod,
  InsuranceType,
  PolicyStatus,
  ClaimType,
  ClaimStatus,
  BedBookingStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

function getHash(password: string): string {
  if (typeof bcrypt.hashSync === 'function') {
    return bcrypt.hashSync(password, 10);
  }
  if ((bcrypt as any).default && typeof (bcrypt as any).default.hashSync === 'function') {
    return (bcrypt as any).default.hashSync(password, 10);
  }
  return '$2b$10$e7Z1h9F1G1H1I1J1K1L1M.PlaceholderFallbackHash';
}

// -------------------------------------------------------------
// INDIAN PATIENT DATASET (100 REALISTIC PATIENTS)
// -------------------------------------------------------------
const INDIAN_PATIENTS_DATA = [
  { firstName: 'Aarav', lastName: 'Sharma', gender: 'MALE', dob: '1988-05-14', blood: 'O_POSITIVE', city: 'New Delhi', address: 'Flat 402, Shanti Kunj, Vasant Vihar, New Delhi - 110057', phone: '+91 98765 43210' },
  { firstName: 'Priya', lastName: 'Patel', gender: 'FEMALE', dob: '1992-11-20', blood: 'A_POSITIVE', city: 'Mumbai', address: 'B-12, Lokhandwala Complex, Andheri West, Mumbai - 400053', phone: '+91 98200 12345' },
  { firstName: 'Rajesh', lastName: 'Verma', gender: 'MALE', dob: '1976-03-08', blood: 'B_POSITIVE', city: 'Bengaluru', address: '74, 4th Block, Koramangala, Bengaluru - 560034', phone: '+91 98450 67890' },
  { firstName: 'Sneha', lastName: 'Kulkarni', gender: 'FEMALE', dob: '1995-07-25', blood: 'B_NEGATIVE', city: 'Pune', address: '15/A, Prabhat Road, Erandwane, Pune - 411004', phone: '+91 98901 23456' },
  { firstName: 'Ananya', lastName: 'Iyer', gender: 'FEMALE', dob: '1990-09-12', blood: 'O_POSITIVE', city: 'Chennai', address: 'Flat 3A, Anna Salai, T. Nagar, Chennai - 600017', phone: '+91 98400 34567' },
  { firstName: 'Vikram', lastName: 'Malhotra', gender: 'MALE', dob: '1984-01-30', blood: 'A_POSITIVE', city: 'New Delhi', address: 'C-24, Greater Kailash Part 1, New Delhi - 110048', phone: '+91 98111 45678' },
  { firstName: 'Meera', lastName: 'Reddy', gender: 'FEMALE', dob: '1982-06-18', blood: 'AB_POSITIVE', city: 'Hyderabad', address: 'Plot 18, Road No. 36, Jubilee Hills, Hyderabad - 500033', phone: '+91 98490 56789' },
  { firstName: 'Rohan', lastName: 'Gupta', gender: 'MALE', dob: '1996-12-04', blood: 'O_POSITIVE', city: 'Gurugram', address: 'Tower 5, DLF Phase 5, Golf Course Road, Gurugram - 122002', phone: '+91 98180 67890' },
  { firstName: 'Kavita', lastName: 'Nair', gender: 'FEMALE', dob: '1979-08-22', blood: 'A_NEGATIVE', city: 'Kochi', address: '22/104, Panampilly Nagar, Kochi - 682036', phone: '+91 98470 78901' },
  { firstName: 'Siddharth', lastName: 'Joshi', gender: 'MALE', dob: '1986-04-15', blood: 'B_POSITIVE', city: 'Ahmedabad', address: '8, Shivalik High Street, Vastrapur, Ahmedabad - 380015', phone: '+91 98250 89012' },
  { firstName: 'Pooja', lastName: 'Bhatt', gender: 'FEMALE', dob: '1993-10-09', blood: 'O_POSITIVE', city: 'Dehradun', address: 'Rajpur Road, Near Clock Tower, Dehradun - 248001', phone: '+91 98370 90123' },
  { firstName: 'Arjun', lastName: 'Mukherjee', gender: 'MALE', dob: '1985-02-27', blood: 'A_POSITIVE', city: 'Kolkata', address: 'Tower 3, Apt 804, South City, Kolkata - 700068', phone: '+91 98300 01234' },
  { firstName: 'Sunita', lastName: 'Das', gender: 'FEMALE', dob: '1974-11-05', blood: 'B_POSITIVE', city: 'Bhubaneswar', address: 'Plot 102, Saheed Nagar, Bhubaneswar - 751007', phone: '+91 98610 12345' },
  { firstName: 'Aditya', lastName: 'Rao', gender: 'MALE', dob: '1991-07-19', blood: 'O_NEGATIVE', city: 'Bengaluru', address: 'Indiranagar 100 Feet Road, Bengaluru - 560038', phone: '+91 98860 23456' },
  { firstName: 'Karan', lastName: 'Singhania', gender: 'MALE', dob: '1980-09-03', blood: 'AB_NEGATIVE', city: 'Mumbai', address: 'Maker Chambers, Nariman Point, Mumbai - 400021', phone: '+91 98210 34567' },
  { firstName: 'Ritu', lastName: 'Choudhary', gender: 'FEMALE', dob: '1987-12-14', blood: 'A_POSITIVE', city: 'Jaipur', address: 'B-8, C-Scheme, Ashok Nagar, Jaipur - 302001', phone: '+91 98290 45678' },
  { firstName: 'Sanjay', lastName: 'Deshmukh', gender: 'MALE', dob: '1968-05-29', blood: 'O_POSITIVE', city: 'Nagpur', address: 'Ramdaspeth, Wardha Road, Nagpur - 440010', phone: '+91 98220 56789' },
  { firstName: 'Neha', lastName: 'Gupta', gender: 'FEMALE', dob: '1994-03-11', blood: 'B_POSITIVE', city: 'Chandigarh', address: 'Sector 8-C, Madhya Marg, Chandigarh - 160018', phone: '+91 98140 67890' },
  { firstName: 'Varun', lastName: 'Nambiar', gender: 'MALE', dob: '1989-10-26', blood: 'O_POSITIVE', city: 'Thiruvananthapuram', address: 'Vellayambalam, Kowdiar Road, Trivandrum - 695003', phone: '+91 98460 78901' },
  { firstName: 'Swati', lastName: 'Trivedi', gender: 'FEMALE', dob: '1992-01-17', blood: 'A_POSITIVE', city: 'Lucknow', address: 'Hazratganj, Park Road, Lucknow - 226001', phone: '+91 98390 89012' },
  { firstName: 'Manish', lastName: 'Saxena', gender: 'MALE', dob: '1978-08-31', blood: 'B_POSITIVE', city: 'Indore', address: 'Vijay Nagar, Scheme 54, Indore - 452010', phone: '+91 98260 90123' },
  { firstName: 'Deepa', lastName: 'Nair', gender: 'FEMALE', dob: '1983-04-02', blood: 'O_POSITIVE', city: 'Kozhikode', address: 'Mavoor Road, Kozhikode - 673004', phone: '+91 98471 01234' },
  { firstName: 'Alok', lastName: 'Mishra', gender: 'MALE', dob: '1975-06-12', blood: 'A_POSITIVE', city: 'Varanasi', address: 'Sigra Mehmoorganj Road, Varanasi - 221010', phone: '+91 98391 12345' },
  { firstName: 'Tanvi', lastName: 'Joshi', gender: 'FEMALE', dob: '1997-09-08', blood: 'B_NEGATIVE', city: 'Vadodara', address: 'Alkapuri, RC Dutt Road, Vadodara - 390007', phone: '+91 98240 23456' },
  { firstName: 'Rahul', lastName: 'Sen', gender: 'MALE', dob: '1986-11-23', blood: 'O_POSITIVE', city: 'Kolkata', address: 'Salt Lake City, Sector 1, Kolkata - 700064', phone: '+91 98310 34567' },
  { firstName: 'Kavita', lastName: 'Pillai', gender: 'FEMALE', dob: '1981-02-14', blood: 'AB_POSITIVE', city: 'Chennai', address: 'Besant Nagar 4th Main Road, Chennai - 600090', phone: '+91 98410 45678' },
  { firstName: 'Harish', lastName: 'Bhattacharya', gender: 'MALE', dob: '1965-07-04', blood: 'O_POSITIVE', city: 'Guwahati', address: 'GS Road, Dispur, Guwahati - 781005', phone: '+91 98640 56789' },
  { firstName: 'Shweta', lastName: 'Hegde', gender: 'FEMALE', dob: '1991-03-28', blood: 'A_POSITIVE', city: 'Mangaluru', address: 'Kadri Hills, Mangaluru - 575004', phone: '+91 98451 67890' },
  { firstName: 'Nikhil', lastName: 'Mehra', gender: 'MALE', dob: '1988-12-16', blood: 'B_POSITIVE', city: 'Ludhiana', address: 'Sarabha Nagar, Ferozepur Road, Ludhiana - 141001', phone: '+91 98150 78901' },
  { firstName: 'Divya', lastName: 'Kapoor', gender: 'FEMALE', dob: '1993-05-01', blood: 'O_POSITIVE', city: 'New Delhi', address: 'Model Town 2, New Delhi - 110009', phone: '+91 98102 89012' },
  { firstName: 'Rohit', lastName: 'Bansal', gender: 'MALE', dob: '1984-08-19', blood: 'A_POSITIVE', city: 'Surat', address: 'Ghod Dod Road, Surat - 395007', phone: '+91 98251 90123' },
  { firstName: 'Smita', lastName: 'Chawla', gender: 'FEMALE', dob: '1977-10-30', blood: 'B_POSITIVE', city: 'Amritsar', address: 'Mall Road, Amritsar - 143001', phone: '+91 98141 01234' },
  { firstName: 'Tarun', lastName: 'Sethi', gender: 'MALE', dob: '1990-04-25', blood: 'O_POSITIVE', city: 'Kanpur', address: 'Swaroop Nagar, Kanpur - 208002', phone: '+91 98392 12345' },
  { firstName: 'Monika', lastName: 'Menon', gender: 'FEMALE', dob: '1989-07-07', blood: 'AB_POSITIVE', city: 'Kochi', address: 'Kaloor Kadavanthra Road, Kochi - 682017', phone: '+91 98472 23456' },
  { firstName: 'Gaurav', lastName: 'Tiwari', gender: 'MALE', dob: '1983-01-13', blood: 'A_NEGATIVE', city: 'Patna', address: 'Bailey Road, Patna - 800001', phone: '+91 98350 34567' },
  { firstName: 'Ankita', lastName: 'Pandey', gender: 'FEMALE', dob: '1995-11-18', blood: 'B_POSITIVE', city: 'Ranchi', address: 'Circular Road, Lalpur, Ranchi - 834001', phone: '+91 98351 45678' },
  { firstName: 'Kishore', lastName: 'Subramanian', gender: 'MALE', dob: '1972-09-24', blood: 'O_POSITIVE', city: 'Coimbatore', address: 'Race Course Road, Coimbatore - 641018', phone: '+91 98420 56789' },
  { firstName: 'Pallavi', lastName: 'Ranganathan', gender: 'FEMALE', dob: '1994-06-03', blood: 'A_POSITIVE', city: 'Madurai', address: 'KK Nagar, Madurai - 625020', phone: '+91 98430 67890' },
  { firstName: 'Vikas', lastName: 'Dubey', gender: 'MALE', dob: '1987-03-21', blood: 'B_POSITIVE', city: 'Gwalior', address: 'City Centre, Gwalior - 474011', phone: '+91 98261 78901' },
  { firstName: 'Shalini', lastName: 'Swaminathan', gender: 'FEMALE', dob: '1986-12-09', blood: 'O_POSITIVE', city: 'Tiruchirappalli', address: 'Thillai Nagar, Trichy - 620018', phone: '+91 98421 89012' },
  { firstName: 'Ashwin', lastName: 'Kumar', gender: 'MALE', dob: '1992-08-15', blood: 'A_POSITIVE', city: 'Mysuru', address: 'Gokulam 3rd Stage, Mysuru - 570002', phone: '+91 98452 90123' },
  { firstName: 'Geetanjali', lastName: 'Sinha', gender: 'FEMALE', dob: '1990-02-28', blood: 'B_POSITIVE', city: 'Jamshedpur', address: 'Bistupur Main Road, Jamshedpur - 831001', phone: '+91 98352 01234' },
  { firstName: 'Prakash', lastName: 'Gowda', gender: 'MALE', dob: '1970-10-10', blood: 'O_POSITIVE', city: 'Bengaluru', address: 'Jayanagar 4th Block, Bengaluru - 560011', phone: '+91 98861 12345' },
  { firstName: 'Nisha', lastName: 'Bhardwaj', gender: 'FEMALE', dob: '1996-04-06', blood: 'AB_POSITIVE', city: 'Noida', address: 'Sector 50, Noida - 201301', phone: '+91 98181 23456' },
  { firstName: 'Manmohan', lastName: 'Sood', gender: 'MALE', dob: '1962-06-25', blood: 'A_POSITIVE', city: 'Shimla', address: 'The Mall, Shimla - 171001', phone: '+91 98160 34567' },
  { firstName: 'Bhavna', lastName: 'Chauhan', gender: 'FEMALE', dob: '1985-01-19', blood: 'O_POSITIVE', city: 'Meerut', address: 'Civil Lines, Meerut - 250001', phone: '+91 98371 45678' },
  { firstName: 'Dinesh', lastName: 'Khatri', gender: 'MALE', dob: '1981-05-16', blood: 'B_POSITIVE', city: 'Jodhpur', address: 'Shastri Nagar, Jodhpur - 342003', phone: '+91 98291 56789' },
  { firstName: 'Aparna', lastName: 'Vaidya', gender: 'FEMALE', dob: '1993-09-22', blood: 'A_POSITIVE', city: 'Thane', address: 'Ghodbunder Road, Thane West - 400607', phone: '+91 98201 67890' },
  { firstName: 'Mukesh', lastName: 'Ambavat', gender: 'MALE', dob: '1977-11-12', blood: 'O_POSITIVE', city: 'Rajkot', address: 'Yagnik Road, Rajkot - 360001', phone: '+91 98252 78901' },
  { firstName: 'Payal', lastName: 'Somani', gender: 'FEMALE', dob: '1991-08-04', blood: 'B_NEGATIVE', city: 'Bhopal', address: 'Arera Colony E-3, Bhopal - 462016', phone: '+91 98262 89012' },
  // Additional 50 Patients
  { firstName: 'Abhinav', lastName: 'Kashyap', gender: 'MALE', dob: '1994-07-11', blood: 'O_POSITIVE', city: 'New Delhi', address: 'Saket J-Block, New Delhi - 110017', phone: '+91 98103 11101' },
  { firstName: 'Rashmi', lastName: 'Namboodiri', gender: 'FEMALE', dob: '1988-02-19', blood: 'A_POSITIVE', city: 'Thrissur', address: 'Round West, Thrissur - 680001', phone: '+91 98473 11102' },
  { firstName: 'Prashant', lastName: 'Shukla', gender: 'MALE', dob: '1982-12-01', blood: 'B_POSITIVE', city: 'Prayagraj', address: 'Civil Lines, MG Marg, Prayagraj - 211001', phone: '+91 98393 11103' },
  { firstName: 'Madhavi', lastName: 'Deshpande', gender: 'FEMALE', dob: '1979-05-18', blood: 'O_POSITIVE', city: 'Nashik', address: 'College Road, Nashik - 422005', phone: '+91 98221 11104' },
  { firstName: 'Girish', lastName: 'Bhat', gender: 'MALE', dob: '1990-10-15', blood: 'A_POSITIVE', city: 'Udupi', address: 'Car Street, Udupi - 576101', phone: '+91 98453 11105' },
  { firstName: 'Kiran', lastName: 'Bedi', gender: 'FEMALE', dob: '1992-03-30', blood: 'B_POSITIVE', city: 'Jalandhar', address: 'Model Town, Jalandhar - 144003', phone: '+91 98151 11106' },
  { firstName: 'Hemant', lastName: 'Prajapati', gender: 'MALE', dob: '1985-09-09', blood: 'O_POSITIVE', city: 'Gandhinagar', address: 'Sector 21, Gandhinagar - 382021', phone: '+91 98241 11107' },
  { firstName: 'Sonali', lastName: 'Bendre', gender: 'FEMALE', dob: '1986-06-21', blood: 'AB_POSITIVE', city: 'Mumbai', address: 'Pali Hill, Bandra West, Mumbai - 400050', phone: '+91 98202 11108' },
  { firstName: 'Umesh', lastName: 'Yadav', gender: 'MALE', dob: '1978-04-14', blood: 'A_POSITIVE', city: 'Varanasi', address: 'Lanka, BHU Road, Varanasi - 221005', phone: '+91 98394 11109' },
  { firstName: 'Sarita', lastName: 'Devi', gender: 'FEMALE', dob: '1973-11-28', blood: 'O_POSITIVE', city: 'Haridwar', address: 'Ranipur More, Haridwar - 249401', phone: '+91 98372 11110' },
  { firstName: 'Rajeev', lastName: 'Rathore', gender: 'MALE', dob: '1981-08-08', blood: 'B_POSITIVE', city: 'Kota', address: 'Talwandi, Kota - 324005', phone: '+91 98292 11111' },
  { firstName: 'Chitra', lastName: 'Ramachandran', gender: 'FEMALE', dob: '1991-01-25', blood: 'O_POSITIVE', city: 'Salem', address: 'Fairlands, Salem - 636016', phone: '+91 98422 11112' },
  { firstName: 'Sameer', lastName: 'Kapadia', gender: 'MALE', dob: '1989-11-04', blood: 'A_POSITIVE', city: 'Navi Mumbai', address: 'Sector 17, Vashi, Navi Mumbai - 400703', phone: '+91 98203 11113' },
  { firstName: 'Vandana', lastName: 'Lulla', gender: 'FEMALE', dob: '1984-07-16', blood: 'B_POSITIVE', city: 'Kalyan', address: 'Chikan Ghar, Kalyan West - 421301', phone: '+91 98204 11114' },
  { firstName: 'Manoj', lastName: 'Bajpayee', gender: 'MALE', dob: '1969-04-23', blood: 'O_POSITIVE', city: 'Bettiah', address: 'Station Road, Bettiah - 845438', phone: '+91 98353 11115' },
  { firstName: 'Anuradha', lastName: 'Paudwal', gender: 'FEMALE', dob: '1971-10-27', blood: 'A_POSITIVE', city: 'Mumbai', address: 'Chembur East, Mumbai - 400071', phone: '+91 98205 11116' },
  { firstName: 'Jagdish', lastName: 'Bhagwati', gender: 'MALE', dob: '1964-02-15', blood: 'O_POSITIVE', city: 'Ahmedabad', address: 'Navrangpura, Ahmedabad - 380009', phone: '+91 98253 11117' },
  { firstName: 'Lalita', lastName: 'Pawar', gender: 'FEMALE', dob: '1975-09-02', blood: 'B_POSITIVE', city: 'Kolhapur', address: 'Rajarampuri, Kolhapur - 416008', phone: '+91 98222 11118' },
  { firstName: 'Kailash', lastName: 'Kher', gender: 'MALE', dob: '1973-07-07', blood: 'O_POSITIVE', city: 'Meerut', address: 'Shastri Nagar, Meerut - 250004', phone: '+91 98373 11119' },
  { firstName: 'Ila', lastName: 'Arun', gender: 'FEMALE', dob: '1966-03-15', blood: 'A_POSITIVE', city: 'Jodhpur', address: 'Ratanada, Jodhpur - 342011', phone: '+91 98293 11120' },
  { firstName: 'Bhupen', lastName: 'Hazarika', gender: 'MALE', dob: '1960-09-08', blood: 'O_POSITIVE', city: 'Guwahati', address: 'Nizarapar, Guwahati - 781003', phone: '+91 98641 11121' },
  { firstName: 'Mamata', lastName: 'Banerjee', gender: 'FEMALE', dob: '1965-01-05', blood: 'B_POSITIVE', city: 'Kolkata', address: 'Kalighat, Kolkata - 700026', phone: '+91 98301 11122' },
  { firstName: 'Shashi', lastName: 'Tharoor', gender: 'MALE', dob: '1968-03-09', blood: 'A_POSITIVE', city: 'Thiruvananthapuram', address: 'Vazhuthacaud, Trivandrum - 695014', phone: '+91 98461 11123' },
  { firstName: 'Nirmala', lastName: 'Sitharaman', gender: 'FEMALE', dob: '1970-08-18', blood: 'O_POSITIVE', city: 'Madurai', address: 'Tallakulam, Madurai - 625002', phone: '+91 98431 11124' },
  { firstName: 'Raghuram', lastName: 'Rajan', gender: 'MALE', dob: '1963-02-03', blood: 'B_POSITIVE', city: 'Bhopal', address: 'Shamla Hills, Bhopal - 462013', phone: '+91 98263 11125' },
  { firstName: 'Arundhati', lastName: 'Roy', gender: 'FEMALE', dob: '1961-11-24', blood: 'O_POSITIVE', city: 'Shillong', address: 'Laitumkhrah, Shillong - 793003', phone: '+91 98630 11126' },
  { firstName: 'Amartya', lastName: 'Sen', gender: 'MALE', dob: '1958-11-03', blood: 'A_POSITIVE', city: 'Santiniketan', address: 'Bolpur, Santiniketan - 731204', phone: '+91 98311 11127' },
  { firstName: 'Medha', lastName: 'Patkar', gender: 'FEMALE', dob: '1964-12-01', blood: 'B_POSITIVE', city: 'Mumbai', address: 'Dadar West, Mumbai - 400028', phone: '+91 98206 11128' },
  { firstName: 'Sabeer', lastName: 'Bhatia', gender: 'MALE', dob: '1968-12-30', blood: 'O_POSITIVE', city: 'Chandigarh', address: 'Sector 9, Chandigarh - 160009', phone: '+91 98142 11129' },
  { firstName: 'Kalpana', lastName: 'Chawla', gender: 'FEMALE', dob: '1962-03-17', blood: 'A_POSITIVE', city: 'Karnal', address: 'Model Town, Karnal - 132001', phone: '+91 98120 11130' },
  { firstName: 'Narayan', lastName: 'Murthy', gender: 'MALE', dob: '1956-08-20', blood: 'O_POSITIVE', city: 'Mysuru', address: 'Jayalakshmipuram, Mysuru - 570012', phone: '+91 98454 11131' },
  { firstName: 'Sudha', lastName: 'Murty', gender: 'FEMALE', dob: '1959-08-19', blood: 'B_POSITIVE', city: 'Hubballi', address: 'Deshpande Nagar, Hubballi - 580029', phone: '+91 98455 11132' },
  { firstName: 'Azim', lastName: 'Premji', gender: 'MALE', dob: '1955-07-24', blood: 'A_POSITIVE', city: 'Bengaluru', address: 'Sarjapur Road, Bengaluru - 560035', phone: '+91 98862 11133' },
  { firstName: 'Indra', lastName: 'Nooyi', gender: 'FEMALE', dob: '1965-10-28', blood: 'O_POSITIVE', city: 'Chennai', address: 'Mylapore, Chennai - 600004', phone: '+91 98411 11134' },
  { firstName: 'Satya', lastName: 'Nadella', gender: 'MALE', dob: '1967-08-19', blood: 'B_POSITIVE', city: 'Hyderabad', address: 'Begumpet, Hyderabad - 500016', phone: '+91 98491 11135' },
  { firstName: 'Kiran', lastName: 'Mazumdar', gender: 'FEMALE', dob: '1963-03-23', blood: 'A_POSITIVE', city: 'Bengaluru', address: 'Electronic City, Bengaluru - 560100', phone: '+91 98863 11136' },
  { firstName: 'Sundar', lastName: 'Pichai', gender: 'MALE', dob: '1972-06-10', blood: 'O_POSITIVE', city: 'Madurai', address: 'Jawahar Nagar, Madurai - 625007', phone: '+91 98432 11137' },
  { firstName: 'Rohini', lastName: 'Nilekani', gender: 'FEMALE', dob: '1969-05-12', blood: 'B_POSITIVE', city: 'Bengaluru', address: 'Sadashivanagar, Bengaluru - 560080', phone: '+91 98456 11138' },
  { firstName: 'Nandan', lastName: 'Nilekani', gender: 'MALE', dob: '1965-06-02', blood: 'O_POSITIVE', city: 'Bengaluru', address: 'Koramangala 3rd Block, Bengaluru - 560034', phone: '+91 98457 11139' },
  { firstName: 'Gita', lastName: 'Gopinath', gender: 'FEMALE', dob: '1971-12-08', blood: 'A_POSITIVE', city: 'Kolkata', address: 'Ballygunge Circular Road, Kolkata - 700019', phone: '+91 98312 11140' },
  { firstName: 'Abhijit', lastName: 'Banerjee', gender: 'MALE', dob: '1961-02-21', blood: 'B_POSITIVE', city: 'Kolkata', address: 'Gariahat Road, Kolkata - 700029', phone: '+91 98313 11141' },
  { firstName: 'Soumya', lastName: 'Swaminathan', gender: 'FEMALE', dob: '1969-05-02', blood: 'O_POSITIVE', city: 'Chennai', address: 'Adyar, Chennai - 600020', phone: '+91 98412 11142' },
  { firstName: 'Venkatraman', lastName: 'Ramakrishnan', gender: 'MALE', dob: '1952-04-01', blood: 'A_POSITIVE', city: 'Chidambaram', address: 'East Car Street, Chidambaram - 608001', phone: '+91 98423 11143' },
  { firstName: 'Tessy', lastName: 'Thomas', gender: 'FEMALE', dob: '1963-04-12', blood: 'O_POSITIVE', city: 'Alappuzha', address: 'Mullakkal, Alappuzha - 688011', phone: '+91 98474 11144' },
  { firstName: 'K Radhakrishnan', lastName: 'Nair', gender: 'MALE', dob: '1959-08-29', blood: 'B_POSITIVE', city: 'Kollam', address: 'Chinnakada, Kollam - 691001', phone: '+91 98475 11145' },
  { firstName: 'Gagandeep', lastName: 'Kang', gender: 'FEMALE', dob: '1972-11-03', blood: 'A_POSITIVE', city: 'Faridabad', address: 'Sector 15, Faridabad - 121007', phone: '+91 98182 11146' },
  { firstName: 'K Sivan', lastName: 'Nadar', gender: 'MALE', dob: '1957-04-14', blood: 'O_POSITIVE', city: 'Nagercoil', address: 'Kanyakumari Road, Nagercoil - 629001', phone: '+91 98424 11147' },
  { firstName: 'Ritu', lastName: 'Karidhal', gender: 'FEMALE', dob: '1975-04-13', blood: 'B_POSITIVE', city: 'Lucknow', address: 'Aliganj Sector B, Lucknow - 226024', phone: '+91 98395 11148' },
  { firstName: 'Mylswamy', lastName: 'Annadurai', gender: 'MALE', dob: '1958-07-02', blood: 'A_POSITIVE', city: 'Coimbatore', address: 'Pollachi Road, Coimbatore - 641021', phone: '+91 98425 11149' },
  { firstName: 'Anuradha', lastName: 'TK', gender: 'FEMALE', dob: '1961-12-14', blood: 'O_POSITIVE', city: 'Bengaluru', address: 'Malleshwaram 8th Cross, Bengaluru - 560003', phone: '+91 98458 11150' },
];

// -------------------------------------------------------------
// 20 INDIAN DOCTORS ACROSS 8 SPECIALTIES
// -------------------------------------------------------------
const INDIAN_DOCTORS_DATA = [
  // Cardiology (3)
  {
    firstName: 'Arvind',
    lastName: 'Deshmukh',
    email: 'dr.deshmukh@medinexa.in',
    phone: '+91 98101 20001',
    specialtyCode: 'CARDIO',
    qualification: 'MBBS, MD (Internal Med), DM (Cardiology), FACC',
    experienceYears: 18,
    regNumber: 'MCI-2006-18492',
    bio: 'Senior Consultant Interventional Cardiologist specializing in primary angioplasty, transcatheter aortic valve replacement (TAVR), and complex coronary interventions.',
    fee: 1000,
  },
  {
    firstName: 'Radhika',
    lastName: 'Swaminathan',
    email: 'dr.swaminathan@medinexa.in',
    phone: '+91 98101 20002',
    specialtyCode: 'CARDIO',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    experienceYears: 14,
    regNumber: 'MCI-2010-23491',
    bio: 'Preventive and clinical cardiologist with expertise in heart failure management, cardiac MRI, and echocardiography.',
    fee: 900,
  },
  {
    firstName: 'Suresh',
    lastName: 'Menon',
    email: 'dr.menon@medinexa.in',
    phone: '+91 98101 20003',
    specialtyCode: 'CARDIO',
    qualification: 'MBBS, MS (General Surgery), MCh (CTVS)',
    experienceYears: 16,
    regNumber: 'MCI-2008-34821',
    bio: 'Cardiothoracic and vascular surgeon with extensive experience in coronary artery bypass grafting (CABG) and minimally invasive valve repair.',
    fee: 1200,
  },

  // Neurology (3)
  {
    firstName: 'Pradeep',
    lastName: 'Chawla',
    email: 'dr.chawla@medinexa.in',
    phone: '+91 98101 20004',
    specialtyCode: 'NEURO',
    qualification: 'MBBS, MD, DM (Neurology), FAAN',
    experienceYears: 15,
    regNumber: 'MCI-2009-45912',
    bio: 'Chief Neurologist focusing on hyperacute ischemic stroke thrombolysis, epilepsy surgery evaluations, and neuro-immunology.',
    fee: 950,
  },
  {
    firstName: 'Sunita',
    lastName: 'Singhal',
    email: 'dr.singhal@medinexa.in',
    phone: '+91 98101 20005',
    specialtyCode: 'NEURO',
    qualification: 'MBBS, MD (Gen Med), DM (Neurology)',
    experienceYears: 12,
    regNumber: 'MCI-2012-56291',
    bio: 'Consultant neurologist with sub-specialty interest in Parkinsons disease, movement disorders, deep brain stimulation (DBS), and refractory migraines.',
    fee: 850,
  },
  {
    firstName: 'Rohit',
    lastName: 'Nambiar',
    email: 'dr.nambiar@medinexa.in',
    phone: '+91 98101 20006',
    specialtyCode: 'NEURO',
    qualification: 'MBBS, DNB (Neurology), MNAMS',
    experienceYears: 10,
    regNumber: 'MCI-2014-67123',
    bio: 'Neurologist specializing in peripheral neuropathies, neuromuscular disorders, electromyography (EMG), and clinical neurophysiology.',
    fee: 800,
  },

  // Orthopedics (3)
  {
    firstName: 'Rajesh',
    lastName: 'Kulkarni',
    email: 'dr.kulkarni@medinexa.in',
    phone: '+91 98101 20007',
    specialtyCode: 'ORTHO',
    qualification: 'MBBS, MS (Orthopedics), MCh (Joint Replacement UK)',
    experienceYears: 17,
    regNumber: 'MCI-2007-78192',
    bio: 'Director of Joint Reconstruction & Arthroscopy. Renowned for robotic-assisted total knee and hip replacements.',
    fee: 1000,
  },
  {
    firstName: 'Manoj',
    lastName: 'Agarwal',
    email: 'dr.agarwal@medinexa.in',
    phone: '+91 98101 20008',
    specialtyCode: 'ORTHO',
    qualification: 'MBBS, MS (Orthopedics)',
    experienceYears: 13,
    regNumber: 'MCI-2011-89102',
    bio: 'Spine and orthopedic surgeon specializing in minimally invasive spine decompression, disc herniation, and spinal deformity correction.',
    fee: 900,
  },
  {
    firstName: 'Harish',
    lastName: 'Venkatesh',
    email: 'dr.venkatesh@medinexa.in',
    phone: '+91 98101 20009',
    specialtyCode: 'ORTHO',
    qualification: 'MBBS, DNB (Orthopedics), Sports Medicine Fellow',
    experienceYears: 11,
    regNumber: 'MCI-2013-90123',
    bio: 'Sports medicine and arthroscopy specialist treating ACL/PCL tears, rotator cuff injuries, and athletic cartilage restoration.',
    fee: 850,
  },

  // Dermatology (2)
  {
    firstName: 'Ananya',
    lastName: 'Sengupta',
    email: 'dr.sengupta@medinexa.in',
    phone: '+91 98101 20010',
    specialtyCode: 'DERMA',
    qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 12,
    regNumber: 'MCI-2012-01234',
    bio: 'Clinical dermatologist and dermatosurgeon with clinical mastery in chronic psoriasis, biological therapies, and auto-immune skin conditions.',
    fee: 750,
  },
  {
    firstName: 'Neha',
    lastName: 'Kapoor',
    email: 'dr.kapoor@medinexa.in',
    phone: '+91 98101 20011',
    specialtyCode: 'DERMA',
    qualification: 'MBBS, DVD, DNB (Dermatology)',
    experienceYears: 9,
    regNumber: 'MCI-2015-12345',
    bio: 'Specialist in clinical dermatology, pediatric skin allergies, acne scarring protocols, and advanced phototherapy.',
    fee: 700,
  },

  // Pediatrics (3)
  {
    firstName: 'Alok',
    lastName: 'Bhargava',
    email: 'dr.bhargava@medinexa.in',
    phone: '+91 98101 20012',
    specialtyCode: 'PEDIA',
    qualification: 'MBBS, MD (Pediatrics), FIAP',
    experienceYears: 16,
    regNumber: 'MCI-2008-23456',
    bio: 'Senior Consultant Pediatrician providing comprehensive child healthcare, immunization counseling, and pediatric intensive care.',
    fee: 800,
  },
  {
    firstName: 'Vandana',
    lastName: 'Hegde',
    email: 'dr.hegde@medinexa.in',
    phone: '+91 98101 20013',
    specialtyCode: 'PEDIA',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    experienceYears: 11,
    regNumber: 'MCI-2013-34567',
    bio: 'Developmental pediatrician specializing in neurodevelopmental screening, pediatric asthma, and growth nutrition.',
    fee: 750,
  },
  {
    firstName: 'Shweta',
    lastName: 'Ghosh',
    email: 'dr.ghosh@medinexa.in',
    phone: '+91 98101 20014',
    specialtyCode: 'PEDIA',
    qualification: 'MBBS, MD (Pediatrics), Neonatology Fellow',
    experienceYears: 8,
    regNumber: 'MCI-2016-45678',
    bio: 'Neonatologist and pediatric care provider managing premature infants, neonatal jaundice, and high-risk pediatric follow-ups.',
    fee: 700,
  },

  // ENT (2)
  {
    firstName: 'Vikramaditya',
    lastName: 'Joshi',
    email: 'dr.joshi@medinexa.in',
    phone: '+91 98101 20015',
    specialtyCode: 'ENT',
    qualification: 'MBBS, MS (Otorhinolaryngology / ENT)',
    experienceYears: 14,
    regNumber: 'MCI-2010-56789',
    bio: 'Senior ENT Head & Neck surgeon with specialization in endoscopic sinus surgery (FESS), cochlear implants, and vertigo management.',
    fee: 800,
  },
  {
    firstName: 'Tarun',
    lastName: 'Mehta',
    email: 'dr.mehta@medinexa.in',
    phone: '+91 98101 20016',
    specialtyCode: 'ENT',
    qualification: 'MBBS, DLO, DNB (ENT)',
    experienceYears: 10,
    regNumber: 'MCI-2014-67890',
    bio: 'ENT surgeon with special clinical interest in micro-ear surgery, voice rehabilitation, snoring, and sleep apnea evaluation.',
    fee: 750,
  },

  // Gynecology & Obstetrics (2)
  {
    firstName: 'Rekha',
    lastName: 'Sundaram',
    email: 'dr.sundaram@medinexa.in',
    phone: '+91 98101 20017',
    specialtyCode: 'GYNAE',
    qualification: 'MBBS, MS (Obstetrics & Gynecology), FICOG',
    experienceYears: 18,
    regNumber: 'MCI-2006-78901',
    bio: 'Director of Obstetrics & High-Risk Pregnancy. Experienced in laparoscopic hysterectomy, maternal-fetal medicine, and reproductive endocrinology.',
    fee: 950,
  },
  {
    firstName: 'Meenakshi',
    lastName: 'Pillai',
    email: 'dr.pillai@medinexa.in',
    phone: '+91 98101 20018',
    specialtyCode: 'GYNAE',
    qualification: 'MBBS, MD (Obstetrics & Gynecology)',
    experienceYears: 13,
    regNumber: 'MCI-2011-89012',
    bio: 'Consultant gynecologist and fertility specialist focusing on PCOS/PCOD management, adolescent health, and operative hysteroscopy.',
    fee: 850,
  },

  // General Medicine (2)
  {
    firstName: 'Deepak',
    lastName: 'Chopra',
    email: 'dr.chopra@medinexa.in',
    phone: '+91 98101 20019',
    specialtyCode: 'GEN_MED',
    qualification: 'MBBS, MD (General Medicine), FICP',
    experienceYears: 20,
    regNumber: 'MCI-2004-90123',
    bio: 'Chief of Internal Medicine. Expert in adult diabetes reversal, hypertension control, metabolic syndrome, and geriatric multi-morbidity.',
    fee: 800,
  },
  {
    firstName: 'Sanjay',
    lastName: 'Bhattacharya',
    email: 'dr.bhattacharya@medinexa.in',
    phone: '+91 98101 20020',
    specialtyCode: 'GEN_MED',
    qualification: 'MBBS, MD (Internal Medicine)',
    experienceYears: 15,
    regNumber: 'MCI-2009-01235',
    bio: 'Consultant physician specializing in tropical infectious diseases (Dengue, Malaria, Typhoid), adult immunizations, and preventive executive health checkups.',
    fee: 750,
  },
];

// -------------------------------------------------------------
// 50 REALISTIC INDIAN NURSES
// -------------------------------------------------------------
const INDIAN_NURSES_DATA = [
  { name: 'Ancy Thomas', email: 'nurse.01@medinexa.in', phone: '+91 98200 30001' },
  { name: 'Bincy Mathew', email: 'nurse.02@medinexa.in', phone: '+91 98200 30002' },
  { name: 'Sunita Pawar', email: 'nurse.03@medinexa.in', phone: '+91 98200 30003' },
  { name: 'Deepa Nair', email: 'nurse.04@medinexa.in', phone: '+91 98200 30004' },
  { name: 'Priya Joseph', email: 'nurse.05@medinexa.in', phone: '+91 98200 30005' },
  { name: 'Kavita Bhosle', email: 'nurse.06@medinexa.in', phone: '+91 98200 30006' },
  { name: 'Mini Varghese', email: 'nurse.07@medinexa.in', phone: '+91 98200 30007' },
  { name: 'Rekha Patil', email: 'nurse.08@medinexa.in', phone: '+91 98200 30008' },
  { name: 'Sangeeta Yadav', email: 'nurse.09@medinexa.in', phone: '+91 98200 30009' },
  { name: 'Latha Krishnan', email: 'nurse.10@medinexa.in', phone: '+91 98200 30010' },
  { name: 'Jancy Kurian', email: 'nurse.11@medinexa.in', phone: '+91 98200 30011' },
  { name: 'Anita Soren', email: 'nurse.12@medinexa.in', phone: '+91 98200 30012' },
  { name: 'Preeti Toppo', email: 'nurse.13@medinexa.in', phone: '+91 98200 30013' },
  { name: 'Sherly George', email: 'nurse.14@medinexa.in', phone: '+91 98200 30014' },
  { name: 'Geetha Balakrishnan', email: 'nurse.15@medinexa.in', phone: '+91 98200 30015' },
  { name: 'Bindu Philip', email: 'nurse.16@medinexa.in', phone: '+91 98200 30016' },
  { name: 'Meena Kumari', email: 'nurse.17@medinexa.in', phone: '+91 98200 30017' },
  { name: 'Pooja Raut', email: 'nurse.18@medinexa.in', phone: '+91 98200 30018' },
  { name: 'Tincy Jacob', email: 'nurse.19@medinexa.in', phone: '+91 98200 30019' },
  { name: 'Shobha Rani', email: 'nurse.20@medinexa.in', phone: '+91 98200 30020' },
  { name: 'Jisha Sebastian', email: 'nurse.21@medinexa.in', phone: '+91 98200 30021' },
  { name: 'Manju Sharma', email: 'nurse.22@medinexa.in', phone: '+91 98200 30022' },
  { name: 'Remya Mohan', email: 'nurse.23@medinexa.in', phone: '+91 98200 30023' },
  { name: 'Usha Thorat', email: 'nurse.24@medinexa.in', phone: '+91 98200 30024' },
  { name: 'Smitha Paul', email: 'nurse.25@medinexa.in', phone: '+91 98200 30025' },
  { name: 'Rani Xavier', email: 'nurse.26@medinexa.in', phone: '+91 98200 30026' },
  { name: 'Archana Mane', email: 'nurse.27@medinexa.in', phone: '+91 98200 30027' },
  { name: 'Daisy Chacko', email: 'nurse.28@medinexa.in', phone: '+91 98200 30028' },
  { name: 'Sarita Kadam', email: 'nurse.29@medinexa.in', phone: '+91 98200 30029' },
  { name: 'Leena Antony', email: 'nurse.30@medinexa.in', phone: '+91 98200 30030' },
  { name: 'Vandana Salve', email: 'nurse.31@medinexa.in', phone: '+91 98200 30031' },
  { name: 'Molly Varghese', email: 'nurse.32@medinexa.in', phone: '+91 98200 30032' },
  { name: 'Snehal More', email: 'nurse.33@medinexa.in', phone: '+91 98200 30033' },
  { name: 'Sindhu Nair', email: 'nurse.34@medinexa.in', phone: '+91 98200 30034' },
  { name: 'Rupali Gaikwad', email: 'nurse.35@medinexa.in', phone: '+91 98200 30035' },
  { name: 'Jolly Abraham', email: 'nurse.36@medinexa.in', phone: '+91 98200 30036' },
  { name: 'Sunila Jadhav', email: 'nurse.37@medinexa.in', phone: '+91 98200 30037' },
  { name: 'Mercy John', email: 'nurse.38@medinexa.in', phone: '+91 98200 30038' },
  { name: 'Pranali Shinde', email: 'nurse.39@medinexa.in', phone: '+91 98200 30039' },
  { name: 'Shiny Peter', email: 'nurse.40@medinexa.in', phone: '+91 98200 30040' },
  { name: 'Asha Bhosle', email: 'nurse.41@medinexa.in', phone: '+91 98200 30041' },
  { name: 'Sujata Kamble', email: 'nurse.42@medinexa.in', phone: '+91 98200 30042' },
  { name: 'Anila Daniel', email: 'nurse.43@medinexa.in', phone: '+91 98200 30043' },
  { name: 'Jyoti Chavan', email: 'nurse.44@medinexa.in', phone: '+91 98200 30044' },
  { name: 'Beena Koshy', email: 'nurse.45@medinexa.in', phone: '+91 98200 30045' },
  { name: 'Varsha Tambe', email: 'nurse.46@medinexa.in', phone: '+91 98200 30046' },
  { name: 'Saly Joseph', email: 'nurse.47@medinexa.in', phone: '+91 98200 30047' },
  { name: 'Komal Sawant', email: 'nurse.48@medinexa.in', phone: '+91 98200 30048' },
  { name: 'Rosamma Varkey', email: 'nurse.49@medinexa.in', phone: '+91 98200 30049' },
  { name: 'Dipali Sonawane', email: 'nurse.50@medinexa.in', phone: '+91 98200 30050' },
];

// -------------------------------------------------------------
// 10 RECEPTIONISTS
// -------------------------------------------------------------
const INDIAN_RECEPTIONISTS_DATA = [
  { name: 'Amit Saxena', email: 'receptionist.01@medinexa.in', phone: '+91 98300 40001' },
  { name: 'Suman Rao', email: 'receptionist.02@medinexa.in', phone: '+91 98300 40002' },
  { name: 'Preeti Mishra', email: 'receptionist.03@medinexa.in', phone: '+91 98300 40003' },
  { name: 'Rahul Tiwari', email: 'receptionist.04@medinexa.in', phone: '+91 98300 40004' },
  { name: 'Pooja Deshmukh', email: 'receptionist.05@medinexa.in', phone: '+91 98300 40005' },
  { name: 'Vikas Pandey', email: 'receptionist.06@medinexa.in', phone: '+91 98300 40006' },
  { name: 'Shalini Nair', email: 'receptionist.07@medinexa.in', phone: '+91 98300 40007' },
  { name: 'Gaurav Sen', email: 'receptionist.08@medinexa.in', phone: '+91 98300 40008' },
  { name: 'Pallavi Chandel', email: 'receptionist.09@medinexa.in', phone: '+91 98300 40009' },
  { name: 'Kunal Ghosh', email: 'receptionist.10@medinexa.in', phone: '+91 98300 40010' },
];

// -------------------------------------------------------------
// 10 LAB TECHNICIANS
// -------------------------------------------------------------
const INDIAN_LAB_TECHS_DATA = [
  { name: 'Ramesh Chandra', email: 'lab.01@medinexa.in', phone: '+91 98400 50001' },
  { name: 'Geeta Pillai', email: 'lab.02@medinexa.in', phone: '+91 98400 50002' },
  { name: 'Suresh Goswami', email: 'lab.03@medinexa.in', phone: '+91 98400 50003' },
  { name: 'Anita Roy', email: 'lab.04@medinexa.in', phone: '+91 98400 50004' },
  { name: 'Mahesh Solanki', email: 'lab.05@medinexa.in', phone: '+91 98400 50005' },
  { name: 'Pinky Mondal', email: 'lab.06@medinexa.in', phone: '+91 98400 50006' },
  { name: 'Hemant Rawat', email: 'lab.07@medinexa.in', phone: '+91 98400 50007' },
  { name: 'Snehal Tambe', email: 'lab.08@medinexa.in', phone: '+91 98400 50008' },
  { name: 'Balwant Negi', email: 'lab.09@medinexa.in', phone: '+91 98400 50009' },
  { name: 'Sarojini Devi', email: 'lab.10@medinexa.in', phone: '+91 98400 50010' },
];

// -------------------------------------------------------------
// 10 PHARMACISTS
// -------------------------------------------------------------
const INDIAN_PHARMACISTS_DATA = [
  { name: 'Sandeep Shinde', email: 'pharmacy.01@medinexa.in', phone: '+91 98500 60001' },
  { name: 'Vinod Trivedi', email: 'pharmacy.02@medinexa.in', phone: '+91 98500 60002' },
  { name: 'Pallavi Joshi', email: 'pharmacy.03@medinexa.in', phone: '+91 98500 60003' },
  { name: 'Naresh Reddy', email: 'pharmacy.04@medinexa.in', phone: '+91 98500 60004' },
  { name: 'Ashok Malviya', email: 'pharmacy.05@medinexa.in', phone: '+91 98500 60005' },
  { name: 'Chetna Barot', email: 'pharmacy.06@medinexa.in', phone: '+91 98500 60006' },
  { name: 'Yogesh Mahajan', email: 'pharmacy.07@medinexa.in', phone: '+91 98500 60007' },
  { name: 'Archana Sawant', email: 'pharmacy.08@medinexa.in', phone: '+91 98500 60008' },
  { name: 'Girish Kothari', email: 'pharmacy.09@medinexa.in', phone: '+91 98500 60009' },
  { name: 'Bhavna Parikh', email: 'pharmacy.10@medinexa.in', phone: '+91 98500 60010' },
];

// -------------------------------------------------------------
// TOP INDIAN HEALTH INSURANCE PROVIDERS
// -------------------------------------------------------------
const INDIAN_INSURANCE_PROVIDERS = [
  { name: 'Star Health and Allied Insurance', code: 'STAR-HEALTH', email: 'claims@starhealth.in', phone: '+91 1800 425 2255' },
  { name: 'HDFC ERGO General Insurance', code: 'HDFC-ERGO', email: 'care@hdfcergo.com', phone: '+91 1800 266 6444' },
  { name: 'ICICI Lombard Health Care', code: 'ICICI-LOMBARD', email: 'customersupport@icicilombard.com', phone: '+91 1800 2666' },
  { name: 'Care Health Insurance (Religare)', code: 'CARE-HEALTH', email: 'customerfirst@careinsurance.com', phone: '+91 1800 102 4455' },
  { name: 'Niva Bupa Health Insurance', code: 'NIVA-BUPA', email: 'customercare@nivabupa.com', phone: '+91 1860 500 8888' },
  { name: 'The New India Assurance Co. Ltd.', code: 'NEW-INDIA', email: 'health.claims@newindia.co.in', phone: '+91 1800 209 1415' },
];

// -------------------------------------------------------------
// ESSENTIAL INDIAN MEDICATIONS
// -------------------------------------------------------------
const INDIAN_MEDICATIONS = [
  { name: 'Dolo 650 (Paracetamol 650mg)', generic: 'Paracetamol', form: 'TABLET', strength: '650mg' },
  { name: 'Telma 40 (Telmisartan 40mg)', generic: 'Telmisartan', form: 'TABLET', strength: '40mg' },
  { name: 'Glycomet 500 (Metformin 500mg)', generic: 'Metformin Hydrochloride', form: 'TABLET', strength: '500mg' },
  { name: 'Atorva 20 (Atorvastatin 20mg)', generic: 'Atorvastatin Calcium', form: 'TABLET', strength: '20mg' },
  { name: 'Augmentin 625 Duo', generic: 'Amoxicillin + Clavulanic Acid', form: 'TABLET', strength: '625mg' },
  { name: 'Pan 40 (Pantoprazole 40mg)', generic: 'Pantoprazole Sodium', form: 'TABLET', strength: '40mg' },
  { name: 'Azee 500 (Azithromycin 500mg)', generic: 'Azithromycin', form: 'TABLET', strength: '500mg' },
  { name: 'Montair LC', generic: 'Montelukast + Levocetirizine', form: 'TABLET', strength: '10mg/5mg' },
  { name: 'Rosuvas 10 (Rosuvastatin 10mg)', generic: 'Rosuvastatin', form: 'TABLET', strength: '10mg' },
  { name: 'Cifran 500 (Ciprofloxacin 500mg)', generic: 'Ciprofloxacin', form: 'TABLET', strength: '500mg' },
];

// -------------------------------------------------------------
// STANDARD DIAGNOSTIC LAB TESTS
// -------------------------------------------------------------
const INDIAN_LAB_TESTS = [
  { name: 'Complete Blood Count (CBC with ESR)', code: 'LAB-CBC', category: 'HEMATOLOGY', price: 450 },
  { name: 'Comprehensive Lipid Profile Panel', code: 'LAB-LIPID', category: 'BIOCHEMISTRY', price: 850 },
  { name: 'Glycated Hemoglobin (HbA1c)', code: 'LAB-HBA1C', category: 'BIOCHEMISTRY', price: 600 },
  { name: 'Liver Function Test (LFT Profile)', code: 'LAB-LFT', category: 'BIOCHEMISTRY', price: 900 },
  { name: 'Kidney Function Test (KFT with Electrolytes)', code: 'LAB-KFT', category: 'BIOCHEMISTRY', price: 850 },
  { name: 'Thyroid Profile Total (T3, T4, TSH)', code: 'LAB-THYROID', category: 'BIOCHEMISTRY', price: 750 },
  { name: 'Digital Chest X-Ray (PA View)', code: 'RAD-XRAY', category: 'RADIOLOGY', price: 650 },
  { name: 'High Resolution Brain MRI Scan', code: 'RAD-MRI', category: 'RADIOLOGY', price: 5500 },
  { name: 'Whole Abdomen & Pelvis Ultrasound (USG)', code: 'RAD-USG', category: 'RADIOLOGY', price: 1400 },
  { name: '12-Lead Resting Electrocardiogram (ECG)', code: 'CARD-ECG', category: 'CARDIOLOGY', price: 350 },
];

async function main() {
  console.log('🇮🇳 ========================================================');
  console.log('🇮🇳 STARTING MEDINEXA FRESH INDIAN HEALTHCARE DATASET SEED');
  console.log('🇮🇳 ========================================================');

  // STEP 1: CLEAN CASCADE-SAFE TRUNCATION
  console.log('🧹 Purging all old demo records, foreign mockups, and placeholder accounts...');
  try {
    await prisma.$executeRawUnsafe(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          IF r.tablename != '_prisma_migrations' THEN
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
          END IF;
        END LOOP;
      END $$;
    `);
    console.log('✅ Entire database wiped clean. Fresh schema state initialized.');
  } catch (err: any) {
    console.warn('⚠️ Notice during raw truncate, continuing:', err.message);
  }

  const defaultPasswordHash = getHash('Password123!');

  // STEP 2: APPLICATION ROLES
  console.log('👑 Seeding system application roles...');
  const rolesList = [
    { code: 'PATIENT', name: 'Patient', description: 'Patient access portal' },
    { code: 'DOCTOR', name: 'Doctor / Physician', description: 'Medical provider access' },
    { code: 'NURSE', name: 'Nurse / Caregiver', description: 'Clinical nursing staff access' },
    { code: 'RECEPTIONIST', name: 'Receptionist / Registrar', description: 'Front desk and intake access' },
    { code: 'LAB_STAFF', name: 'Laboratory Staff', description: 'Pathology & lab management access' },
    { code: 'PHARMACY_STAFF', name: 'Pharmacy Staff', description: 'Pharmacy management access' },
    { code: 'AMBULANCE_DRIVER', name: 'Ambulance Driver', description: 'Emergency response and dispatch access' },
    { code: 'HOSPITAL_ADMIN', name: 'Hospital Administrator', description: 'Facility administrative management' },
    { code: 'MEDINEXA_ADMIN', name: 'MediNexa System Administrator', description: 'Full platform system administration' },
    // Aliases
    { code: 'ADMIN', name: 'Admin Alias', description: 'Hospital Administrator alias' },
    { code: 'SUPER_ADMIN', name: 'Super Admin Alias', description: 'Platform Administrator alias' },
    { code: 'PHARMACIST', name: 'Pharmacist Alias', description: 'Pharmacy staff alias' },
    { code: 'INSURANCE_COORDINATOR', name: 'Insurance Coordinator', description: 'Insurance desk and claims' },
    { code: 'BILLING_STAFF', name: 'Billing Staff', description: 'Hospital billing and cashier' },
    { code: 'HR_MANAGER', name: 'HR Manager', description: 'Human resources and payroll' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesList) {
    const roleRecord = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
    roleMap[r.code] = roleRecord.id;
  }
  console.log(`✅ ${rolesList.length} Roles configured successfully.`);

  // STEP 3: ORGANIZATION & INDIAN HOSPITALS
  console.log('🏥 Seeding Indian healthcare network organizations and facilities...');
  const org = await prisma.organization.create({
    data: {
      name: 'MediNexa Healthcare India Private Limited',
      code: 'MEDINEXA-INDIA',
      type: 'HOSPITAL',
      address: 'MediNexa Tower, 14th Floor, MG Road, Bengaluru - 560001',
      email: 'corporate@medinexa.in',
      phone: '+91 80 4123 4567',
    },
  });

  const facilityDelhi = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'Apollo MediNexa Super Speciality Hospital, New Delhi',
      code: 'MEDINEXA-DELHI',
      address: 'Sarita Vihar, Delhi Mathura Road',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110076',
      phone: '+91 11 2692 5858',
      email: 'delhi@medinexa.in',
      latitude: 28.5398,
      longitude: 77.2882,
      facilityType: 'SUPER_SPECIALITY',
      rating: 4.8,
      servicesOffered: ['Emergency 24x7', 'ICU', 'Oxygen Therapy', 'Ventilator Support', 'Cardiology', 'Neuro Surgery'],
      status: 'ACTIVE',
    },
  });

  const facilitySaket = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'Max MediNexa Super Speciality, Saket',
      code: 'MEDINEXA-SAKET',
      address: '1, 2, Press Enclave Marg, Saket',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110017',
      phone: '+91 11 2651 5050',
      email: 'saket@medinexa.in',
      latitude: 28.5284,
      longitude: 77.2185,
      facilityType: 'SUPER_SPECIALITY',
      rating: 4.7,
      servicesOffered: ['Emergency 24x7', 'ICU', 'Oxygen Therapy', 'Ventilator Support', 'Oncology', 'Organ Transplant'],
      status: 'ACTIVE',
    },
  });

  const facilityOkhla = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'Fortis Escorts Heart & Trauma Institute, Okhla',
      code: 'MEDINEXA-OKHLA',
      address: 'Okhla Road, Sukhdev Vihar Metro Station',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110025',
      phone: '+91 11 4713 5000',
      email: 'okhla@medinexa.in',
      latitude: 28.5615,
      longitude: 77.2798,
      facilityType: 'TERTIARY_CARE',
      rating: 4.6,
      servicesOffered: ['Emergency 24x7', 'Cardiac ICU', 'Ventilator Support', 'Cath Lab', 'Pediatric ICU'],
      status: 'ACTIVE',
    },
  });

  const facilityMumbai = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'Fortis MediNexa Healthcare, Mumbai',
      code: 'MEDINEXA-MUMBAI',
      address: 'Mulund Goregaon Link Road, Bhandup West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400078',
      phone: '+91 22 4365 4365',
      email: 'mumbai@medinexa.in',
      latitude: 19.1663,
      longitude: 72.9365,
      facilityType: 'TERTIARY_CARE',
      rating: 4.7,
      servicesOffered: ['Emergency 24x7', 'ICU', 'Oxygen Therapy', 'Cath Lab', 'Pediatrics'],
      status: 'ACTIVE',
    },
  });

  const facilityBengaluru = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'Manipal MediNexa Hospital, Bengaluru',
      code: 'MEDINEXA-BLR',
      address: '98 HAL Old Airport Road, Kodihalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560017',
      phone: '+91 80 2502 4444',
      email: 'bengaluru@medinexa.in',
      latitude: 12.9587,
      longitude: 77.6496,
      facilityType: 'MULTI_SPECIALITY',
      rating: 4.9,
      servicesOffered: ['Emergency 24x7', 'Critical Care', 'Ventilator Support', 'Robotic Surgery'],
      status: 'ACTIVE',
    },
  });

  console.log('✅ 5 Premier Indian Facilities seeded with GPS coordinates and capabilities.');

  // STEP 4: SPECIALTIES & DEPARTMENTS
  console.log('🩺 Seeding specialties and medical departments...');
  const specialtiesDef = [
    { code: 'CARDIO', name: 'Cardiology', desc: 'Cardiovascular care and interventions' },
    { code: 'NEURO', name: 'Neurology', desc: 'Brain, spine, and nervous system disorders' },
    { code: 'ORTHO', name: 'Orthopedics', desc: 'Bone, joint replacement, and sports trauma' },
    { code: 'DERMA', name: 'Dermatology', desc: 'Clinical dermatology and cutaneous care' },
    { code: 'PEDIA', name: 'Pediatrics', desc: 'Newborn and pediatric child health' },
    { code: 'ENT', name: 'ENT', desc: 'Ear, nose, throat, and head & neck surgery' },
    { code: 'GYNAE', name: 'Gynecology', desc: 'Obstetrics, maternity, and womens health' },
    { code: 'GEN_MED', name: 'General Medicine', desc: 'Internal medicine and primary primary care' },
  ];

  const specialtyMap: Record<string, string> = {};
  for (const s of specialtiesDef) {
    const specRecord = await prisma.specialty.create({
      data: { code: s.code, name: s.name, description: s.desc },
    });
    specialtyMap[s.code] = specRecord.id;
  }

  // Create departments in Delhi facility
  const deptMap: Record<string, string> = {};
  const deptsDelhi = [
    { code: 'CARDIO', name: 'Department of Cardiology' },
    { code: 'NEURO', name: 'Department of Neurology' },
    { code: 'ORTHO', name: 'Department of Orthopedics' },
    { code: 'DERMA', name: 'Department of Dermatology' },
    { code: 'PEDIA', name: 'Department of Pediatrics' },
    { code: 'ENT', name: 'Department of ENT & Head-Neck' },
    { code: 'GYNAE', name: 'Department of Gynecology & Obstetrics' },
    { code: 'GEN_MED', name: 'Department of General Medicine' },
    { code: 'ICU', name: 'Intensive Care Unit (ICU)' },
    { code: 'ER', name: 'Emergency & Trauma Department' },
    { code: 'PATH', name: 'Pathology & Diagnostic Laboratory' },
    { code: 'PHARM', name: 'Central Hospital Pharmacy' },
  ];

  for (const d of deptsDelhi) {
    const deptRecord = await prisma.department.create({
      data: {
        facilityId: facilityDelhi.id,
        code: `DELHI-${d.code}`,
        name: d.name,
        status: 'ACTIVE',
      },
    });
    deptMap[d.code] = deptRecord.id;
  }

  // STEP 5: WARDS, ROOMS & BEDS
  console.log('🛏️ Seeding hospital wards, rooms, and inpatient beds...');
  const wardGenDelhi = await prisma.ward.create({
    data: {
      facilityId: facilityDelhi.id,
      departmentId: deptMap['GEN_MED'],
      name: 'General Medical Ward A',
      code: 'DELHI-WARD-GEN-A',
      wardType: WardType.GENERAL,
      floor: 'Floor 2',
      status: WardStatus.ACTIVE,
    },
  });

  const wardIcuDelhi = await prisma.ward.create({
    data: {
      facilityId: facilityDelhi.id,
      departmentId: deptMap['ICU'],
      name: 'Critical Care ICU Ward',
      code: 'DELHI-WARD-ICU-A',
      wardType: WardType.ICU,
      floor: 'Floor 3',
      status: WardStatus.ACTIVE,
    },
  });

  // Rooms and Beds in Delhi Facility
  const roomGen1 = await prisma.room.create({
    data: {
      wardId: wardGenDelhi.id,
      roomNumber: 'GEN-201',
      roomType: RoomType.GENERAL,
      floor: 'Floor 2',
      capacity: 6,
      status: RoomStatus.ACTIVE,
    },
  });

  const roomIcu1 = await prisma.room.create({
    data: {
      wardId: wardIcuDelhi.id,
      roomNumber: 'ICU-301',
      roomType: RoomType.ICU,
      floor: 'Floor 3',
      capacity: 4,
      status: RoomStatus.ACTIVE,
    },
  });

  // Emergency Ward & Room
  const wardErDelhi = await prisma.ward.create({
    data: {
      facilityId: facilityDelhi.id,
      departmentId: deptMap['ER'],
      name: 'Trauma & Emergency Ward',
      code: 'DELHI-WARD-ER-A',
      wardType: WardType.EMERGENCY,
      floor: 'Ground Floor',
      status: WardStatus.ACTIVE,
    },
  });

  const roomEr1 = await prisma.room.create({
    data: {
      wardId: wardErDelhi.id,
      roomNumber: 'ER-101',
      roomType: RoomType.EMERGENCY,
      floor: 'Ground Floor',
      capacity: 4,
      status: RoomStatus.ACTIVE,
    },
  });

  // Oxygen Ward & Room
  const wardOxyDelhi = await prisma.ward.create({
    data: {
      facilityId: facilityDelhi.id,
      departmentId: deptMap['GEN_MED'],
      name: 'High Dependency Oxygen Ward',
      code: 'DELHI-WARD-OXY-A',
      wardType: WardType.GENERAL,
      floor: 'Floor 1',
      status: WardStatus.ACTIVE,
    },
  });

  const roomOxy1 = await prisma.room.create({
    data: {
      wardId: wardOxyDelhi.id,
      roomNumber: 'OXY-101',
      roomType: RoomType.GENERAL,
      floor: 'Floor 1',
      capacity: 4,
      status: RoomStatus.ACTIVE,
    },
  });

  // Private Wing & Room
  const wardPrivDelhi = await prisma.ward.create({
    data: {
      facilityId: facilityDelhi.id,
      departmentId: deptMap['GEN_MED'],
      name: 'Executive Deluxe Suites',
      code: 'DELHI-WARD-PVT-A',
      wardType: WardType.PRIVATE,
      floor: 'Floor 4',
      status: WardStatus.ACTIVE,
    },
  });

  const roomPriv1 = await prisma.room.create({
    data: {
      wardId: wardPrivDelhi.id,
      roomNumber: 'PVT-401',
      roomType: RoomType.PRIVATE,
      floor: 'Floor 4',
      capacity: 2,
      status: RoomStatus.ACTIVE,
    },
  });

  const seededBeds = [];
  // General Beds (6 beds, mix of statuses)
  const genStatuses = [BedStatus.AVAILABLE, BedStatus.OCCUPIED, BedStatus.AVAILABLE, BedStatus.RESERVED, BedStatus.OCCUPIED, BedStatus.CLEANING];
  for (let i = 1; i <= 6; i++) {
    const bed = await prisma.bed.create({
      data: {
        facilityId: facilityDelhi.id,
        wardId: wardGenDelhi.id,
        roomId: roomGen1.id,
        bedNumber: `BED-GEN-${i}`,
        bedType: BedType.GENERAL,
        status: genStatuses[i - 1],
      },
    });
    seededBeds.push(bed);
  }

  // ICU Beds (4 beds)
  const icuStatuses = [BedStatus.AVAILABLE, BedStatus.OCCUPIED, BedStatus.OCCUPIED, BedStatus.AVAILABLE];
  for (let i = 1; i <= 4; i++) {
    const bed = await prisma.bed.create({
      data: {
        facilityId: facilityDelhi.id,
        wardId: wardIcuDelhi.id,
        roomId: roomIcu1.id,
        bedNumber: `BED-ICU-${i}`,
        bedType: BedType.ICU,
        status: icuStatuses[i - 1],
      },
    });
    seededBeds.push(bed);
  }

  // Emergency Beds (4 beds)
  for (let i = 1; i <= 4; i++) {
    const bed = await prisma.bed.create({
      data: {
        facilityId: facilityDelhi.id,
        wardId: wardErDelhi.id,
        roomId: roomEr1.id,
        bedNumber: `BED-ER-${i}`,
        bedType: BedType.EMERGENCY,
        status: i <= 2 ? BedStatus.AVAILABLE : BedStatus.OCCUPIED,
      },
    });
    seededBeds.push(bed);
  }

  // Oxygen Beds (4 beds)
  for (let i = 1; i <= 4; i++) {
    const bed = await prisma.bed.create({
      data: {
        facilityId: facilityDelhi.id,
        wardId: wardOxyDelhi.id,
        roomId: roomOxy1.id,
        bedNumber: `BED-OXY-${i}`,
        bedType: BedType.OXYGEN,
        status: i === 1 ? BedStatus.OCCUPIED : BedStatus.AVAILABLE,
      },
    });
    seededBeds.push(bed);
  }

  // Ventilator Beds (in ICU ward) (3 beds)
  for (let i = 1; i <= 3; i++) {
    const bed = await prisma.bed.create({
      data: {
        facilityId: facilityDelhi.id,
        wardId: wardIcuDelhi.id,
        roomId: roomIcu1.id,
        bedNumber: `BED-VENT-${i}`,
        bedType: BedType.VENTILATOR,
        status: i === 1 ? BedStatus.OCCUPIED : BedStatus.AVAILABLE,
      },
    });
    seededBeds.push(bed);
  }

  // Private Room Beds (2 beds)
  for (let i = 1; i <= 2; i++) {
    const bed = await prisma.bed.create({
      data: {
        facilityId: facilityDelhi.id,
        wardId: wardPrivDelhi.id,
        roomId: roomPriv1.id,
        bedNumber: `BED-PVT-${i}`,
        bedType: BedType.PRIVATE,
        status: BedStatus.AVAILABLE,
      },
    });
    seededBeds.push(bed);
  }

  // Also seed beds for Saket and Okhla facilities for live nearby calculations
  const deptSaket = await prisma.department.create({
    data: { facilityId: facilitySaket.id, code: 'SAKET-ICU', name: 'Critical Care Dept', status: 'ACTIVE' },
  });
  const wardSaket = await prisma.ward.create({
    data: {
      facilityId: facilitySaket.id,
      departmentId: deptSaket.id,
      name: 'Saket Critical & General Care',
      code: 'SAKET-WARD-MAIN',
      wardType: WardType.ICU,
      status: WardStatus.ACTIVE,
    },
  });
  const roomSaket = await prisma.room.create({
    data: { wardId: wardSaket.id, roomNumber: 'SKT-101', roomType: RoomType.ICU, capacity: 6, status: RoomStatus.ACTIVE },
  });
  await prisma.bed.create({ data: { facilityId: facilitySaket.id, wardId: wardSaket.id, roomId: roomSaket.id, bedNumber: 'SKT-ICU-1', bedType: BedType.ICU, status: BedStatus.AVAILABLE } });
  await prisma.bed.create({ data: { facilityId: facilitySaket.id, wardId: wardSaket.id, roomId: roomSaket.id, bedNumber: 'SKT-VENT-1', bedType: BedType.VENTILATOR, status: BedStatus.AVAILABLE } });
  await prisma.bed.create({ data: { facilityId: facilitySaket.id, wardId: wardSaket.id, roomId: roomSaket.id, bedNumber: 'SKT-OXY-1', bedType: BedType.OXYGEN, status: BedStatus.AVAILABLE } });
  await prisma.bed.create({ data: { facilityId: facilitySaket.id, wardId: wardSaket.id, roomId: roomSaket.id, bedNumber: 'SKT-ER-1', bedType: BedType.EMERGENCY, status: BedStatus.AVAILABLE } });

  const deptOkhla = await prisma.department.create({
    data: { facilityId: facilityOkhla.id, code: 'OKHLA-CARD', name: 'Cardiology Dept', status: 'ACTIVE' },
  });
  const wardOkhla = await prisma.ward.create({
    data: {
      facilityId: facilityOkhla.id,
      departmentId: deptOkhla.id,
      name: 'Okhla Cardiac & Emergency Ward',
      code: 'OKHLA-WARD-MAIN',
      wardType: WardType.CCU,
      status: WardStatus.ACTIVE,
    },
  });
  const roomOkhla = await prisma.room.create({
    data: { wardId: wardOkhla.id, roomNumber: 'OKH-101', roomType: RoomType.ICU, capacity: 6, status: RoomStatus.ACTIVE },
  });
  await prisma.bed.create({ data: { facilityId: facilityOkhla.id, wardId: wardOkhla.id, roomId: roomOkhla.id, bedNumber: 'OKH-ICU-1', bedType: BedType.ICU, status: BedStatus.AVAILABLE } });
  await prisma.bed.create({ data: { facilityId: facilityOkhla.id, wardId: wardOkhla.id, roomId: roomOkhla.id, bedNumber: 'OKH-OXY-1', bedType: BedType.OXYGEN, status: BedStatus.AVAILABLE } });
  await prisma.bed.create({ data: { facilityId: facilityOkhla.id, wardId: wardOkhla.id, roomId: roomOkhla.id, bedNumber: 'OKH-ER-1', bedType: BedType.EMERGENCY, status: BedStatus.AVAILABLE } });

  // STEP 6: ADMIN USERS
  console.log('👤 Seeding System Administrator & Hospital Administrators...');
  await prisma.user.create({
    data: {
      email: 'admin@medinexa.in',
      passwordHash: defaultPasswordHash,
      firstName: 'MediNexa',
      lastName: 'SuperAdmin',
      phone: '+91 98100 11001',
      status: UserStatus.ACTIVE,
      roleId: roleMap['MEDINEXA_ADMIN'],
      organizationId: org.id,
    },
  });

  const hospAdminUser = await prisma.user.create({
    data: {
      email: 'admin.delhi@medinexa.in',
      passwordHash: defaultPasswordHash,
      firstName: 'Rajiv',
      lastName: 'Mehta',
      phone: '+91 98111 22002',
      status: UserStatus.ACTIVE,
      roleId: roleMap['HOSPITAL_ADMIN'],
      organizationId: org.id,
      facilityId: facilityDelhi.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin.mumbai@medinexa.in',
      passwordHash: defaultPasswordHash,
      firstName: 'Sanjay',
      lastName: 'Prabhu',
      phone: '+91 98222 33003',
      status: UserStatus.ACTIVE,
      roleId: roleMap['HOSPITAL_ADMIN'],
      organizationId: org.id,
      facilityId: facilityMumbai.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin.blr@medinexa.in',
      passwordHash: defaultPasswordHash,
      firstName: 'Venkat',
      lastName: 'Subramaniam',
      phone: '+91 98333 44004',
      status: UserStatus.ACTIVE,
      roleId: roleMap['HOSPITAL_ADMIN'],
      organizationId: org.id,
      facilityId: facilityBengaluru.id,
    },
  });

  // STEP 7: 20 INDIAN DOCTORS
  console.log('👨‍⚕️ Seeding 20 Indian Doctors across 8 specialties...');
  const seededDoctorProfiles = [];

  for (const doc of INDIAN_DOCTORS_DATA) {
    const userRecord = await prisma.user.create({
      data: {
        email: doc.email,
        passwordHash: defaultPasswordHash,
        firstName: doc.firstName,
        lastName: doc.lastName,
        phone: doc.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['DOCTOR'],
        organizationId: org.id,
        facilityId: facilityDelhi.id,
      },
    });

    const docProfile = await prisma.doctorProfile.create({
      data: {
        userId: userRecord.id,
        facilityId: facilityDelhi.id,
        departmentId: deptMap[doc.specialtyCode] || deptMap['GEN_MED'],
        specialtyId: specialtyMap[doc.specialtyCode] || specialtyMap['GEN_MED'],
        licenseNumber: doc.regNumber,
        status: 'ACTIVE',
      },
    });

    // Schedule: Monday to Saturday (days 1 to 6) 09:00 - 17:00
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: docProfile.id,
          facilityId: facilityDelhi.id,
          departmentId: docProfile.departmentId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          status: 'ACTIVE',
        },
      });
    }

    seededDoctorProfiles.push({ ...docProfile, user: userRecord });
  }
  console.log(`✅ ${seededDoctorProfiles.length} Indian Doctors & 7-day OPD schedules seeded.`);

  // STEP 8: 50 INDIAN NURSES
  console.log('👩‍⚕️ Seeding 50 Indian Nurses...');
  for (const nurse of INDIAN_NURSES_DATA) {
    const [firstName, ...rest] = nurse.name.split(' ');
    const lastName = rest.join(' ') || 'Nurse';
    await prisma.user.create({
      data: {
        email: nurse.email,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName,
        phone: nurse.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['NURSE'],
        organizationId: org.id,
        facilityId: facilityDelhi.id,
      },
    });
  }
  console.log(`✅ ${INDIAN_NURSES_DATA.length} Indian Nurses seeded.`);

  // STEP 9: 10 RECEPTIONISTS
  console.log('💼 Seeding 10 Receptionists...');
  for (const rec of INDIAN_RECEPTIONISTS_DATA) {
    const [firstName, ...rest] = rec.name.split(' ');
    await prisma.user.create({
      data: {
        email: rec.email,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName: rest.join(' ') || 'FrontDesk',
        phone: rec.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['RECEPTIONIST'],
        organizationId: org.id,
        facilityId: facilityDelhi.id,
      },
    });
  }
  console.log(`✅ ${INDIAN_RECEPTIONISTS_DATA.length} Indian Receptionists seeded.`);

  // STEP 10: 10 LAB TECHNICIANS
  console.log('🔬 Seeding 10 Lab Technicians...');
  for (const lab of INDIAN_LAB_TECHS_DATA) {
    const [firstName, ...rest] = lab.name.split(' ');
    await prisma.user.create({
      data: {
        email: lab.email,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName: rest.join(' ') || 'Technician',
        phone: lab.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['LAB_STAFF'],
        organizationId: org.id,
        facilityId: facilityDelhi.id,
      },
    });
  }
  console.log(`✅ ${INDIAN_LAB_TECHS_DATA.length} Indian Lab Technicians seeded.`);

  // STEP 11: 10 PHARMACISTS
  console.log('💊 Seeding 10 Pharmacists...');
  for (const ph of INDIAN_PHARMACISTS_DATA) {
    const [firstName, ...rest] = ph.name.split(' ');
    await prisma.user.create({
      data: {
        email: ph.email,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName: rest.join(' ') || 'Pharmacist',
        phone: ph.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['PHARMACY_STAFF'],
        organizationId: org.id,
        facilityId: facilityDelhi.id,
      },
    });
  }
  console.log(`✅ ${INDIAN_PHARMACISTS_DATA.length} Indian Pharmacists seeded.`);

  // STEP 12: 100 INDIAN PATIENTS
  console.log('🏥 Seeding 100 Indian Patients with clinical profiles...');
  const seededPatientProfiles = [];

  for (let i = 0; i < INDIAN_PATIENTS_DATA.length; i++) {
    const p = INDIAN_PATIENTS_DATA[i];
    const email = i === 0 ? 'patient@medinexa.in' : `patient.${(i + 1).toString().padStart(2, '0')}@medinexa.in`;

    const userRecord = await prisma.user.create({
      data: {
        email,
        passwordHash: defaultPasswordHash,
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        status: UserStatus.ACTIVE,
        roleId: roleMap['PATIENT'],
        organizationId: org.id,
        facilityId: facilityDelhi.id,
      },
    });

    const patProfile = await prisma.patientProfile.create({
      data: {
        userId: userRecord.id,
        gender: p.gender,
        dateOfBirth: new Date(p.dob),
        bloodGroup: p.blood,
        address: p.address,
        phone: p.phone,
      },
    });

    seededPatientProfiles.push({ ...patProfile, user: userRecord });
  }
  console.log(`✅ ${seededPatientProfiles.length} Indian Patients & Clinical Profiles seeded.`);

  // STEP 13: FORMULARY MEDICATIONS & LAB TESTS
  console.log('📋 Seeding Indian formulary medications and diagnostic tests...');
  const seededMeds = [];
  for (let i = 0; i < INDIAN_MEDICATIONS.length; i++) {
    const m = INDIAN_MEDICATIONS[i];
    const med = await prisma.medication.create({
      data: {
        code: `MED-${(i + 1).toString().padStart(3, '0')}`,
        brandName: m.name,
        genericName: m.generic,
        strength: m.strength,
        dosageForm: m.form,
        route: 'ORAL',
        category: 'GENERAL',
        manufacturer: 'Cipla / Sun Pharma India',
        status: 'ACTIVE',
      },
    });
    seededMeds.push(med);
  }

  const seededLabTests = [];
  for (const lt of INDIAN_LAB_TESTS) {
    const labTest = await prisma.labTest.create({
      data: {
        code: lt.code,
        name: lt.name,
        category: lt.category as any,
        specimenType: lt.category === 'RADIOLOGY' ? 'IMAGING' : 'BLOOD',
        price: lt.price,
        status: 'ACTIVE',
      },
    });
    seededLabTests.push(labTest);
  }

  // STEP 14: INSURANCE PROVIDERS
  console.log('🛡️ Seeding Indian Health Insurance Providers...');
  const seededProviders = [];
  for (const ins of INDIAN_INSURANCE_PROVIDERS) {
    const prov = await prisma.insuranceProvider.create({
      data: {
        providerName: ins.name,
        name: ins.name,
        providerCode: ins.code,
        code: ins.code,
        contactEmail: ins.email,
        contactPhone: ins.phone,
        address: 'Insurance Plaza, New Delhi',
        active: true,
      },
    });
    seededProviders.push(prov);
  }

  // STEP 15: REALISTIC CLINICAL DATA (APPOINTMENTS, LAB REPORTS, PRESCRIPTIONS, INPATIENTS)
  console.log('📑 Generating realistic Indian clinical encounters, appointments, and prescriptions...');

  const appointmentReasons = [
    'Annual cardiac checkup & ECG review',
    'Follow-up for chronic hypertension and BP monitoring',
    'Chronic migraine, aura, and tension headache evaluation',
    'Knee joint pain and bilateral osteoarthritis assessment',
    'Pediatric immunization and growth chart review',
    'Dermatological evaluation for persistent eczema',
    'Sinus congestion, allergic rhinitis, and ENT endoscopy',
    'First trimester routine prenatal ultrasound & wellness review',
    'Type 2 Diabetes Mellitus fasting blood sugar management',
    'Persistent acid reflux, GERD, and abdominal bloating',
  ];

  // Seed 50 realistic appointments
  for (let i = 0; i < 50; i++) {
    const patient = seededPatientProfiles[i % seededPatientProfiles.length];
    const doctor = seededDoctorProfiles[i % seededDoctorProfiles.length];
    const reason = appointmentReasons[i % appointmentReasons.length];

    const dayOffset = (i % 7) - 3; // spread across -3 days to +3 days
    const aptDate = new Date();
    aptDate.setDate(aptDate.getDate() + dayOffset);
    aptDate.setHours(9 + (i % 8), (i % 2) * 30, 0, 0);

    const isPast = dayOffset < 0;
    const status: AppointmentStatus = isPast ? AppointmentStatus.COMPLETED : AppointmentStatus.CONFIRMED;

    await prisma.appointment.create({
      data: {
        appointmentNumber: `APT-IND-${(i + 1001).toString()}`,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: facilityDelhi.id,
        departmentId: doctor.departmentId,
        appointmentDate: aptDate,
        startTime: `${9 + (i % 8)}:${(i % 2) === 0 ? '00' : '30'}`,
        endTime: `${9 + (i % 8)}:${(i % 2) === 0 ? '30' : '59'}`,
        type: (i % 3 === 0 ? 'VIDEO' : 'CONSULTATION') as any,
        status,
        reason,
      },
    });
  }
  console.log('✅ 50 Realistic Clinical Appointments generated.');

  // Seed 30 Clinical Encounters, Diagnoses, Vitals, Prescriptions, Lab Orders
  for (let i = 0; i < 30; i++) {
    const patient = seededPatientProfiles[i];
    const doctor = seededDoctorProfiles[i % seededDoctorProfiles.length];

    const encDate = new Date();
    encDate.setDate(encDate.getDate() - (i + 1));

    const encounter = await prisma.clinicalEncounter.create({
      data: {
        encounterNumber: `ENC-IND-${(i + 2001).toString()}`,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: facilityDelhi.id,
        departmentId: doctor.departmentId,
        encounterType: 'OUTPATIENT' as any,
        status: 'COMPLETED' as any,
        reasonForVisit: appointmentReasons[i % appointmentReasons.length],
        startedAt: encDate,
        endedAt: new Date(encDate.getTime() + 1800000), // +30 mins
      },
    });

    // Vital Signs
    await prisma.vitalSign.create({
      data: {
        encounterId: encounter.id,
        patientId: patient.id,
        recordedBy: hospAdminUser.id,
        systolicBP: 120 + (i % 15),
        diastolicBP: 80 + (i % 10),
        heartRate: 72 + (i % 12),
        respiratoryRate: 16,
        temperature: 36.8,
        oxygenSaturation: 98 + (i % 2),
      },
    });

    // Prescription
    const med = seededMeds[i % seededMeds.length];
    const rx = await prisma.prescription.create({
      data: {
        prescriptionNumber: `RX-IND-${(i + 3001).toString()}`,
        encounterId: encounter.id,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: facilityDelhi.id,
        status: 'DISPENSED' as any,
        notes: `Take ${med.strength} orally after meals. Complete full recommended course.`,
      },
    });

    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: rx.id,
        medicationId: med.id,
        dosage: med.strength || '1 tablet',
        frequency: 'ONCE_DAILY',
        route: 'ORAL',
        duration: '15 days',
        quantity: 15,
        instructions: 'After breakfast with plain water',
      },
    });

    // Lab Order & Report
    const labTest = seededLabTests[i % seededLabTests.length];
    const labOrder = await prisma.labOrder.create({
      data: {
        orderNumber: `LAB-IND-${(i + 4001).toString()}`,
        encounterId: encounter.id,
        patientId: patient.id,
        doctorId: doctor.id,
        facilityId: facilityDelhi.id,
        priority: 'ROUTINE' as any,
        status: 'COMPLETED' as any,
        clinicalNotes: `Diagnostic investigation for ${appointmentReasons[i % appointmentReasons.length]}`,
      },
    });

    await prisma.labOrderItem.create({
      data: {
        labOrderId: labOrder.id,
        labTestId: labTest.id,
        status: 'COMPLETED',
      },
    });
  }
  console.log('✅ 30 Clinical Encounters, Vitals, Prescriptions, and Lab Orders seeded.');

  // STEP 16: INPATIENT ADMISSIONS & BED ASSIGNMENTS
  console.log('🏥 Generating 20 Inpatient Admissions (ICU & General Wards)...');
  for (let i = 0; i < 20; i++) {
    const patient = seededPatientProfiles[i + 10];
    const bed = seededBeds[i % seededBeds.length];
    const isAdmitted = i < 6; // 6 currently admitted, 14 discharged

    const admDate = new Date();
    admDate.setDate(admDate.getDate() - (i + 2));

    const admission = await prisma.admission.create({
      data: {
        admissionNumber: `ADM-IND-${(i + 5001).toString()}`,
        patientId: patient.id,
        facilityId: facilityDelhi.id,
        departmentId: deptMap['GEN_MED'],
        admissionType: AdmissionType.EMERGENCY,
        status: isAdmitted ? AdmissionStatus.ADMITTED : AdmissionStatus.DISCHARGED,
        admittedBy: hospAdminUser.id,
        admittedAt: admDate,
        dischargedAt: isAdmitted ? null : new Date(admDate.getTime() + 86400000 * 3),
        reason: i % 2 === 0 ? 'Acute Decompensated Heart Failure' : 'Severe Community Acquired Pneumonia',
      },
    });

    if (isAdmitted) {
      await prisma.bedAssignment.create({
        data: {
          admissionId: admission.id,
          bedId: bed.id,
          patientId: patient.id,
          status: 'ACTIVE' as any,
          assignedBy: hospAdminUser.id,
          assignedAt: admDate,
        },
      });

      await prisma.bed.update({
        where: { id: bed.id },
        data: { status: BedStatus.OCCUPIED },
      });
    }
  }
  console.log('✅ 20 Inpatient Admissions with bed assignments generated.');

  // STEP 17: BILLING INVOICES & PAYMENTS (IN INDIAN RUPEES ₹)
  console.log('💰 Generating 40 Billing Invoices in INR (₹) with Line Items and Payments...');
  for (let i = 0; i < 40; i++) {
    const patient = seededPatientProfiles[i % seededPatientProfiles.length];
    const subtotal = 1200 + (i * 250);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    const isPaid = i % 3 !== 0;

    const billingInv = await prisma.billingInvoice.create({
      data: {
        invoiceNumber: `INV-IND-${(i + 6001).toString()}`,
        patientId: patient.id,
        facilityId: facilityDelhi.id,
        subtotal: subtotal,
        taxAmount: tax,
        discountAmount: 0,
        totalAmount: total,
        amountPaid: isPaid ? total : 0,
        balanceDue: isPaid ? 0 : total,
        paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        invoiceStatus: isPaid ? InvoiceStatus.PAID : InvoiceStatus.FINALIZED,
        notes: 'Outpatient consultation and diagnostic procedures billing receipt',
      },
    });

    // Line Item
    await prisma.billingLineItem.create({
      data: {
        invoiceId: billingInv.id,
        itemType: 'OPD',
        itemName: 'Specialist Doctor OPD Consultation & Assessment',
        quantity: 1,
        unitPrice: subtotal,
        taxPercent: 18,
        discountPercent: 0,
        totalPrice: total,
      },
    });

    // Payment Transaction if paid
    if (isPaid) {
      await prisma.paymentTransaction.create({
        data: {
          invoiceId: billingInv.id,
          paymentMethod: PaymentMethod.UPI,
          transactionReference: `UPI-IND-REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
          amount: total,
          status: 'SUCCESS',
          collectedById: hospAdminUser.id,
        },
      });
    }

    // Finance Invoice synchronization
    await prisma.invoice.create({
      data: {
        invoiceNumber: `FIN-IND-${(i + 6001).toString()}`,
        facilityId: facilityDelhi.id,
        patientId: patient.id,
        totalAmount: total,
        netAmount: total,
        paidAmount: isPaid ? total : 0,
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.FINALIZED,
        invoiceStatus: isPaid ? InvoiceStatus.PAID : InvoiceStatus.FINALIZED,
      },
    }).catch(() => {});
  }
  console.log('✅ 40 Billing Invoices with UPI / NetBanking payment records generated.');

  // STEP 18: INDIAN HEALTH INSURANCE POLICIES & CLAIMS
  console.log('📑 Seeding Indian Health Insurance Policies and Cashless Claims...');
  for (let i = 0; i < 25; i++) {
    const patient = seededPatientProfiles[i];
    const provider = seededProviders[i % seededProviders.length];

    const policy = await prisma.insurancePolicy.create({
      data: {
        patientId: patient.id,
        insuranceProviderId: provider.id,
        policyNumber: `POL-${provider.providerCode}-${(i + 10001).toString()}`,
        memberId: `MEM-${(i + 20001).toString()}`,
        coverageAmount: 500000.0, // ₹5 Lakh Sum Insured
        utilizedAmount: 35000.0,
        insuranceType: InsuranceType.CASHLESS,
        policyStatus: PolicyStatus.ACTIVE,
        validFrom: new Date('2026-01-01'),
        validTill: new Date('2026-12-31'),
      },
    });

    const claimAmount = 25000.0 + (i * 1500);
    await prisma.insuranceClaim.create({
      data: {
        claimNumber: `CLM-IND-${(i + 7001).toString()}`,
        policyId: policy.id,
        patientId: patient.id,
        insuranceProviderId: provider.id,
        facilityId: facilityDelhi.id,
        claimType: ClaimType.CASHLESS,
        amountClaimed: claimAmount,
        amountApproved: claimAmount,
        amountPaid: claimAmount,
        totalClaimAmount: claimAmount,
        approvedAmount: claimAmount,
        status: ClaimStatus.APPROVED,
        claimStatus: ClaimStatus.APPROVED,
        submittedAt: new Date(Date.now() - 86400000 * 5),
        settledAt: new Date(Date.now() - 86400000 * 1),
        approvalDate: new Date(Date.now() - 86400000 * 2),
        remarks: `Pre-authorized cashless admission under ${provider.name}`,
      },
    });
  }
  console.log('✅ 25 Indian Health Insurance Policies and Cashless Claims seeded.');

  // STEP 18: BED BOOKINGS & PRE-ADMISSIONS
  console.log('🛏️ Seeding online Patient Bed Bookings & Pre-Admissions...');
  const sampleBookings = [
    {
      bookingNumber: 'BKG-2026-001',
      facilityId: facilityDelhi.id,
      patientId: seededPatientProfiles[0]?.id,
      patientName: 'Aarav Sharma',
      patientPhone: '+91 98765 43210',
      patientEmail: 'aarav.sharma@example.com',
      bedType: BedType.ICU,
      priority: 'HIGH',
      chiefComplaint: 'Severe breathlessness and post-cardiac observation needed',
      medicalCondition: 'Acute Coronary Syndrome, stable vitals',
      status: BedBookingStatus.APPROVED,
      notes: 'Bed reserved in ICU Ward. Patient arriving with family by 2 PM.',
      expectedDate: new Date(Date.now() + 86400000),
    },
    {
      bookingNumber: 'BKG-2026-002',
      facilityId: facilityDelhi.id,
      patientId: seededPatientProfiles[1]?.id,
      patientName: 'Priya Patel',
      patientPhone: '+91 98200 12345',
      patientEmail: 'priya.patel@example.com',
      bedType: BedType.GENERAL,
      priority: 'NORMAL',
      chiefComplaint: 'Elective laparoscopic cholecystectomy admission',
      medicalCondition: 'Gallbladder stones, pre-op clearance completed',
      status: BedBookingStatus.PENDING,
      notes: 'Requested admission tomorrow morning 8 AM.',
      expectedDate: new Date(Date.now() + 86400000 * 2),
    },
    {
      bookingNumber: 'BKG-2026-003',
      facilityId: facilityDelhi.id,
      patientId: seededPatientProfiles[2]?.id,
      patientName: 'Rajesh Verma',
      patientPhone: '+91 98450 67890',
      patientEmail: 'rajesh.verma@example.com',
      bedType: BedType.OXYGEN,
      priority: 'URGENT',
      chiefComplaint: 'Pneumonia with SpO2 fluctuating at 89-91%',
      medicalCondition: 'Moderate pneumonia, requires continuous 5L O2',
      status: BedBookingStatus.PENDING,
      notes: 'Transfer from local clinic requested urgent oxygen bed.',
      expectedDate: new Date(),
    },
    {
      bookingNumber: 'BKG-2026-004',
      facilityId: facilityDelhi.id,
      patientId: seededPatientProfiles[3]?.id,
      patientName: 'Sneha Kulkarni',
      patientPhone: '+91 98901 23456',
      patientEmail: 'sneha.k@example.com',
      bedType: BedType.PRIVATE,
      priority: 'NORMAL',
      chiefComplaint: 'Maternity delivery elective reservation',
      medicalCondition: '38 weeks pregnancy, routine elective booking',
      status: BedBookingStatus.APPROVED,
      notes: 'Executive deluxe suite reserved.',
      expectedDate: new Date(Date.now() + 86400000 * 3),
    },
  ];

  for (const bkg of sampleBookings) {
    await prisma.bedBooking.create({
      data: bkg,
    });
  }
  console.log(`✅ ${sampleBookings.length} Patient Bed Bookings seeded.`);

  console.log('🎉 ========================================================');
  console.log('🎉 FRESH INDIAN HEALTHCARE DATASET SEED SUCCESSFULLY COMPLETED!');
  console.log('🎉 ========================================================');
  console.log('Key Demo Accounts Initialized:');
  console.log('  • Super Admin:       admin@medinexa.in           (Password: Password123!)');
  console.log('  • Delhi Admin:       admin.delhi@medinexa.in     (Password: Password123!)');
  console.log('  • Top Doctor:        dr.deshmukh@medinexa.in     (Password: Password123!)');
  console.log('  • Primary Patient:   patient@medinexa.in         (Password: Password123!)');
  console.log('  • Senior Nurse:      nurse.01@medinexa.in        (Password: Password123!)');
  console.log('  • Reception Desk:    receptionist.01@medinexa.in (Password: Password123!)');
  console.log('  • Lab Head:          lab.01@medinexa.in          (Password: Password123!)');
  console.log('  • Chief Pharmacist:  pharmacy.01@medinexa.in     (Password: Password123!)');
  console.log('========================================================');
}

main()
  .catch((e) => {
    console.error('❌ Error executing Indian Healthcare seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
