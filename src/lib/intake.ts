export type IntakeState = {
  name?: string;
  phone?: string;
  email?: string;
  propertyAddress?: string;
  propertyCity?: string;
  timeline?: string;
  situation?: string;
  propertyCondition?: string;
  notes?: string;
};

export type IntakeField = keyof IntakeState;

const knownCities = [
  "austin",
  "round rock",
  "cedar park",
  "pflugerville",
  "georgetown",
  "leander",
  "buda",
  "kyle",
  "san marcos",
  "bastrop",
  "manor",
  "hutto",
  "del valle",
  "lakeway",
  "bee cave",
];

const streetWords = "street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|circle|cir|boulevard|blvd|way|trail|trl|place|pl|loop|terrace|ter";

function clean(value: string) {
  return value.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim().replace(/[.,;:!?]+$/, "");
}

function titleCase(value: string) {
  return clean(value).replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function pickSituation(text: string) {
  const lowered = text.toLowerCase();
  if (/inherit|probate|estate/.test(lowered)) return "Inherited / probate property";
  if (/tenant|renter|rental|landlord/.test(lowered)) return "Tenant-occupied or rental property";
  if (/foreclos|behind|late payment|default|auction/.test(lowered)) return "Behind on payments / foreclosure concern";
  if (/divorce|separat/.test(lowered)) return "Divorce or life transition";
  if (/relocat|moving|job transfer/.test(lowered)) return "Relocation";
  if (/vacant|empty/.test(lowered)) return "Vacant property";
  if (/repair|roof|foundation|damage|as-is|as is|fix|old|outdated|fire|water|mold/.test(lowered)) return "Needs repairs / as-is sale";
  if (/fast|quick|cash offer|cash/.test(lowered)) return "Wants to sell quickly";
  return undefined;
}

function pickTimeline(text: string) {
  const lowered = text.toLowerCase();
  if (/asap|immediately|right away|urgent|this week|few days/.test(lowered)) return "ASAP";
  if (/30 days|thirty days|within a month|this month/.test(lowered)) return "Within 30 days";
  if (/60 days|90 days|1-3 months|1 to 3 months|few months|couple months/.test(lowered)) return "1-3 months";
  if (/exploring|not sure|just looking|curious|eventually/.test(lowered)) return "Just exploring";
  return undefined;
}

function pickCondition(text: string) {
  const lowered = text.toLowerCase();
  const matches: string[] = [];
  if (/roof/.test(lowered)) matches.push("roof issues");
  if (/foundation/.test(lowered)) matches.push("foundation issues");
  if (/water|flood/.test(lowered)) matches.push("water damage");
  if (/fire|smoke/.test(lowered)) matches.push("fire/smoke damage");
  if (/mold/.test(lowered)) matches.push("mold concern");
  if (/tenant|renter/.test(lowered)) matches.push("tenant-related wear or occupancy");
  if (/outdated|old|needs updating/.test(lowered)) matches.push("outdated interior");
  if (/repair|fix|work|damage/.test(lowered) && matches.length === 0) matches.push("needs repairs");
  return matches.length ? titleCase(matches.join(", ")) : undefined;
}

function pickCity(text: string) {
  const lowered = text.toLowerCase();
  for (const city of knownCities) {
    if (new RegExp(`\\b${city.replace(/ /g, "\\s+")}\\b`, "i").test(lowered)) return titleCase(city);
  }
  const inCity = text.match(/(?:in|near|around|city is|property is in)\s+([A-Za-z][A-Za-z\s.-]{1,40})/i);
  if (inCity?.[1]) return titleCase(inCity[1].split(/,|\./)[0]);
  return undefined;
}

function pickAddress(text: string) {
  const addressPattern = new RegExp(`\\b\\d{2,6}\\s+[A-Za-z0-9 .'-]{2,80}\\s+(?:${streetWords})\\b(?:[.,]?\\s*(?:apt|unit|#)\\s*[A-Za-z0-9-]+)?`, "i");
  const match = text.match(addressPattern);
  return match?.[0] ? clean(match[0]) : undefined;
}

function pickName(text: string) {
  const patterns = [
    /(?:my name is|this is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
    /(?:name:)\s*([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1] && !/behind|moving|looking|trying|interested|calling/i.test(match[1])) return titleCase(match[1]);
  }
  return undefined;
}

export function extractIntakeFromText(text: string, current: IntakeState = {}): IntakeState {
  const next: IntakeState = { ...current };
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/)?.[0];
  const address = pickAddress(text);
  const city = pickCity(text);
  const name = pickName(text);
  const timeline = pickTimeline(text);
  const situation = pickSituation(text);
  const condition = pickCondition(text);

  if (email && !next.email) next.email = email;
  if (phone && !next.phone) next.phone = clean(phone);
  if (address && !next.propertyAddress) next.propertyAddress = address;
  if (city && !next.propertyCity) next.propertyCity = city;
  if (name && !next.name) next.name = name;
  if (timeline && !next.timeline) next.timeline = timeline;
  if (situation && !next.situation) next.situation = situation;
  if (condition && !next.propertyCondition) next.propertyCondition = condition;

  const note = clean(text);
  if (note && note.length > 10) {
    const existing = next.notes ? `${next.notes}\n${note}` : note;
    next.notes = existing.slice(-1800);
  }

  return next;
}

export function extractIntakeFromMessages(messages: Array<{ role: string; content: string }>) {
  return messages.reduce<IntakeState>((state, message) => {
    if (message.role !== "user") return state;
    return extractIntakeFromText(message.content, state);
  }, {});
}

export function getMissingIntakeField(intake: IntakeState): IntakeField | null {
  if (!intake.propertyCity) return "propertyCity";
  if (!intake.propertyAddress) return "propertyAddress";
  if (!intake.situation) return "situation";
  if (!intake.timeline) return "timeline";
  if (!intake.propertyCondition) return "propertyCondition";
  if (!intake.name) return "name";
  if (!intake.phone) return "phone";
  if (!intake.email) return "email";
  return null;
}

export function questionForField(field: IntakeField | null) {
  switch (field) {
    case "propertyCity":
      return "What city is the property in?";
    case "propertyAddress":
      return "What is the property address? You can share just the street address for now.";
    case "situation":
      return "What best describes the situation: repairs, inherited property, tenants, vacant, behind on payments, relocation, or just wanting to sell fast?";
    case "timeline":
      return "What timeline are you hoping for: ASAP, within 30 days, 1-3 months, or just exploring?";
    case "propertyCondition":
      return "How would you describe the property's condition? For example, move-in ready, outdated, roof issues, foundation concerns, or needs major repairs.";
    case "name":
      return "What is your name so the team knows who to follow up with?";
    case "phone":
      return "What is the best phone number for a quick follow-up?";
    case "email":
      return "What email should we use as a backup contact?";
    default:
      return "Thanks. A team member can review the details and follow up about next steps.";
  }
}

export function canCreateLead(intake: IntakeState) {
  return Boolean(intake.name && intake.phone && (intake.propertyAddress || intake.propertyCity) && (intake.timeline || intake.situation));
}

export function capturedFieldLabels(intake: IntakeState) {
  return {
    name: intake.name || "",
    phone: intake.phone || "",
    email: intake.email || "",
    propertyAddress: intake.propertyAddress || "",
    propertyCity: intake.propertyCity || "",
    timeline: intake.timeline || "",
    situation: intake.situation || "",
    propertyCondition: intake.propertyCondition || "",
  };
}

export function fallbackGuidedReply(userMessage: string, intake: IntakeState, leadCreated: boolean) {
  const lowered = userMessage.toLowerCase();
  let answer = "Thanks for sharing that.";

  if (/as-is|as is|repair|fix|roof|foundation|damage/.test(lowered)) {
    answer = "Yes. This type of cash-offer process is designed for as-is situations, so sellers may not need to make repairs, clean out the house, or prepare it for showings.";
  } else if (/fast|close|timeline|how long|soon/.test(lowered)) {
    answer = "Closing timing depends on the property and title process, but the goal is to give sellers a simpler path and a timeline that can be faster than a traditional listing.";
  } else if (/tenant|renter|lease/.test(lowered)) {
    answer = "Tenant-occupied properties may still be a fit. The team would need a few details about the property and situation before discussing options.";
  } else if (/commission|fee|cost/.test(lowered)) {
    answer = "Selling directly for cash usually means no realtor commissions and no public showings. Any offer details should be reviewed with the team before deciding.";
  } else if (/foreclos|behind|payment|auction/.test(lowered)) {
    answer = "The team can discuss a possible fast sale, but this chat cannot give legal or financial advice or guarantee any foreclosure outcome. If there is a deadline, it is best to speak with the team and a qualified professional quickly.";
  } else if (/cash offer|offer|price|value/.test(lowered)) {
    answer = "A specific offer requires property review. I can collect the basics so the team can follow up with next steps.";
  }

  if (leadCreated) {
    return `${answer} I have enough information to create a lead for follow-up. ${questionForField(getMissingIntakeField(intake))}`;
  }

  return `${answer} ${questionForField(getMissingIntakeField(intake))}`;
}
