# RAPHA TELE HEALTH

Build a full-stack healthcare marketplace platform called MedHome that connects patients with healthcare professionals for at-home medical services.

The platform must include:

• Patient mobile app (iOS + Android)
• Healthcare professional mobile app
• Admin web dashboard

The system should allow users to book verified healthcare professionals for home visits, communicate securely, track professionals in real time, upload medical reports, and make digital payments.

Core Roles

Create 3 user roles

Patient

Medical Professional

Admin

PATIENT APP FEATURES

Authentication

Phone OTP login

Email login

Google / Apple login

Forgot password

Patient Profiles

Allow one account to manage multiple patient profiles

Fields:

Name

Age

Gender

Blood group

Allergies

Medical history

Current medications

Emergency contact

AI Healthcare Assistant

Patients can:

Enter symptoms

Upload medical reports (PDF, image)

Receive AI analysis of reports

Receive doctor recommendations based on symptoms and reports

AI should:

• Identify abnormal values in reports
• Explain medical terms simply
• Suggest appropriate specialists

Service Booking

Patients can book:

Doctor

Nurse

Physiotherapist

Caregiver

Lab technician

Booking flow:

Select service

Choose specialization

View professionals nearby

Select professional

Select patient profile

Choose date and time

Add symptoms or notes

Upload prescription

Confirm address

Select payment method

Confirm booking

Search & Discovery

Users can search professionals by:

Service type

Specialization

Rating

Experience

Price

Distance

Professional profile must show:

Photo

Qualification

Years of experience

Certifications

Ratings

Consultation fee

Availability schedule

Real-Time Features

Add:

GPS tracking of professional

Live arrival time

Booking status updates

Status:

• Booking confirmed
• Professional assigned
• On the way
• Arrived
• Completed

Communication

Allow:

Chat

Voice call

Optional video call

Payments

Support:

UPI

Debit/Credit cards

Wallet

Net banking

Cash option

Generate:

Digital invoice

Payment history

Booking Management

Patients can:

View upcoming bookings

Cancel bookings

Reschedule bookings

View booking history

Rebook previous professional

Ratings & Reviews

After service completion:

Rate professional

Write review

Report issue

MEDICAL PROFESSIONAL APP

Professional Onboarding

Professionals must submit:

Full name

Medical license

ID verification

Certifications

Specialization

Years of experience

Profile photo

Admin approval required before activation.

Professional Dashboard

Professionals can:

Accept or reject bookings

View schedule

Navigate to patient location

View patient details

Chat with patient

Complete service

Availability Management

Professionals can:

Set working hours

Set available days

Set service areas

Earnings Dashboard

Show:

Daily earnings

Weekly earnings

Monthly earnings

Commission deduction

Withdrawal requests

ADMIN DASHBOARD

Admin must be able to:

Manage Users

View all patients

Suspend accounts

Handle complaints

Manage Professionals

Approve professionals

Reject applications

Verify licenses

Suspend professionals

Manage Bookings

View all bookings

Cancel bookings

Reassign professionals

Payments

Admin can:

Set platform commission

View all transactions

Process refunds

Manage payouts

Analytics

Dashboard must show:

Total users

Active professionals

Total bookings

Revenue

Top services

Average ratings

TECHNOLOGY REQUIREMENTS

Frontend

React Native for mobile apps

Next.js for admin dashboard

Backend

Node.js or Supabase

Database

PostgreSQL

Realtime

WebSockets or Firebase

Payments

Stripe / Razorpay

Maps

Google Maps API

AI

OpenAI API for report analysis and recommendations

Security

Implement:

Encrypted user data

Secure document storage

Two-factor authentication

Role-based access control

Design Style

Use a modern healthcare UI design

Colors:

White

Light blue

Soft green

Style:

Clean

Minimal

Accessible

2. DATABASE SCHEMA (IMPORTANT)

Here is a scalable database structure.

USERS TABLE

Stores login accounts.

users
------
id (uuid)
name
email
phone
password_hash
role (patient, professional, admin)
profile_photo
created_at

PATIENT PROFILES

patient_profiles
----------------
id
user_id
name
age
gender
blood_group
allergies
medical_history
medications
emergency_contact
created_at

Relationship
User → many patient profiles

PROFESSIONALS

professionals
-------------
id
user_id
specialization
license_number
years_experience
bio
consultation_fee
verification_status
rating
total_reviews
created_at

PROFESSIONAL CERTIFICATIONS

professional_certifications
----------------------------
id
professional_id
certificate_name
document_url
verified

SERVICE TYPES

services
---------
id
name
description

Examples

Doctor
Nurse
Physiotherapist
Caregiver
Lab technician

BOOKINGS

bookings
---------
id
patient_profile_id
professional_id
service_id
booking_date
booking_time
status
symptoms_notes
prescription_file
address
latitude
longitude
created_at

Status values:

pending

accepted

on_the_way

arrived

completed

cancelled

PAYMENTS

payments
--------
id
booking_id
amount
payment_method
payment_status
transaction_id
created_at

REVIEWS

reviews
-------
id
booking_id
patient_id
professional_id
rating
comment
created_at

CHAT MESSAGES

messages
--------
id
booking_id
sender_id
message
message_type
created_at

AI REPORT ANALYSIS

medical_reports
---------------
id
patient_profile_id
file_url
ai_summary
ai_recommendation
created_at

PROFESSIONAL AVAILABILITY

availability
-------------
id
professional_id
day_of_week
start_time
end_time

EARNINGS

earnings
---------
id
professional_id
booking_id
amount
commission
payout_status
created_at

ADMIN LOGS

admin_logs
-----------
id
admin_id
action
target_id
created_at

DATABASE RELATIONSHIP SUMMARY

Users
 ├── Patient Profiles
 └── Professionals

Patient Profiles
 └── Bookings

Professionals
 ├── Certifications
 ├── Availability
 └── Bookings

Bookings
 ├── Payments
 ├── Reviews
 └── Messages

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://your-care-at-home.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45268710-6a26-4ee3-bf11-856eec091e67).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
