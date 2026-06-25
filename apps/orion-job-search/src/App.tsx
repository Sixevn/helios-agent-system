import { FormEvent, useMemo, useState } from "react";

type Status =
  | "Saved"
  | "Need Orion Review"
  | "Tailoring"
  | "Ready to Apply"
  | "Applied"
  | "Follow Up"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Closed";
type Priority = "High" | "Medium" | "Low";
type RoleType = "Internship" | "Full-time" | "Part-time" | "Contract";
type Recommendation = "Apply" | "Maybe" | "Skip";
type Industry = "Finance" | "Accounting" | "Banking" | "Sales" | "Operations" | "Analyst" | "Other";
type View = "intake" | "tracker" | "followups" | "profile";

interface IntakeForm {
  company: string;
  role: string;
  location: string;
  jobLink: string;
  roleType: RoleType;
  industries: Industry[];
  posting: string;
  notes: string;
}

interface ApplicationRecord extends IntakeForm {
  id: string;
  status: Status;
  dateSaved: string;
  dateApplied: string;
  followUpDate: string;
  fitScore: number;
  priority: Priority;
  recommendation: Recommendation;
  jobSummary: string;
  keyResponsibilities: string;
  requiredSkills: string;
  preferredSkills: string;
  resumeKeywords: string;
  resumeVersion: string;
  coverLetterNeeded: boolean;
  coverLetterAngle: string;
  outreachTarget: string;
  outreachMessage: string;
  resumeAngle: string;
  bulletSuggestions: string;
  concerns: string;
}

interface AnalysisResult {
  fitScore: number;
  priority: Priority;
  recommendation: Recommendation;
  jobSummary: string;
  keyResponsibilities: string;
  requiredSkills: string;
  preferredSkills: string;
  resumeKeywords: string;
  resumeVersion: string;
  coverLetterNeeded: boolean;
  coverLetterAngle: string;
  outreachTarget: string;
  outreachMessage: string;
  resumeAngle: string;
  bulletSuggestions: string;
  concerns: string;
}

const STORAGE_KEY = "orion_job_search_v1";

const EMPTY_FORM: IntakeForm = {
  company: "",
  role: "",
  location: "Houston, TX",
  jobLink: "",
  roleType: "Internship",
  industries: ["Finance"],
  posting: "",
  notes: ""
};

const STATUS_OPTIONS: Status[] = [
  "Saved",
  "Need Orion Review",
  "Tailoring",
  "Ready to Apply",
  "Applied",
  "Follow Up",
  "Interviewing",
  "Offer",
  "Rejected",
  "Closed"
];
const INDUSTRIES: Industry[] = ["Finance", "Accounting", "Banking", "Sales", "Operations", "Analyst", "Other"];
const ROLE_TYPES: RoleType[] = ["Internship", "Full-time", "Part-time", "Contract"];

const SKILL_BANK: Record<Industry, string[]> = {
  Finance: ["financial analysis", "forecasting", "budgeting", "valuation", "excel", "variance analysis"],
  Accounting: ["accounts payable", "accounts receivable", "reconciliation", "journal entries", "gaap", "audit"],
  Banking: ["credit analysis", "relationship management", "risk", "underwriting", "client service", "portfolio"],
  Sales: ["pipeline", "prospecting", "crm", "customer retention", "lead generation", "negotiation"],
  Operations: ["process improvement", "inventory", "logistics", "reporting", "scheduling", "vendor management"],
  Analyst: ["data analysis", "dashboards", "reporting", "sql", "excel", "research"],
  Other: ["communication", "teamwork", "problem solving", "customer service", "organization", "leadership"]
};

