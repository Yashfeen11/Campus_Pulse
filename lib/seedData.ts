import { NoticeItem } from '@/types/notice';

function getOffsetDateString(offsetDays: number, baseDate: Date = new Date()): string {
  const target = new Date(baseDate);
  target.setDate(target.getDate() + offsetDays);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates realistic college notices dynamically relative to today
 * (1 today, 1 tomorrow, 2 later this week, 1 next week, 1 expired 2 days ago, and 1 undated Urgent Announcement)
 */
export function generateSeedNotices(baseDate: Date = new Date()): NoticeItem[] {
  const todayStr = getOffsetDateString(0, baseDate);
  const tomorrowStr = getOffsetDateString(1, baseDate);
  const laterThisWeekStr1 = getOffsetDateString(3, baseDate);
  const laterThisWeekStr2 = getOffsetDateString(5, baseDate);
  const nextWeekStr = getOffsetDateString(8, baseDate);
  const expiredStr = getOffsetDateString(-2, baseDate);

  const nowIso = baseDate.toISOString();

  return [
    {
      id: 'seed-notice-1-today',
      title: 'Google & Microsoft Campus Drive: Pre-Placement Talk & Resume Drop',
      date: todayStr,
      time: '04:30 PM',
      venue: 'Main Auditorium (Hall A)',
      category: 'Placement',
      importantRules: [
        'Mandatory formal attire & 2 physical copies of updated resume',
        'Only registered Final Year CSE / ECE / IT students eligible',
        'Doors close strictly at 04:20 PM; late entries not permitted',
      ],
      summary:
        'Final year students must attend the PPT with hardcopy resumes; strict cutoff at 4:20 PM.',
      createdAt: nowIso,
    },
    {
      id: 'seed-notice-2-tomorrow',
      title: 'Hands-on GenAI & Next.js Fullstack Workshop by GDG Campus',
      date: tomorrowStr,
      time: '10:00 AM - 01:00 PM',
      venue: 'CS Lab 3 & Online via Google Meet',
      category: 'Workshop',
      importantRules: [
        'Bring your own laptop with Node.js v18+ pre-installed',
        'Limited to first 60 verified registrations on campus portal',
        'Certificate of participation provided upon submitting mini-project',
      ],
      summary:
        'Bring your laptop with Node.js ready for an interactive GenAI web development workshop.',
      createdAt: nowIso,
    },
    {
      id: 'seed-notice-3-thisweek1',
      title: 'Mid-Term Examination Schedule & Hall Ticket Clearance',
      date: laterThisWeekStr1,
      time: '09:30 AM',
      venue: 'Admin Block - Counter 4 & Student Portal',
      category: 'Academic',
      importantRules: [
        'Clear all pending semester dues before downloading hall ticket',
        'Minimum 75% attendance criteria strictly enforced for all theory courses',
        'Carry College ID card alongside printed hall ticket',
      ],
      summary:
        'Verify 75% attendance and settle fee dues to collect exam hall tickets before exam week.',
      createdAt: nowIso,
    },
    {
      id: 'seed-notice-4-thisweek2',
      title: "Inter-College Fest 'Vibrance 2026' Auditions: Battle of the Bands",
      date: laterThisWeekStr2,
      time: '05:00 PM - 09:00 PM',
      venue: 'Open Air Amphitheatre',
      category: 'Cultural',
      importantRules: [
        'Each band gets a 12-minute slot (8 mins performance + 4 mins sound check)',
        'Drum kit and PA system provided; bring personal guitars/cables',
        'Submit team roster at Cultural Desk before 2:00 PM on event day',
      ],
      summary:
        'Rock bands must register rosters by 2 PM; 12-minute performance slot allotted per team.',
      createdAt: nowIso,
    },
    {
      id: 'seed-notice-5-nextweek',
      title: 'Annual Inter-Department Football Championship 2026 Kickoff',
      date: nextWeekStr,
      time: '03:30 PM',
      venue: 'University Central Sports Complex',
      category: 'Sports',
      importantRules: [
        '11-a-side match; maximum 16 players registered per department roster',
        'Shin guards and proper football studs mandatory for all players',
        'Captain briefing scheduled 30 minutes prior to kickoff',
      ],
      summary:
        'Inter-department 11-a-side football tournament kicks off next week at the central sports complex.',
      createdAt: nowIso,
    },
    {
      id: 'seed-notice-6-expired',
      title: 'Campus Hostel Room Re-Allocation & Wi-Fi Router Upgrade',
      date: expiredStr,
      time: '02:00 PM',
      venue: 'Hostel Warden Office (Block B)',
      category: 'General',
      importantRules: [
        'Mandatory presence of registered occupant with hostel allotment slip',
        'Room inspection for electrical appliance approvals',
        'Unclaimed slots will be released to waitlisted students',
      ],
      summary:
        'Hostel room verification and network equipment setup window concluded two days ago.',
      createdAt: nowIso,
    },
  ];
}
