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

export type IntakeField =
  | "propertyCity"
  | "propertyAddress"
  | "situation"
  | "timeline"
  | "propertyCondition"
  | "followUpPermission"
  | "name"
  | "phone"
  | "email";

export type ConversationMode = "qa" | "intake" | "handoff";
export type LeadReadiness = "low" | "medium" | "high" | "ready_for_contact";

export type ChatState = {
  intake: IntakeState;
  lastAskedField: IntakeField | null;
  conversationMode: ConversationMode;
  leadReadiness: LeadReadiness;
  followUpPermission: boolean | null;
  leadCreated: boolean;
};

export type TurnResult = {
  state: ChatState;
  questionAnswer?: string;
  assignedField: IntakeField | null;
  nextQuestion: string | null;
};

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

const streetWords =
  "street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|circle|cir|boulevard|blvd|way|trail|trl|place|pl|loop|terrace|ter|parkway|pkwy";

export function initialChatState(partial?: Partial<ChatState>): ChatState {
  return {
    intake: partial?.intake || {},
    lastAskedField: partial?.lastAskedField ?? "propertyCity",
    conversationMode: partial?.conversationMode || "intake",
    leadReadiness: partial?.leadReadiness || "low",
    followUpPermission: partial?.followUpPermission ?? null,
    leadCreated: partial?.leadCreated || false,
  };
}