const RESUME_SOURCES = [
  {
    source: "HEB",
    useFor: "customer service, operations, responsibility, consistency",
    caution: "Use for proof of work ethic and customer-facing experience."
  },
  {
    source: "Elliot Electric",
    useFor: "business operations, sales support, inventory, vendor/client exposure",
    caution: "Good bridge for operations, sales, and analyst-adjacent roles."
  },
  {
    source: "University of Houston",
    useFor: "education, Bauer format, finance/accounting coursework",
    caution: "Keep the UH Bauer section order intact."
  },
  {
    source: "Phi Chi Theta",
    useFor: "leadership, professional development, networking",
    caution: "Use when the role values business leadership or campus involvement."
  },
  {
    source: "BP Case Study",
    useFor: "finance analysis, research, presentations, problem solving",
    caution: "Strong for analyst, finance, and corporate roles."
  },
  {
    source: "Core Boys International",
    useFor: "entrepreneurship, content systems, project ownership",
    caution: "Use carefully for traditional finance roles; frame as initiative and execution."
  }
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|(?:\n|\r)+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function matchedKeywords(form: IntakeForm): string[] {
  const text = normalize(`${form.role} ${form.location} ${form.posting}`);
  const targetSkills = form.industries.flatMap((industry) => SKILL_BANK[industry]);
  const commonSignals = [
    "intern",
    "entry level",
    "finance",
    "accounting",
    "banking",
    "sales",
    "operations",
    "analyst",
    "excel",
    "communication",
    "team",
    "client",
    "reporting",
    "houston"
  ];

  return unique([...targetSkills, ...commonSignals]).filter((keyword) => text.includes(keyword));
}

function extractList(text: string, triggers: string[], fallback: string): string {
  const normalizedTriggers = triggers.map(normalize);
  const matches = splitSentences(text)
    .filter((sentence) => normalizedTriggers.some((trigger) => normalize(sentence).includes(trigger)))
    .slice(0, 5);

  if (matches.length === 0) return fallback;
  return matches.map((match) => `- ${match}`).join("\n");
}

function analyzePosting(form: IntakeForm): AnalysisResult {
  const keywords = matchedKeywords(form);
  const text = normalize(`${form.role} ${form.location} ${form.posting}`);
  const preferredTarget = form.industries.some((industry) =>
    ["Finance", "Accounting", "Banking", "Sales", "Operations", "Analyst"].includes(industry)
  );
  const houstonFit = text.includes("houston") || text.includes("remote") || text.includes("hybrid");
  const studentFit = text.includes("intern") || text.includes("entry level") || text.includes("graduate");
  const fullPosting = form.posting.trim();

  let score = 3;
  if (preferredTarget) score += 2;
  if (houstonFit) score += 1;
  if (studentFit || form.roleType === "Internship") score += 1;
  if (keywords.length >= 8) score += 2;
  else if (keywords.length >= 4) score += 1;
  if (text.includes("senior") || text.includes("5+ years") || text.includes("7+ years")) score -= 2;

  const fitScore = clampScore(score);
  const priority: Priority = fitScore >= 8 ? "High" : fitScore >= 6 ? "Medium" : "Low";
  const recommendation: Recommendation = fitScore >= 7 ? "Apply" : fitScore >= 5 ? "Maybe" : "Skip";
  const summarySentences = splitSentences(fullPosting).slice(0, 2).join(" ");
  const jobSummary =
    summarySentences ||
    `${form.company || "This company"} is hiring for ${form.role || "a role"} in ${form.location || "the target market"}.`;
  const keyResponsibilities = extractList(
    fullPosting,
    ["responsib", "manage", "analyze", "support", "prepare", "coordinate", "assist", "report"],
    "- Review the posting manually and confirm the top responsibilities before applying."
  );
  const requiredSkills = extractList(
    fullPosting,
    ["required", "qualification", "experience", "skills", "excel", "communication", "degree"],
    "- Confirm required skills from the job description."
  );
  const preferredSkills = extractList(
    fullPosting,
    ["preferred", "plus", "nice to have", "bonus", "familiarity"],
    "- No clear preferred skills detected."
  );
  const resumeKeywords = keywords.slice(0, 12).join(", ") || "finance, accounting, operations, communication, Excel";
  const company = form.company.trim() || "Target Company";
  const role = form.role.trim() || "Target Role";
  const resumeVersion = `Resume - ${company} - ${role}`;
  const coverLetterNeeded = text.includes("cover letter") || fitScore >= 8;
  const primaryIndustry = form.industries[0] || "Finance";
  const resumeAngle = `Position Evan as a Bauer business student with ${primaryIndustry.toLowerCase()} interest, practical work history, and confirmed proof points from the Resume Profile Bank.`;
  const bulletSuggestions = [
    `Use ${resumeKeywords || "the strongest posting keywords"} only where Evan has real experience.`,
    "Pull matching proof from HEB, Elliot Electric, University of Houston, Phi Chi Theta, BP Case Study, or Core Boys International.",
    "Keep the UH Bauer section order: education, projects if useful, experience, optional honors/activities/interests, skills and certificates.",
    "Mark any claim that is not already confirmed as needs Evan confirmation."
  ].map((item) => `- ${item}`).join("\n");
  const coverLetterAngle = coverLetterNeeded
    ? `Lead with interest in ${primaryIndustry.toLowerCase()}, Houston-area career growth, and one concrete proof point tied to ${role}.`
    : "Skip unless required; use a direct resume plus outreach message instead.";
  const outreachTarget = "Recruiter, hiring manager, alumni contact, or team lead connected to the posting.";
  const outreachMessage = `Hi, I saw the ${role} opening at ${company} and wanted to reach out directly. I am a Bauer business student interested in ${primaryIndustry.toLowerCase()} roles, and the posting stood out because it connects with my experience in operations, analysis, and customer-facing work. I applied and would appreciate the chance to learn what makes a strong candidate for your team.`;
  const concerns = [
    !houstonFit ? "Location may need review against Houston-first target." : "",
    fitScore < 6 ? "Fit is not strong enough to prioritize without a clear networking path." : "",
    text.includes("senior") || text.includes("5+ years") ? "Posting may be above entry-level target." : "",
    fullPosting.length < 300 ? "Posting text is short, so extraction confidence is limited." : ""
  ].filter(Boolean).join("\n") || "No major concern detected. Still verify requirements before applying.";

  return {
    fitScore,
    priority,
    recommendation,
    jobSummary,
    keyResponsibilities,
    requiredSkills,
    preferredSkills,
    resumeKeywords,
    resumeVersion,
    coverLetterNeeded,
    coverLetterAngle,
    outreachTarget,
    outreachMessage,
    resumeAngle,
    bulletSuggestions,
    concerns
  };
}

function loadApplications(): { entries: ApplicationRecord[]; warning: string } {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { entries: [], warning: "" };

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { entries: [], warning: "Saved job data had an invalid shape and was reset." };
    }

    const entries = parsed.filter((item): item is ApplicationRecord => {
      return typeof item === "object" && item !== null && typeof item.id === "string" && typeof item.role === "string";
    });
    return { entries, warning: "" };
  } catch {
    return { entries: [], warning: "Saved job data could not be read and was reset." };
  }
}

