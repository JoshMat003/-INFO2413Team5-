create database Team5DB;

use Team5DB;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'My2312$ql';

|--------------------------------------------------|
drop table Applicant_Table;

//create table Applicant_Table (
	Applicant_ID varchar(5) not null, 
    Applicant_FirstName	varchar(50) not null,
    Applicant_LastName varchar(50) not null,
    Applicant_DateOfBirth date not null,
    Applicant_Email varchar(255) not null,
    Applicant_PhoneNum varchar(20) not null,
    Applicant_PasswordHash varchar(500) not null,
    ProfilePicture mediumblob 
);//
create table Applicant_Table (
	Applicant_ID varchar(5) not null, 
    Applicant_FirstName	varchar(50) not null,
    Applicant_LastName varchar(50) not null,
    Applicant_DateOfBirth date not null,
    Applicant_Email varchar(255) not null,
    Applicant_PhoneNum varchar(20) not null,
    Applicant_PasswordHash varchar(500) not null
    
);

INSERT INTO Applicant_Table VALUES
	('A0001', 'Grace', 'Cola', '1989-06-04 00:00:00', 'grace@gmail.com','1 234 567 8901', 'abc123***' ),
    ('A0002', 'Ivana', 'Coca', '1990-8-31 00:00:00', 'Ivana@gmail.com', '1 432 756 1098', 'abc123***')
    ;

TRUNCATE TABLE Applicant_Table;

SELECT * FROM Applicant_Table;

UPDATE Applicant_Table set Applicant_PasswordHash = 'abc123***' WHERE Applicant_ID = 'A0001';
|--------------------------------------------------|
create table ApplicantStatus_Table (
	ApplicantStatus_ID int not null,
	ApplicantStatus_Name varchar(10) not null
);

INSERT INTO ApplicantStatus_Table VALUES
	(1, 'Active'),
	(2, 'Disable')
;

|--------------------------------------------------|
create table Preferences_Table (
	Preferences_ID varchar(7) not null,
    Applicant_ID varchar(5) not null,
    JobCategory_ID varchar(4) not null,
    JobTitle_ID varchar(6) not null,
    JobPosition_ID varchar(4) not null,
    PreferredMaxSalary int not null,
    PreferredMinSalary int not null,
    City_ID varchar(5),
    Province_ID varchar(4)
);

create table City_Table (
	City_ID varchar(5) not null,
    City_Name varchar(100) not null
);

create table Province_Table (
	Province_ID varchar(4) not null,
    Province_Name varchar(100) not null
);

create table JobTitle_Table (
	JobTitle_ID varchar(6) not null,
    JobTitle_Name varchar(100) not null
);

create table JobPosition_Table (
	JobPosition_ID varchar(4) not null,
    JobPosition_Name varchar(20) not null
);

create table AnnualSalary_Table (
	AnnualSalary_ID varchar(4) not null,
    AnnualSalary_Name varchar(10) not null
);
|-----------------------------------------------------------|
truncate TABLE Education_Table;

create table Education_Table (
	Education_ID varchar(7) not null,
    Applicant_ID varchar(5) not null,
    Degree_ID varchar(4) not null,
    Major_ID varchar(5) not null,
    Institution_ID varchar(5) not null,
    GraduationYear int not null
);

SELECT * FROM Education_Table;

INSERT INTO Education_Table VALUES
	('ED00002', 'A0001', '3', '12', '2', 1945);

UPDATE Education_Table SET GraduationYear = 1946 WHERE Education_ID = 'ED00002';

SELECT * FROM Education_Table;
    
SELECT MAX(Education_ID) FROM Education_Table;

TRUNCATE TABLE Education_Table;
|-----------------------------------------------------------|
create table Degree_Table (
	Degree_ID varchar(4) not null,
    Degree_Name varchar(100) not null
);

SELECT * FROM Degree_Table;

INSERT INTO Degree_Table VALUES 
	(1, 'Certificate Programs'),
    (2, 'Diploma Programs'),
    (3, 'Bachelor Degrees' ),
    (4, 'Master Degrees'),
    (5, 'Doctoral Degrees'),
    (6, 'Postdoctoral Programs')
;
SELECT * FROM Degree_TABLE;

|-------------------------------------------------------------|

create table Major_Table (
	Major_ID varchar(5) not null,
    Major_Name varchar(255) not null
);

SELECT * FROM Major_Table;

