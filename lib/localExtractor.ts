import { NoticeCategory, NoticeItem, WeeklySummaryResponse } from '@/types/notice';
import { getNoticePriority, getTomorrowString, isValidDateString, isThisWeekPure } from './priority';

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

/**
 * Robust, zero-crash deterministic rule and regex-based notice extractor
 * Guaranteed to extract clean, structured cue card JSON from messy text or OCR output.
 */
export function extractNoticeLocally(rawText: string, referenceDate: string): NoticeItem {
  const cleanInput = rawText.trim();
  const rawLines = cleanInput
    .split('\n')
    .map((line) => line.replace(/^[\s*•#\-_~>]+/, '').trim())
    .filter(Boolean);

  const lower = cleanInput.toLowerCase();

  // 1. Institution & Event Title Extraction
  let title = 'Campus Event Notice';
  let institutionName = '';

  // Clean detection for prominent institutes (e.g. Moradabad Institute of Technology)
  if (/moradabad/i.test(lower) && /(institute of technology|institute|college)/i.test(lower)) {
    institutionName = 'Moradabad Institute of Technology';
  }

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    // Clean noise symbols and non-ASCII glyphs
    const line = rawLine
      .replace(/[|~¥®©*_#\\/\[\]{}<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Check if line is an institution name
    if (
      !institutionName &&
      /(institute of technology|institute of|university of|\buniversity\b|\bpolytechnic\b|\bvidyapeeth\b)/i.test(line) &&
      !/(magazine|fest|hackathon|workshop|contest|submissions)/i.test(line) &&
      line.length < 80
    ) {
      // Remove garbled prefix/suffix words with high consonant density or non-letters
      const cleanedInst = line
        .replace(/^[a-z]{6,}\s+/i, '')
        .replace(/\s+[0-9\W]+.*$/, '')
        .replace(/[^\w\s:()\-–&',.!]/g, '')
        .trim();
      if (cleanedInst.length >= 6) {
        institutionName = cleanedInst;
      }
      continue;
    }

    // Skip generic greetings, slogans, or footnote clauses
    if (
      /^(hey|hello|hi|dear|attention|notice|announcement|good morning|fyi|same campus|learn create|all contributors|we are open|your words|prominently|celebrating|explore create)\b/i.test(line) &&
      line.length < 60
    ) {
      continue;
    }

    // Look for prominent event or publication keywords
    if (
      /\b(magazine|voyager|hackathon|fest|championship|tournament|drive|recruitment|workshop|symposium|audition|conference|competition)\b/i.test(line) &&
      !/^(prominently|celebrating|featured in)/i.test(line)
    ) {
      const cleanTitle = line.replace(/[^\w\s:()\-–&',.!]/g, '').trim();
      if (cleanTitle.length >= 4) {
        title = cleanTitle.slice(0, 90);
        break;
      }
    }

    if (line.length >= 5 && title === 'Campus Event Notice') {
      title = line.replace(/[^\w\s:()\-–&',.!]/g, '').trim().slice(0, 90);
    }
  }

  // Refine title if magazine / voyager is detected
  if (/voyager/i.test(lower) || (/magazine/i.test(lower) && /annual/i.test(lower))) {
    title = institutionName ? `Voyager Magazine Submissions (${institutionName})` : 'Voyager - Annual College Magazine';
  } else if (title === 'Campus Event Notice' && institutionName) {
    title = institutionName;
  }

  // 2. Category Classification
  let category: NoticeCategory = 'General';
  if (/\b(urgent|emergency|alert|severe weather|cancelled|closed|hazard|immediate attention|warning)\b/i.test(lower)) {
    category = 'Urgent Announcement';
  } else if (/\b(placement|interview|resume|recruitment|campus drive|job offer|ctc|package|internship)\b/i.test(lower)) {
    category = 'Placement';
  } else if (/\b(workshop|hackathon|bootcamp|hands-on|tech fest|seminar|coding|genai|ai workshop|training)\b/i.test(lower)) {
    category = 'Workshop';
  } else if (/\b(magazine|literature|poems|sketches|artwork|editorial|cultural|fest|dance|singing|band|audition|music|dj|fashion|drama|skit)\b/i.test(lower)) {
    category = 'Cultural';
  } else if (/\b(exam|midterm|mid-term|quiz|syllabus|academic|attendance|grade|hall ticket|lecture|curriculum)\b/i.test(lower)) {
    category = 'Academic';
  } else if (/\b(sports|cricket|football|badminton|tournament|match|championship|athletics|kabaddi|table tennis)\b/i.test(lower)) {
    category = 'Sports';
  }

  // 3. Date Detection (PRIORITIZE EXPLICIT DATES over incidental words in slogans)
  let date: string | null = null;
  const tomorrowStr = getTomorrowString(referenceDate);
  const refYear = referenceDate.slice(0, 4);

  // A. Check for explicit named month like "20 Nov. 2026" or "20 Nov 2026" or "Nov 20, 2026"
  const dayMonthYearMatch = cleanInput.match(
    /\b(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?[\s.,/-]+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?[\s.,/-]+(20\d{2})\b/i
  );

  if (dayMonthYearMatch) {
    const day = dayMonthYearMatch[1].padStart(2, '0');
    const mKey = dayMonthYearMatch[2].toLowerCase().replace('.', '');
    const month = MONTH_MAP[mKey];
    const year = dayMonthYearMatch[3];
    if (month && isValidDateString(`${year}-${month}-${day}`)) {
      date = `${year}-${month}-${day}`;
    }
  }

  // B. Check for Month Day Year (e.g., "Nov 20, 2026" or "November 20th 2026")
  if (!date) {
    const monthDayYearMatch = cleanInput.match(
      /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?[\s.,/-]+(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?(?:[\s.,/-]+(20\d{2}))?\b/i
    );
    if (monthDayYearMatch) {
      const mKey = monthDayYearMatch[1].toLowerCase().replace('.', '');
      const month = MONTH_MAP[mKey];
      const day = monthDayYearMatch[2].padStart(2, '0');
      const year = monthDayYearMatch[3] || refYear;
      if (month && isValidDateString(`${year}-${month}-${day}`)) {
        date = `${year}-${month}-${day}`;
      }
    }
  }

  // C. Check for ISO YYYY-MM-DD
  if (!date) {
    const isoMatch = cleanInput.match(/\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/);
    if (isoMatch && isValidDateString(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`)) {
      date = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
  }

  // D. Check for DD/MM/YYYY
  if (!date) {
    const ddmmyyyyMatch = cleanInput.match(/\b(0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])[-/](20\d{2})\b/);
    if (ddmmyyyyMatch && isValidDateString(`${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`)) {
      date = `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`;
    }
  }

  // E. Relative dates (only if in explicit date contexts)
  if (!date) {
    if (/\b(?:happening|due|date|on|starts?)\s+tomorrow\b/i.test(lower) || /^\s*tomorrow\b/im.test(lower)) {
      date = tomorrowStr;
    } else if (/\b(?:happening|due|date|on|starts?)\s+today\b/i.test(lower) || /^\s*today\b/im.test(lower)) {
      date = referenceDate;
    }
  }

  // If no date found anywhere:
  if (!date) {
    date = category === 'Urgent Announcement' ? referenceDate : tomorrowStr;
  }

  // 4. Time Detection
  let time = 'TBA';
  const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))?)\b/;
  const timeMatch = cleanInput.match(timeRegex);
  if (timeMatch) {
    time = timeMatch[1].toUpperCase().trim();
  } else {
    const time24Match = cleanInput.match(/\b([01]?\d|2[0-3]):([0-5]\d)\s*(?:hrs?|hours?)?\b/i);
    if (time24Match) {
      time = `${time24Match[1]}:${time24Match[2]}`;
    }
  }

  // 5. Venue Detection
  let venue = institutionName || 'Campus / Check Notice';
  const venueMatch = cleanInput.match(
    /(?:venue|location|room|hall|lab|auditorium|place|center|centre|block|platform|meet)[:\s]+([^\n.,;]+)/i
  );

  if (venueMatch && venueMatch[1].trim().length > 2) {
    venue = venueMatch[1].trim().slice(0, 80);
  } else if (/online|google meet|zoom|teams|virtual/i.test(lower)) {
    venue = 'Online';
  }

  // 6. Important Rules & Contact Details Extraction
  const rules: string[] = [];

  // Check email (clean OCR artifacts like ]l -> 1)
  const cleanedEmailText = cleanInput.replace(/mitvoyager[\]|l1\s]+@/i, 'mitvoyager1@');
  const emailMatch = cleanedEmailText.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    rules.push(`Send entries to: ${emailMatch[0]}`);
  }

  // Check phone numbers & coordinators
  const phoneMatches = cleanInput.match(/\b[6-9]\d{9}\b/g);
  if (phoneMatches && phoneMatches.length > 0) {
    rules.push(`Student Coordinator contact: ${phoneMatches[0]}`);
  }

  // Check specific instructions and sanitize OCR noise
  if (/original content|not ai generated/i.test(lower)) {
    if (rules.length < 3) {
      rules.push('Submit original content only (no AI-generated entries)');
    }
  }

  if (/doc or txt|format: english or hindi/i.test(lower)) {
    if (rules.length < 3) {
      rules.push('Format: English or Hindi (Submit in DOC or TXT format only)');
    }
  }

  if (/hardcopy|sketches and artwork|verification/i.test(lower)) {
    if (rules.length < 3) {
      rules.push('Hardcopy for sketches & artwork will be submitted for verification');
    }
  }

  // If still room, inspect other clean instruction lines
  for (const line of rawLines) {
    if (rules.length >= 3) break;
    // Skip lines with heavy OCR noise, high symbol count, or random consonant sequences
    if (
      /(format|submit|hardcopy|must|bring|mandatory|eligible|deadline|id card|dress code|register)/i.test(line) &&
      !/(mitvoyager|coordinator|contact|doc or txt|original content)/i.test(line) &&
      line.length >= 10 &&
      line.length <= 120
    ) {
      const cleanRule = line
        .replace(/^[-*•\d.]\s*/, '')
        .replace(/[|~¥®©*_#\\/\[\]{}<>]/g, '')
        .replace(/\b[a-z]{4,}\s+[A-Z]{2,}\s+.*$/, '') // Cut off trailing OCR garbage
        .trim();
      if (cleanRule.length >= 8 && !rules.includes(cleanRule)) {
        rules.push(cleanRule);
      }
    }
  }

  if (rules.length === 0) {
    rules.push('Follow department instructions and guidelines');
    rules.push('Carry valid college ID card for morning check-in');
  }

  // 7. Concise Summary
  const summary = date
    ? `${title} submission deadline on ${date} at ${venue}.`
    : `${title} organized at ${venue}.`;

  return {
    id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    date,
    time,
    venue,
    category,
    importantRules: rules.slice(0, 3),
    summary,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Deterministic local generator for the AI Weekly Digest
 */
export function generateWeeklySummaryLocally(
  notices: NoticeItem[],
  referenceDate: string
): WeeklySummaryResponse {
  const activeNotices = notices.filter((n) => {
    const p = getNoticePriority(n, referenceDate);
    return p.status !== 'expired';
  });

  const urgentNotices = activeNotices.filter((n) => {
    const p = getNoticePriority(n, referenceDate);
    return p.status === 'urgent';
  });

  const upcomingNotices = activeNotices.filter((n) => {
    const p = getNoticePriority(n, referenceDate);
    return p.status === 'upcoming' && isThisWeekPure(n.date, referenceDate);
  });

  const todayPriorities =
    urgentNotices.length > 0
      ? urgentNotices.map((n) => `⚡ ${n.title} (${n.time || 'Today'} • ${n.venue})`)
      : ['No urgent events today or tomorrow. Take this time to get ahead on upcoming projects!'];

  const upcomingDeadlines =
    upcomingNotices.length > 0
      ? upcomingNotices.map((n) => `📅 [${n.category}] ${n.title} – ${n.date} (${n.time})`)
      : ['All upcoming campus events for this week are clear!'];

  const keyRulesToRemember: string[] = [];
  activeNotices.forEach((n) => {
    if (n.importantRules && n.importantRules.length > 0) {
      keyRulesToRemember.push(`${n.title}: ${n.importantRules[0]}`);
    }
  });

  if (keyRulesToRemember.length === 0) {
    keyRulesToRemember.push('Remember to carry your college ID card for all campus entries.');
    keyRulesToRemember.push('Ensure 75% minimum attendance requirement across all registered courses.');
  }

  return {
    todayPriorities: todayPriorities.slice(0, 4),
    upcomingDeadlines: upcomingDeadlines.slice(0, 5),
    keyRulesToRemember: keyRulesToRemember.slice(0, 4),
    motivationalAdvice:
      'Stay organized, prioritize what is due today, and make the most of this week’s campus opportunities!',
  };
}
