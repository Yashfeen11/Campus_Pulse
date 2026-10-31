export const SAMPLE_WHATSAPP_NOTICES: string[] = [
  `*🔥 URGENT NOTICE: FinTech & Web3 Campus Hackathon 2026 🔥*
Hey everyone! HOD just forwarded this in the official group:
The Annual Campus Hackathon is happening tomorrow!!
Date: Tomorrow
Time: 09:00 AM - 06:00 PM
Venue: Alan Turing Seminar Hall (Block C)
Category: Workshop

Crucial rules you cannot miss:
1. Each team of 2-4 members MUST bring their own extension cords and laptops.
2. Online registration portal closes tonight at 11:59 PM.
3. Top 3 winning teams get ₹50,000 in cash prizes + direct fast-track interview rounds for summer internships!
Carry your college ID card for morning check-in. Share with your class groups ASAP!`,

  `*📢 PLACEMENT ALERT - DELOITTE & ACCENTURE ON-CAMPUS DRIVE 📢*
Dear Final Year Students (CSE, IT, ECE),
The recruitment team from Deloitte will be visiting campus for Phase-1 Technical & HR Interviews.
Date: Today
Time: 02:00 PM Sharp
Venue: Placement Cell, Main Admin Auditorium (Hall B)

Mandatory Instructions:
• Formal attire strictly required (no casual footwear allowed).
• Bring 2 updated hardcopies of your resume and all semester grade sheets.
• Students with active backlogs are not eligible.
Reporting time is 01:30 PM for attendance marking. Gate closes at 01:45 PM.`,

  `*🚨 URGENT ANNOUNCEMENT: SEVERE WEATHER & HYBRID CLASSES 🚨*
Dean of Academic Affairs circular:
Due to municipal advisory and heavy rain forecast across the city, all physical lectures are converted to online mode via Google Classroom until further notice.
Category: Urgent Announcement
Venue: Online

Important Instructions:
- Professors will share Meet links on official portal 10 mins before class.
- Digital attendance is compulsory for all scheduled laboratory and lecture hours.
- Emergency student helpline: 011-2890-HELP.`,

  `*🎭 CULTURAL FEST 'ECHOES 2026' - AUDITIONS ANNOUNCEMENT 🎭*
Attention all dancers, musicians, and drama enthusiasts!
Auditions for the Main Stage cultural night will begin tomorrow evening.
Time: 04:30 PM onwards
Venue: Open Air Amphitheatre & Student Activity Center (SAC)
Category: Cultural

Guidelines:
- Solo performances: max 3 minutes. Group performances: max 6 minutes.
- Bring your backing tracks on a clean USB pendrive (MP3 format).
- Selected participants get official attendance OD (On-Duty) for rehearsal week.`,
];

export function getRandomSampleNotice(): string {
  const index = Math.floor(Math.random() * SAMPLE_WHATSAPP_NOTICES.length);
  return SAMPLE_WHATSAPP_NOTICES[index];
}