INSERT INTO Major_Table VALUES
	(1, 'Business Administration'),
    (2, 'Computer Science'),
    (3, 'Nursing'),
    (4, 'Psychology'),
    (5, 'Biology'),
    (6, 'Education'),
    (7, 'Social Work'),
    (8, 'Political Science'),
    (9, 'Economics'),
    (10, 'Environmental Science'),
    (11, 'Communications'),
    (12, 'Information Technology'),
    (13, 'Hospitality Management'),
    (14, 'Arts'),
    (15, 'Mathematics'),
    (16, 'Law'),
    (17, 'Public Health'),
    (18, 'International Relations'),
    (19, 'Chemistry'),
    (20, 'Sociology'),
    (21, 'Philosophy'),
    (22, 'Accounting'),
    (23, 'Graphic Design'),
    (24, 'Criminal Justice'),
    (25, 'Statistics'),
    (26, 'Media Studies'),
    (27, 'Human Resources Management'),
    (28, 'Theatre and Drama')
;

|-------------------------------------------------------------|

create table Institution_Table (
	Institution_ID varchar(5) not null,
    Institution_Name varchar(500) not null
);

SELECT * FROM Institution_Table;

INSERT INTO Institution_Table VALUES
	(1, 'University of Toronto'),
	(2, 'University of British Columbia'),
	(3, 'McGill University'),
	(4, 'University of Alberta'),
	(5, 'McMaster University'),
	(6, 'University of Montreal'),
	(7, 'University of Calgary'),
	(8, 'University of Ottawa'),
	(9, 'Western University'),
	(10, 'Simon Fraser University'),
	(11, 'Dalhousie University'),
	(12, 'Queen\'s University'),
	(13, 'University of Manitoba'),
	(14, 'University of Saskatchewan'),
	(15, 'University of Victoria'),
	(16, 'University of New Brunswick'),
	(17, 'York University'),
	(18, 'University of Guelph'),
	(19, 'Carleton University'),
	(20, 'Memorial University of Newfoundland'),
	(21, 'University of Regina'),
	(22, 'University of Windsor'),
	(23, 'Trent University'),
	(24, 'Brock University'),
	(25, 'Laurentian University'),
	(26, 'Nipissing University'),
	(27, 'Ryerson University'),
	(28, 'St. Francis Xavier University'),
	(29, 'University of Lethbridge'),
	(30, 'Mount Allison University'),
	(31, 'University of Newfoundland'),
	(32, 'Vancouver Island University'),
	(33, 'Thompson Rivers University'),
	(34, 'Wilfrid Laurier University'),
	(35, 'Ontario Tech University'),
	(36, 'École Polytechnique de Montréal'),
	(37, 'Bishop’s University'),
	(38, 'University of Winnipeg'),
	(39, 'Algoma University'),
	(40, 'George Brown College'),
	(41, 'Humber College'),
	(42, 'Seneca College'),
	(43, 'Sheridan College'),
	(44, 'Centennial College'),
	(45, 'Fanshawe College'),
	(46, 'Mohawk College'),
	(47, 'Northern Alberta Institute of Technology'),
	(48, 'Southern Alberta Institute of Technology'),
	(49, 'British Columbia Institute of Technology'),
	(50, 'Red River College'),
	(51, 'Durham College'),
	(52, 'St. Clair College'),
	(53, 'Niagara College'),
	(54, 'Lambton College'),
	(55, 'Camosun College'),
	(56, 'Okanagan College'),
	(57, 'Mount Royal University'),
	(58, 'Vancouver Community College'),
	(59, 'College of the Rockies'),
	(60, 'LaSalle College'),
	(61, 'Alberta College of Art + Design'),
	(62, 'Saskatchewan Polytechnic'),
	(63, 'Holland College'),
	(64, 'Ontario College of Art and Design University'),
	(65, 'The King\'s University'),
	(66, 'Tyndale University'),
	(67, 'Canadian Mennonite University'),
	(68, 'St. Mary\'s University'),
	(69, 'The University of St. Michael\'s College'),
	(70, 'Trinity Western University'),
	(71, 'Ambrose University'),
	(72, 'Redeemer University'),
	(73, 'Vancouver Film School'),
	(74, 'National Research Council Canada'),
	(75, 'Institute of Technology Development'),
	(76, 'École de technologie supérieure'),
	(77, 'Montreal College of Information Technology'),
	(78, 'Academy of Art University'),
	(79, 'Canadian College of Technology'),
	(80, 'CDI College'),
	(81, 'British Columbia College of Technology'),
	(82, 'Canadian College of Naturopathic Medicine'),
	(83, 'Sprott Shaw College'),
	(84, 'Toronto School of Management'),
	(85, 'JIBC (Justice Institute of British Columbia)'),
	(86, 'College of Physicians and Surgeons of Alberta'),
	(87, 'Canadian College of Business'),
	(88, 'Concordia University of Edmonton'),
	(89, 'Capilano University'),
	(90, 'Georgian College'),
	(91, 'Algonquin College'),
	(92, 'Vancouver Community College'),
	(93, 'Yorkville University'),
	(94, 'University of Alberta Augustana Campus'),
	(95, 'University of Toronto Mississauga'),
	(96, 'University of Toronto Scarborough'),
	(97, 'Laurentian University of Sudbury'),
	(98, 'University of Calgary (Foothills Campus)'),
	(99, 'University of Calgary'),
	(100, 'University of Toronto')
