export const suggestionFields = [
  "stand",
  "registration",
  "aircraftType",
  "turnaroundTime",
  "destination",
  "arrivalDeparture",
];

export function buildSmartSuggestion({ flight, completedJobs = [], memory = {} }) {
  const target = {
    flightNumber: normalize(flight?.flightNumber),
    destination: normalize(flight?.destination),
    arrivalDeparture: normalize(flight?.movement || flight?.type),
    registration: normalize(flight?.aircraftRegistration || flight?.registration),
    aircraftType: normalize(flight?.aircraftType || flight?.aircraft),
  };

  const candidates = completedJobs
    .map((job) => ({ job, score: candidateScore(target, job) }))
    .filter((item) => item.score > 0);

  const confidenceByField = {};
  const suggestedValues = {};

  for (const field of suggestionFields) {
    const votes = new Map();
    let totalWeight = 0;

    for (const { job, score } of candidates) {
      const value = extractFieldValue(field, job);
      if (!value) continue;
      const weight = score;
      totalWeight += weight;
      votes.set(value, (votes.get(value) || 0) + weight);
    }

    const signature = suggestionSignature(target);
    const memoryField = memory?.[signature]?.fields?.[field] || {};
    for (const [value, count] of Object.entries(memoryField)) {
      if (!value) continue;
      const weight = Number(count || 0);
      totalWeight += weight;
      votes.set(value, (votes.get(value) || 0) + weight);
    }

    const top = Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0];
    if (!top || totalWeight <= 0) {
      confidenceByField[field] = 0;
      continue;
    }

    const [topValue, topWeight] = top;
    const sampleFactor = Math.min(Math.max(candidates.length / 4, 0.25), 1);
    const confidence = Math.min((topWeight / totalWeight) * sampleFactor, 1);

    confidenceByField[field] = round(confidence);
    suggestedValues[field] = topValue;
  }

  const confidences = Object.values(confidenceByField);
  const overallConfidence = confidences.length
    ? round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length)
    : 0;

  const autoApplied = overallConfidence >= 0.75;

  return {
    message: candidates.length > 0 ? "Based on previous jobs" : "No previous pattern found",
    basedOnCount: candidates.length,
    confidence: overallConfidence,
    confidenceByField,
    suggestedValues,
    autoApplied,
    signature: suggestionSignature(target),
  };
}

export function learnSuggestionFeedback(memory = {}, { job, accepted }) {
  const signature = job?.suggestionMeta?.signature || suggestionSignature({
    flightNumber: normalize(job?.flightNumber),
    destination: normalize(job?.destination),
    arrivalDeparture: normalize(job?.arrivalDeparture || job?.movement),
  });

  if (!signature) return memory;

  const current = memory[signature] || { accepted: 0, edited: 0, fields: {} };
  const updated = {
    ...current,
    accepted: current.accepted + (accepted ? 1 : 0),
    edited: current.edited + (accepted ? 0 : 1),
    fields: { ...(current.fields || {}) },
  };

  for (const field of suggestionFields) {
    const value = extractFieldValue(field, job);
    if (!value) continue;
    if (!updated.fields[field]) {
      updated.fields[field] = {};
    }
    updated.fields[field][value] = (updated.fields[field][value] || 0) + 1;
  }

  return {
    ...memory,
    [signature]: updated,
  };
}

function candidateScore(target, job) {
  let score = 0;

  const flightNo = normalize(job?.flightNumber);
  const destination = normalize(job?.destination);
  const movement = normalize(job?.arrivalDeparture || job?.movement);
  const registration = normalize(job?.registration || job?.aircraftRegistration);
  const aircraftType = normalize(job?.aircraftType);

  if (target.flightNumber && flightNo && target.flightNumber === flightNo) score += 4;
  if (target.destination && destination && target.destination === destination) score += 2;
  if (target.arrivalDeparture && movement && target.arrivalDeparture === movement) score += 1;
  if (target.registration && registration && target.registration === registration) score += 2;
  if (target.aircraftType && aircraftType && target.aircraftType === aircraftType) score += 1;

  return score;
}

function extractFieldValue(field, job) {
  if (field === "stand") return normalize(job?.stand);
  if (field === "registration") return normalize(job?.registration || job?.aircraftRegistration);
  if (field === "aircraftType") return String(job?.aircraftType || "").trim();
  if (field === "turnaroundTime") {
    if (job?.turnaroundTime) return String(job.turnaroundTime).trim();
    const mins = calculateMinutes(job?.startedAt, job?.completedAt);
    return mins > 0 ? `${mins} min` : "";
  }
  if (field === "destination") return String(job?.destination || "").trim();
  if (field === "arrivalDeparture") return String(job?.arrivalDeparture || job?.movement || "").trim();
  return "";
}

function suggestionSignature(target) {
  const parts = [target.flightNumber, target.destination, target.arrivalDeparture]
    .map((v) => normalize(v));
  return parts.filter(Boolean).join("|");
}

function calculateMinutes(startedAt, completedAt) {
  const start = new Date(startedAt || "").getTime();
  const end = new Date(completedAt || "").getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function round(value) {
  return Math.round(value * 100) / 100;
}