function saveApplications(entries: ApplicationRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatExport(record: ApplicationRecord): string {
  return [
    `Company: ${record.company}`,
    `Role: ${record.role}`,
    `Location: ${record.location}`,
    `Job Link: ${record.jobLink}`,
    `Role Type: ${record.roleType}`,
    `Industry: ${record.industries.join(", ")}`,
    `Status: ${record.status}`,
    `Fit Score: ${record.fitScore}`,
    `Priority: ${record.priority}`,
    `Orion Recommendation: ${record.recommendation}`,
    "",
    "Job Summary:",
    record.jobSummary,
    "",
    "Key Responsibilities:",
    record.keyResponsibilities,
    "",
    "Required Skills:",
    record.requiredSkills,
    "",
    "Preferred Skills:",
    record.preferredSkills,
    "",
    "Resume Keywords:",
    record.resumeKeywords,
    "",
    "Resume Version:",
    record.resumeVersion,
    "",
    "Resume Direction:",
    record.resumeAngle,
    record.bulletSuggestions,
    "",
    "Cover Letter Direction:",
    record.coverLetterAngle,
    "",
    "Outreach Direction:",
    `Target: ${record.outreachTarget}`,
    record.outreachMessage,
    "",
    "Application Notes:",
    record.notes || record.concerns
  ].join("\n");
}

export default function App(): JSX.Element {
  const initialLoad = useMemo(() => loadApplications(), []);
  const [form, setForm] = useState<IntakeForm>(EMPTY_FORM);
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialLoad.entries);
  const [selectedId, setSelectedId] = useState(initialLoad.entries[0]?.id || "");
  const [activeView, setActiveView] = useState<View>("intake");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const analysis = useMemo(() => analyzePosting(form), [form]);
  const intakeReady = Boolean(form.company.trim() && form.role.trim() && form.posting.trim().length >= 120);
  const selected = applications.find((entry) => entry.id === selectedId) || applications[0] || null;
  const followUps = applications
    .filter((entry) => entry.followUpDate && !["Rejected", "Closed", "Offer"].includes(entry.status))
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));

  function updateApplications(next: ApplicationRecord[]): void {
    setApplications(next);
    saveApplications(next);
  }

  function updateField<K extends keyof IntakeForm>(field: K, value: IntakeForm[K]): void {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function toggleIndustry(industry: Industry): void {
    setForm((previous) => {
      const exists = previous.industries.includes(industry);
      const next = exists ? previous.industries.filter((item) => item !== industry) : [...previous.industries, industry];
      return { ...previous, industries: next.length ? next : ["Other"] };
    });
  }

  function validate(): string {
    if (!form.company.trim()) return "Company is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.location.trim()) return "Location is required.";
    if (!form.posting.trim() || form.posting.trim().length < 120) {
      return "Paste more of the job posting so Orion has enough context to extract from.";
    }
    return "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError("");
    setCopyStatus("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = analyzePosting(form);
    const savedDate = today();
    const record: ApplicationRecord = {
      ...form,
      ...result,
      id: crypto.randomUUID(),
      status: result.recommendation === "Apply" ? "Need Orion Review" : "Saved",
      dateSaved: savedDate,
      dateApplied: "",
      followUpDate: result.recommendation === "Apply" ? addDays(savedDate, 3) : "",
      notes: form.notes.trim() || result.concerns
    };

    const next = [record, ...applications];
    updateApplications(next);
    setSelectedId(record.id);
    setActiveView("tracker");
    setForm(EMPTY_FORM);
  }

  function updateRecord(id: string, updates: Partial<ApplicationRecord>): void {
    const next = applications.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
    updateApplications(next);
  }

  function removeRecord(id: string): void {
    const next = applications.filter((entry) => entry.id !== id);
    updateApplications(next);
    setSelectedId(next[0]?.id || "");
  }

  async function copySelected(): Promise<void> {
    if (!selected) return;
    await navigator.clipboard.writeText(formatExport(selected));
    setCopyStatus("Copied Notion-ready output.");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Orion Career System</p>
          <h1>Job Search Console</h1>
          <p className="topbar-text">Find stronger roles, tailor truthfully, and keep follow-ups visible.</p>
        </div>
        <div className="metric-strip" aria-label="Job search metrics">
          <span><strong>{applications.length}</strong> saved</span>
          <span><strong>{applications.filter((item) => item.status === "Applied").length}</strong> applied</span>
          <span><strong>{followUps.length}</strong> follow-ups</span>
        </div>
      </header>

      <nav className="tabs" aria-label="Job search views">
        {(["intake", "tracker", "followups", "profile"] as View[]).map((view) => (
          <button
            className={activeView === view ? "tab active" : "tab"}
            key={view}
            onClick={() => setActiveView(view)}
            type="button"
          >
            {view === "intake" ? "Intake" : view === "tracker" ? "Tracker" : view === "followups" ? "Follow-ups" : "Profile Bank"}
          </button>
        ))}
      </nav>

      {initialLoad.warning ? <p className="warning">{initialLoad.warning}</p> : null}

      {activeView === "intake" ? (
        <section className="workspace-grid">
          <form className="panel intake-panel" onSubmit={handleSubmit}>
            <div className="section-heading">
              <h2>Job Posting Intake</h2>
              <span className="pill">{intakeReady ? analysis.recommendation : "Draft"}</span>
            </div>

            <div className="field-grid">
              <label>
                Company
                <input value={form.company} onChange={(event) => updateField("company", event.target.value)} />
              </label>
              <label>
                Role
                <input value={form.role} onChange={(event) => updateField("role", event.target.value)} />
              </label>
              <label>
                Location
                <input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
              </label>
              <label>
                Job Link
                <input value={form.jobLink} onChange={(event) => updateField("jobLink", event.target.value)} />
              </label>
              <label>
                Role Type
                <select value={form.roleType} onChange={(event) => updateField("roleType", event.target.value as RoleType)}>
                  {ROLE_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
            </div>

            <fieldset className="industry-group">
              <legend>Industry Targets</legend>
              {INDUSTRIES.map((industry) => (
                <label className="check-chip" key={industry}>
                  <input
                    checked={form.industries.includes(industry)}
                    onChange={() => toggleIndustry(industry)}
                    type="checkbox"
                  />
                  {industry}
                </label>
              ))}
            </fieldset>

            <label className="full-field">
              Full Job Posting
              <textarea
                className="posting-box"
                value={form.posting}
                onChange={(event) => updateField("posting", event.target.value)}
              />
            </label>
            <label className="full-field">
              Notes
              <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            </label>

            {error ? <p className="error">{error}</p> : null}
            <div className="actions">
              <button className="button primary" type="submit">Save Analysis</button>
              <button className="button" onClick={() => setForm(EMPTY_FORM)} type="button">Clear</button>
            </div>
          </form>

          <aside className="panel readout-panel">
            <div className="score-block">
              <span>Fit Score</span>
              <strong>{intakeReady ? analysis.fitScore : 0}/10</strong>
              <p>{intakeReady ? `${analysis.priority} priority` : "Waiting for posting"}</p>
            </div>
            <div className="readout-list">
              <h2>Orion Readout</h2>
              <p><strong>Resume version:</strong> {intakeReady ? analysis.resumeVersion : "Fill company, role, and posting first."}</p>
              <p><strong>Keywords:</strong> {intakeReady ? analysis.resumeKeywords : "Paste a full job posting to extract keywords."}</p>
              <p><strong>Resume angle:</strong> {intakeReady ? analysis.resumeAngle : "Orion will keep the Bauer format and use only confirmed experience."}</p>
              <p><strong>Concern:</strong> {intakeReady ? analysis.concerns : "Extraction confidence starts after the posting has enough detail."}</p>
            </div>
          </aside>
        </section>
      ) : null}

      {activeView === "tracker" ? (
        <section className="tracker-layout">
          <div className="panel table-panel">
            <div className="section-heading">
              <h2>Application Tracker</h2>
              <button className="button" onClick={() => setActiveView("intake")} type="button">Add Role</button>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state">No roles saved yet.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Fit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((entry) => (
                      <tr
                        className={selected?.id === entry.id ? "selected-row" : ""}
                        key={entry.id}
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <td>{entry.role}</td>
                        <td>{entry.company}</td>
                        <td>{entry.status}</td>
                        <td>{entry.priority}</td>
                        <td>{entry.fitScore}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="panel detail-panel">
            {selected ? (
              <>
                <div className="section-heading">
                  <h2>{selected.role}</h2>
                  <button className="button danger" onClick={() => removeRecord(selected.id)} type="button">Delete</button>
                </div>
                <p className="muted">{selected.company} | {selected.location}</p>
                <div className="detail-grid">
                  <label>
                    Status
                    <select value={selected.status} onChange={(event) => updateRecord(selected.id, { status: event.target.value as Status })}>
                      {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label>
                    Date Applied
                    <input
                      type="date"
                      value={selected.dateApplied}
                      onChange={(event) => updateRecord(selected.id, { dateApplied: event.target.value })}
                    />
                  </label>
                  <label>
                    Follow-Up Date
                    <input
                      type="date"
                      value={selected.followUpDate}
                      onChange={(event) => updateRecord(selected.id, { followUpDate: event.target.value })}
                    />
                  </label>
                </div>
                <div className="copy-block">
                  <pre>{formatExport(selected)}</pre>
                </div>
                <div className="actions">
                  <button className="button primary" onClick={copySelected} type="button">Copy for Notion</button>
                  {selected.jobLink ? <a className="button link-button" href={selected.jobLink} rel="noreferrer" target="_blank">Open Posting</a> : null}
                </div>
                {copyStatus ? <p className="status-note">{copyStatus}</p> : null}
              </>
            ) : (
              <div className="empty-state">Select a role to see details.</div>
            )}
          </aside>
        </section>
      ) : null}

      {activeView === "followups" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Follow-Up Queue</h2>
            <span className="pill">{followUps.length} active</span>
          </div>
          {followUps.length === 0 ? (
            <div className="empty-state">No active follow-ups.</div>
          ) : (
            <ul className="followup-list">
              {followUps.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.company}</strong>
                    <p>{entry.role} | {entry.status}</p>
                  </div>
                  <span>{entry.followUpDate}</span>
                  <button className="button" onClick={() => updateRecord(entry.id, { status: "Follow Up" })} type="button">
                    Mark Follow Up
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {activeView === "profile" ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Resume Profile Bank Lanes</h2>
            <span className="pill">truth gate</span>
          </div>
          <div className="source-grid">
            {RESUME_SOURCES.map((source) => (
              <article className="source-item" key={source.source}>
                <h3>{source.source}</h3>
                <p><strong>Use for:</strong> {source.useFor}</p>
                <p><strong>Rule:</strong> {source.caution}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