;

|-------------------------------------------------------------|

create table WorkExperience_Table (
	WorkExp_ID varchar(7) not null,
    Applicant_ID varchar(5) not null,
    JobCategory_ID varchar(4) not null,
    JobTitle_ID varchar(6) not null,
    JobPosition_ID varchar(4) not null,
    Company varchar(500) not null,
    StartDate date not null,
    EndDate date not null,
    WorkIndustry varchar(255)
);

SELECT * FROM Institution_Table;

|-------------------------------------------------------------|

create table JobCategory_Table (
	JobCategory_ID int not null,
    JobCategory_Name varchar(255)
);

SELECT * FROM JobCategory_Table;

INSERT INTO JobCategory_Table VALUES (
	(1, 'Healthcare'),
    (2, 'Information Technology'),
    (3, 'Engineering'),
    (4, 'Education'),
    (5, 'Finance and Accounting'),
    (6, 'Construction and Trades'),
    (7, 'Sales and Marketing'),
    (8, 'Hospitality and Toruism'),
    (9, 'Manfactruing and Production'),
    (10, 'Reserarch and Development')
);

|-------------------------------------------------------------|
create table JobTitle_table (
	JobTitle_ID int not null,
    JobTitle_Name varchar(100),

SELECT * FROM JobTitle_Table;

INSERT INTO JobTitle_Table VALUES (
	(1, 'Doctors'),
	(2, 'Nurse'),
	(3, 'Physician'),
	(4, 'Pharmacist'),
	(5, 'Medical Assistant'),
	(6, 'Physical Therapist'),
	(7, 'Occupational Therapist'),
	(8, 'Radiologic Technologist'),
	(9, 'Surgical Technician'),
	(10, 'Health Information Manager'),
	(11, 'Clinical Research Coordinator'),
	(12, 'Software Developer'),
	(13, 'Systems Analyst'),
	(14, 'Network Administrator'),
	(15, 'Data Scientist'),
	(16, 'IT Support Specialist'),
	(17, 'Cybersecurity Analyst'),
	(18, 'Database Administrator'),
	(19, 'Web Developer'),
	(20, 'Cloud Solutions Architect'),
	(21, 'DevOps Engineer'),
	(22, 'Civil Engineer'),
	(23, 'Mechanical Engineer'),
	(24, 'Electrical Engineer'),
	(25, 'Chemical Engineer'),
	(26, 'Software Engineer'),
	(27, 'Environmental Engineer'),
	(28, 'Structural Engineer'),
	(29, 'Industrial Engineer'),
	(30, 'Aerospace Engineer'),
	(31, 'Project Engineer'),
	(32, 'Teacher'),
	(33, 'School Counselor'),
	(34, 'Principal'),
	(35, 'Special Education Teacher'),
	(36, 'Educational Administrator'),
	(37, 'Curriculum Developer'),
	(38, 'Early Childhood Educator'),
	(39, 'Instructional Designer'),
	(40, 'University Professor'),
	(41, 'Adult Education Instructor'),
	(42, 'Accountant'),
	(43, 'Financial Analyst'),
	(44, 'Auditor'),
	(45, 'Tax Specialist'),
	(46, 'Controller'),
	(47, 'Investment Banker'),
	(48, 'Financial Planner'),
	(49, 'Budget Analyst'),
	(50, 'Payroll Specialist'),
	(51, 'Credit Analyst'),
	(52, 'Construction Manager'),
	(53, 'Electrician'),
	(54, 'Plumber'),
	(55, 'Carpenter'),
	(56, 'Heavy Equipment Operator'),
	(57, 'Mason'),
	(58, 'HVAC Technician'),
	(59, 'Project Superintendent'),
	(60, 'Construction Estimator'),
	(61, 'Building Inspector'),
	(62, 'Sales Representative'),
	(63, 'Marketing Manager'),
	(64, 'Brand Manager'),
	(65, 'Business Development Manager'),
	(66, 'Account Executive'),
	(67, 'Digital Marketing Specialist'),
	(68, 'Market Research Analyst'),
	(69, 'Sales Engineer'),
	(70, 'Social Media Manager'),
	(71, 'Content Marketing Specialist'),
	(72, 'Hotel Manager'),
	(73, 'Event Planner'),
	(74, 'Restaurant Manager'),
	(75, 'Travel Agent'),
	(76, 'Tour Guide'),
	(77, 'Front Desk Agent'),
	(78, 'Chef'),
	(79, 'Concierge'),
	(80, 'Catering Manager'),
	(81, 'Housekeeping Supervisor'),
	(82, 'Production Supervisor'),
	(83, 'Quality Control Inspector'),
	(84, 'Manufacturing Engineer'),
	(85, 'Assembly Line Worker'),
	(86, 'Process Technician'),
	(87, 'Supply Chain Manager'),
	(88, 'Machine Operator'),
	(89, 'Inventory Control Specialist'),
	(90, 'Warehouse Manager'),
	(91, 'Logistics Coordinator'),
	(92, 'Research Scientist'),
	(93, 'Product Development Engineer'),
	(94, 'Clinical Research Associate'),
	(95, 'R&D Manager'),
	(96, 'Biochemist'),
	(97, 'Market Research Analyst'),
	(98, 'Laboratory Technician'),
	(99, 'Data Analyst'),
	(100, 'Innovation Consultant'),
	(101, 'Research Analyst')
);
|-------------------------------------------------------------|
create table HRStaff_Table (
	HR_ID varchar(5) not null,
    HR_FirstName varchar(50) not null,
    HR_LastName varchar(50) not null,
    HR_Email varchar(255) not null,
    HR_PhoneNum varchar(20) not null,
    HR_PasswordHash varchar(500) not null,
    ProfilePicture mediumblob not null
);

|-------------------------------------------------------------|

create table Administrator_Table (
	Admin_ID varchar(5) not null,
    Admin_FirstName varchar(50) not null,
    Admin_LastName varchar(50) not null,
    Admin_Email	varchar(255) not null,
    Admin_PhoneNum varchar(20) not null,
    Admin_PasswordHash varchar(500) not null,
    ProfilePicture mediumblob not null
);
|-------------------------------------------------------------|
create table ReportGenerator_Table (
	Peport_ID varchar(7) not null,
    ReportType_ID varchar(4) not null,
    JobCategory_ID varchar(4) not null,
    JobTitle_ID	varchar(6) not null,
    JobPosition_ID varchar(4) not null,
    Report_NumberOfJobPosted int not null,
    Report_TotalApplicant int not null
);
|-------------------------------------------------------------|
create table ReportType_Table (
	ReportType_ID varchar(4) not null,
    ReportType_Name varchar(50) not null
);
|-------------------------------------------------------------|
create table JobPost_Table (
	Job_ID varchar(9) not null,
    ContactEmail varchar(5) not null,
    Application_DueDate date not null,
    JobCategory_ID varchar(4) not null,
    JobTitle_ID varchar(6) not null,
    JobPosition_ID varchar(4) not null,
    City_ID varchar(5) not null,
    Province_ID varchar(4) not null,
    AnnualSalary_ID varchar(4) not null,
    Degree_ID varchar(4) not null,
    RequiredWorkingYear int not null,
    JobPost_Description text
);
|-------------------------------------------------------------|
create table JobApplication_Table (
	Application_ID varchar(8) not null,
    SubmitAt date not null,
    Job_ID  varchar(8) not null,
    Applicant_ID varchar(5) not null,
    WorkIndustry varchar(255) not null,
    YearOfExp int not null,
    Degree_ID varchar(4) not null,
    Major_ID varchar(5) not null
);
|-------------------------------------------------------------|
create table AIScreening_Table (
	ScreenLog_ID varchar(10) not null,
	Job_ID varchar(9) not null,
    Applicant_ID varchar(5) not null,
    EducationMatch boolean not null,
    EducationDegreeMatch boolean not null,
    WorkIndustryMatch boolean not null,
    WorkYearMaatch boolean not null,
    ScreeningDecision boolean not null
);
|-------------------------------------------------------------|