function clean(value: string) {
  return value
    .replace(/[\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/[.,;:!?]+$/, "");
}

function titleCase(value: string) {
  return clean(value).replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function appendNote(intake: IntakeState, text: string) {
  const note = clean(text);
  if (!note || note.length < 10) return intake;
  const existing = intake.notes ? `${intake.notes}\n${note}` : note;
  return { ...intake, notes: existing.slice(-1800) };
}

export function isLikelyQuestion(text: string) {
  const lowered = clean(text).toLowerCase();
  if (!lowered) return false;
  if (lowered.includes("?")) return true;
  return /^(do|does|did|can|could|will|would|should|are|is|am|how|what|when|where|why|who)\b/.test(lowered);
}

export function isAffirmative(text: string) {
  return /\b(yes|yeah|yep|sure|ok|okay|please|call me|contact me|follow up|that works|sounds good)\b/i.test(text);
}

export function isNegative(text: string) {
  return /\b(no|nope|not now|don't|do not|just looking|not yet|no thanks)\b/i.test(text);
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
  return clean(text).length > 2 ? titleCase(text) : undefined;
}

function pickTimeline(text: string) {
  const lowered = text.toLowerCase();
  if (/asap|immediately|right away|urgent|this week|few days|now/.test(lowered)) return "ASAP";
  if (/30 days|thirty days|within a month|this month/.test(lowered)) return "Within 30 days";
  if (/60 days|90 days|1-3 months|1 to 3 months|few months|couple months/.test(lowered)) return "1-3 months";
  if (/exploring|not sure|just looking|curious|eventually/.test(lowered)) return "Just exploring";
  return clean(text).length > 1 ? titleCase(text) : undefined;
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
  if (matches.length) return titleCase(matches.join(", "));
  return clean(text).length > 2 ? titleCase(text) : undefined;
}

function pickCity(text: string) {
  const lowered = text.toLowerCase();
  for (const city of knownCities) {
    if (new RegExp(`\\b${city.replace(/ /g, "\\\\s+")}\\b`, "i").test(lowered)) return titleCase(city);
  }
  const inCity = text.match(/(?:in|near|around|city is|property is in|house is in)\s+([A-Za-z][A-Za-z\s.-]{1,40})/i);
  if (inCity?.[1]) return titleCase(inCity[1].split(/,|\./)[0]);
  const simple = clean(text);
  if (/^[A-Za-z][A-Za-z\s.-]{1,40}$/.test(simple) && simple.split(/\s+/).length <= 4) return titleCase(simple);
  return undefined;
}

function pickAddress(text: string) {
  const cleaned = clean(text);
  const addressPattern = new RegExp(`\\b\\d{1,6}\\s+[A-Za-z0-9 .'-]{2,80}\\s+(?:${streetWords})\\b(?:[.,]?\\s*(?:apt|unit|#)\\s*[A-Za-z0-9-]+)?`, "i");
  const match = cleaned.match(addressPattern);
  if (match?.[0]) return clean(match[0]);
  // While answering the address prompt, short street-only answers such as "Front st" are acceptable.
  const streetOnlyPattern = new RegExp(`^[A-Za-z0-9 .'-]{2,80}\\s+(?:${streetWords})$`, "i");
  if (streetOnlyPattern.test(cleaned)) return cleaned;
  return undefined;
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
  const simple = clean(text);
  if (/^[A-Za-z]+(?:\s+[A-Za-z]+){0,2}$/.test(simple) && !/^(yes|no|asap|austin|repairs|tenant|vacant)$/i.test(simple)) return titleCase(simple);
  return undefined;
}

function pickEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function pickPhone(text: string) {
  return text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/)?.[0];
}

function applyExplicitExtraction(text: string, intake: IntakeState, allowSituationAndCondition: boolean) {
  let next = { ...intake };
  const email = pickEmail(text);
  const phone = pickPhone(text);
  const address = pickAddress(text);
  const city = pickCity(text);
  const name = pickName(text);
  const timeline = pickTimeline(text);
  const situation = allowSituationAndCondition ? pickSituation(text) : undefined;
  const condition = allowSituationAndCondition ? pickCondition(text) : undefined;

  if (email && !next.email) next.email = email;
  if (phone && !next.phone) next.phone = clean(phone);
  if (address && !next.propertyAddress) next.propertyAddress = address;
  if (city && !next.propertyCity) next.propertyCity = city;
  if (name && !next.name) next.name = name;
  if (timeline && !next.timeline) next.timeline = timeline;
  if (situation && !next.situation) next.situation = situation;
  if (condition && !next.propertyCondition) next.propertyCondition = condition;
  return appendNote(next, text);
}

function assignAnswerToField(field: IntakeField | null, text: string, intake: IntakeState) {
  if (!field || field === "followUpPermission") return { intake, assigned: null as IntakeField | null };
  let value: string | undefined;
  switch (field) {
    case "propertyCity":
      value = pickCity(text);
      break;
    case "propertyAddress":
      value = pickAddress(text) || (clean(text).length >= 2 && clean(text).length <= 100 ? clean(text) : undefined);
      break;
    case "situation":
      value = pickSituation(text);
      break;
    case "timeline":
      value = pickTimeline(text);
      break;
    case "propertyCondition":
      value = pickCondition(text);
      break;
    case "name":
      value = pickName(text);
      break;
    case "phone":
      value = pickPhone(text) || clean(text);
      break;
    case "email":
      value = pickEmail(text) || clean(text);
      break;
  }

  if (!value) return { intake, assigned: null as IntakeField | null };
  const keyByField: Record<Exclude<IntakeField, "followUpPermission">, keyof IntakeState> = {
    propertyCity: "propertyCity",
    propertyAddress: "propertyAddress",
    situation: "situation",
    timeline: "timeline",
    propertyCondition: "propertyCondition",
    name: "name",
    phone: "phone",
    email: "email",
  };
  return {
    intake: appendNote({ ...intake, [keyByField[field]]: value }, text),
    assigned: field,
  };
}

export function sellerQuestionAnswer(userMessage: string) {
  const lowered = userMessage.toLowerCase();
  if (/as-is|as is|repair|fix|roof|foundation|damage|clean|showing/.test(lowered)) {
    return "Yes. Many cash buyers purchase houses as-is, so sellers may not need to make repairs, clean out the property, or prepare it for showings.";
  }
  if (/fast|close|timeline|how long|soon/.test(lowered)) {
    return "Closing timing depends on the property and title process, but the goal is to give sellers a simpler path and a timeline that may be faster than a traditional listing.";
  }
  if (/tenant|renter|lease/.test(lowered)) {
    return "Tenant-occupied properties may still be a fit. The team would need a few details about the property and lease situation before discussing options.";
  }
  if (/commission|fee|cost|closing cost/.test(lowered)) {
    return "Selling directly for cash often means no realtor commissions and no public showings. Any final offer terms should be reviewed with the team before deciding.";
  }
  if (/foreclos|behind|payment|auction/.test(lowered)) {
    return "The team can discuss a possible fast sale option, but this chat cannot give legal or financial advice or guarantee any foreclosure outcome. If there is a deadline, it is best to speak with the team and a qualified professional quickly.";
  }
  if (/cash offer|offer|price|value|worth/.test(lowered)) {
    return "A specific offer requires a property review. I can collect the basics so the team can follow up with next steps, and there is no obligation to accept an offer.";
  }
  if (/area|where|service/.test(lowered)) {
    return "This demo is focused on Austin-area properties and nearby communities. The team would confirm whether a specific property is in their buying area.";
  }
  return undefined;
}

function propertyBasicsCaptured(intake: IntakeState) {
  return Boolean(intake.propertyCity && intake.propertyAddress && (intake.situation || intake.timeline || intake.propertyCondition));
}

function readinessFor(intake: IntakeState, followUpPermission: boolean | null): LeadReadiness {
  if (followUpPermission && intake.name && (intake.phone || intake.email)) return "ready_for_contact";
  if (propertyBasicsCaptured(intake)) return "high";
  if (intake.propertyCity || intake.propertyAddress || intake.situation || intake.timeline || intake.propertyCondition) return "medium";
  return "low";
}

export function getNextIntakeField(state: ChatState): IntakeField | null {
  const intake = state.intake;
  if (!intake.propertyCity) return "propertyCity";
  if (!intake.propertyAddress) return "propertyAddress";
  if (!intake.situation) return "situation";
  if (!intake.timeline) return "timeline";
  if (!intake.propertyCondition) return "propertyCondition";
  if (state.followUpPermission !== true) return "followUpPermission";
  if (!intake.name) return "name";
  if (!intake.phone) return "phone";
  if (!intake.email) return "email";
  return null;
}

export function getMissingIntakeField(intake: IntakeState): IntakeField | null {
  return getNextIntakeField(initialChatState({ intake, followUpPermission: true }));
}

export function questionForField(field: IntakeField | null) {
  switch (field) {
    case "propertyCity":
      return "What city is the property in?";
    case "propertyAddress":
      return "What is the property address? You can share just the street address for now.";
    case "situation":
      return "What best describes the situation with the property, such as repairs, inherited property, tenants, vacant, behind on payments, relocation, or just wanting to sell fast?";
    case "timeline":
      return "What timeline are you hoping for: ASAP, within 30 days, 1-3 months, or just exploring?";
    case "propertyCondition":
      return "How would you describe the property's condition? For example, move-in ready, outdated, roof issues, foundation concerns, or needs major repairs.";
    case "followUpPermission":
      return "Based on what you shared, this sounds like something the team may be able to review. Would you like someone to follow up with you about the property?";
    case "name":
      return "What is your name so the team knows who to follow up with?";
    case "phone":
      return "What is the best phone number to reach you?";
    case "email":
      return "What email should we use as a backup contact?";
    default:
      return null;
  }
}

export function processUserTurn(userMessage: string, currentState?: Partial<ChatState>): TurnResult {
  const starting = initialChatState(currentState);
  const text = clean(userMessage);
  const askedField = starting.lastAskedField;
  const userAskedQuestion = isLikelyQuestion(text);
  const answer = sellerQuestionAnswer(text);

  let intake = { ...starting.intake };
  let followUpPermission = starting.followUpPermission;
  let assignedField: IntakeField | null = null;
  let conversationMode: ConversationMode = answer ? "qa" : starting.conversationMode;

  if (askedField === "followUpPermission" && !userAskedQuestion) {
    if (isAffirmative(text)) {
      followUpPermission = true;
      assignedField = "followUpPermission";
      conversationMode = "handoff";
    } else if (isNegative(text)) {
      followUpPermission = false;
      assignedField = "followUpPermission";
      conversationMode = "qa";
    }
  }

  // If the visitor is answering the last intake question, that answer wins over broad extraction.
  // This prevents repeats like asking for address again after "Front st".
  if (!assignedField && askedField && askedField !== "followUpPermission" && !userAskedQuestion) {
    const result = assignAnswerToField(askedField, text, intake);
    intake = result.intake;
    assignedField = result.assigned;
    conversationMode = "intake";
  }

  // If no focused assignment happened, do conservative extraction.
  // For questions, avoid extracting situation/condition from the question itself.
  if (!assignedField) {
    intake = applyExplicitExtraction(text, intake, !userAskedQuestion);
  }

  const tempState = initialChatState({ ...starting, intake, followUpPermission });
  tempState.leadReadiness = readinessFor(intake, followUpPermission);
  tempState.conversationMode = conversationMode;
  const nextField = getNextIntakeField(tempState);

  const state: ChatState = {
    ...tempState,
    lastAskedField: nextField,
  };

  return {
    state,
    questionAnswer: answer,
    assignedField,
    nextQuestion: questionForField(nextField),
  };
}

export function extractIntakeFromText(text: string, current: IntakeState = {}): IntakeState {
  return applyExplicitExtraction(text, current, !isLikelyQuestion(text));
}

export function extractIntakeFromMessages(messages: Array<{ role: string; content: string }>) {
  return messages.reduce<IntakeState>((state, message) => {
    if (message.role !== "user") return state;
    return extractIntakeFromText(message.content, state);
  }, {});
}

export function canCreateLead(intake: IntakeState) {
  return Boolean(intake.name && (intake.phone || intake.email) && (intake.propertyAddress || intake.propertyCity));
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

export function fallbackGuidedReply(userMessage: string, state: ChatState, questionAnswer?: string) {
  const nextQuestion = questionForField(state.lastAskedField);
  const prefix = questionAnswer || "Thanks for sharing that.";

  if (state.followUpPermission === false && state.lastAskedField === "followUpPermission") {
    return `${prefix} No problem. I can keep answering questions, and there is no obligation to request follow-up.`;
  }

  if (!nextQuestion) {
    return `${prefix} I have the basics for follow-up. There is no obligation to accept an offer.`;
  }

  return `${prefix} ${nextQuestion}`;
}
