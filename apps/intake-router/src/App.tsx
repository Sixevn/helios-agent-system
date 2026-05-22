import { FormEvent, useMemo, useState } from "react";

type RequestType = "build" | "plan" | "research" | "fix" | "review" | "create" | "unclear";
type Domain =
  | "forge"
  | "achilles"
  | "atlas"
  | "midas"
  | "vitalis"
  | "strategos"
  | "kirin"
  | "helios"
  | "unclear";
type Urgency = "urgent" | "high" | "normal" | "low";
type ScopeBoundary = "core-boys" | "new-system" | "unclear";

interface IntakeFormState {
  requestType: RequestType | "";
  domain: Domain | "";
  urgency: Urgency | "";
  scopeBoundary: ScopeBoundary | "";
  desiredOutput: string;
  constraints: string;
  successCriteria: string;
  secondaryDomain: Domain | "";
  reviewRequired: boolean;
  codexPromptReady: boolean;
}

interface IntakeSubmission {
  id: string;
  requestType: RequestType;
  domain: Domain;
  urgency: Urgency;
  scopeBoundary: ScopeBoundary;
  desiredOutput: string;
  constraints: string;
  successCriteria: string;
  secondaryDomain: Domain | "";
  reviewRequired: boolean;
  codexPromptReady: boolean;
  routedTo: string;
  routeMessage: string;
  createdAt: string;
}

const STORAGE_KEY = "helios_intake_v1";

const REQUEST_TYPES: RequestType[] = ["build", "plan", "research", "fix", "review", "create", "unclear"];
const DOMAINS: Domain[] = [
  "forge",
  "achilles",
  "atlas",
  "midas",
  "vitalis",
  "strategos",
  "kirin",
  "helios",
  "unclear"
];
const URGENCY_OPTIONS: Urgency[] = ["urgent", "high", "normal", "low"];
const SCOPE_OPTIONS: ScopeBoundary[] = ["core-boys", "new-system", "unclear"];

const EMPTY_FORM: IntakeFormState = {
  requestType: "",
  domain: "",
  urgency: "",
  scopeBoundary: "",
  desiredOutput: "",
  constraints: "",
  successCriteria: "",
  secondaryDomain: "",
  reviewRequired: false,
  codexPromptReady: false
};

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function loadSubmissions(): { entries: IntakeSubmission[]; warning: string } {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { entries: [], warning: "" };

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { entries: [], warning: "Stored intake history had an invalid shape and was reset." };
    }

    const entries = parsed.filter((item): item is IntakeSubmission => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.requestType === "string" &&
        typeof item.domain === "string" &&
        typeof item.urgency === "string" &&
        typeof item.scopeBoundary === "string" &&
        typeof item.desiredOutput === "string" &&
        typeof item.constraints === "string" &&
        typeof item.successCriteria === "string" &&
        typeof item.routedTo === "string"
      );
    });

    return { entries, warning: "" };
  } catch {
    return { entries: [], warning: "Stored intake history could not be read and was reset." };
  }
}

function saveSubmissions(entries: IntakeSubmission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function resolveRouting(form: IntakeFormState): { routedTo: string; routeMessage: string } {
  const hasSecondary = Boolean(form.secondaryDomain);
  const differentSecondary = hasSecondary && form.secondaryDomain !== form.domain;

  if (form.domain === "unclear" || form.requestType === "unclear") {
    return { routedTo: "Helios", routeMessage: "Route to: Helios" };
  }

  if (differentSecondary) {
    return {
      routedTo: "Helios",
      routeMessage: "Multi-agent request — Helios will split and assign"
    };
  }

  if (form.requestType === "review") {
    return { routedTo: "Claude (advisory)", routeMessage: "Route to: Claude (advisory)" };
  }

  if (form.requestType === "fix" && form.domain === "forge") {
    return { routedTo: "Forge -> Codex", routeMessage: "Route to: Forge -> Codex" };
  }

  if (form.requestType === "build" && form.domain === "achilles") {
    return { routedTo: "Achilles", routeMessage: "Route to: Achilles" };
  }

  if (form.requestType === "build" && form.domain === "forge") {
    return { routedTo: "Forge -> Codex", routeMessage: "Route to: Forge -> Codex" };
  }

  return {
    routedTo: capitalize(form.domain || "helios"),
    routeMessage: `Route to: ${capitalize(form.domain || "helios")}`
  };
}

export default function App(): JSX.Element {
  const initialLoad = useMemo(() => loadSubmissions(), []);
  const [form, setForm] = useState<IntakeFormState>(EMPTY_FORM);
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>(initialLoad.entries);
  const [output, setOutput] = useState<IntakeSubmission | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [storageWarning] = useState(initialLoad.warning);
  const [copyStatus, setCopyStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showFilteredEmptyStub = false;

  function updateField<K extends keyof IntakeFormState>(field: K, value: IntakeFormState[K]): void {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function validate(): string {
    if (form.requestType === "fix" && !form.desiredOutput.trim()) {
      return "Fix requests must name a target in Desired Output";
    }

    if (form.secondaryDomain && form.secondaryDomain === form.domain) {
      return "Secondary domain must differ from primary domain";
    }

    if (!form.requestType || !form.domain || !form.urgency || !form.scopeBoundary) {
      return "Please fill all required fields before submitting.";
    }

    if (!form.desiredOutput.trim() || !form.constraints.trim() || !form.successCriteria.trim()) {
      return "Please fill all required fields before submitting.";
    }

    if (form.desiredOutput.length > 280 || form.constraints.length > 280 || form.successCriteria.length > 280) {
      return "Desired Output, Constraints, and Success Criteria must each be 280 characters or fewer.";
    }

    if (form.scopeBoundary === "new-system" || form.scopeBoundary === "unclear") {
      return "Scope flagged � Helios approval required";
    }

    return "";
  }

  function resetForNewRequest(): void {
    setForm(EMPTY_FORM);
    setOutput(null);
    setErrorMessage("");
    setCopyStatus("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setCopyStatus("");

    try {
      const validationError = validate();
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      const routing = resolveRouting(form);
      const now = new Date().toISOString();

      const nextSubmission: IntakeSubmission = {
        id: `intake-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        requestType: form.requestType as RequestType,
        domain: form.domain as Domain,
        urgency: form.urgency as Urgency,
        scopeBoundary: form.scopeBoundary as ScopeBoundary,
        desiredOutput: form.desiredOutput.trim(),
        constraints: form.constraints.trim(),
        successCriteria: form.successCriteria.trim(),
        secondaryDomain: form.secondaryDomain,
        reviewRequired: form.reviewRequired,
        codexPromptReady: form.codexPromptReady,
        routedTo: routing.routedTo,
        routeMessage: routing.routeMessage,
        createdAt: now
      };

      setOutput(nextSubmission);
      const nextEntries = [nextSubmission, ...submissions];
      setSubmissions(nextEntries);
      saveSubmissions(nextEntries);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyOutput(): Promise<void> {
    if (!output) return;

    const outputText = [
      "[HELIOS INTAKE — VALIDATED]",
      `requestType:      ${output.requestType}`,
      `domain:           ${output.domain}`,
      `urgency:          ${output.urgency}`,
      `scopeBoundary:    ${output.scopeBoundary}`,
      `desiredOutput:    ${output.desiredOutput}`,
      `constraints:      ${output.constraints}`,
      `successCriteria:  ${output.successCriteria}`,
      `routedTo:         ${output.routedTo}`,
      `secondaryDomain:  ${output.secondaryDomain || "—"}`,
      `reviewRequired:   ${output.reviewRequired}`,
      `codexPromptReady: ${output.codexPromptReady}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(outputText);
      setCopyStatus("Output copied to clipboard.");
    } catch {
      setCopyStatus("Copy failed in this browser. Copy manually from the output panel.");
    }
  }

  function deleteSubmission(id: string): void {
    const nextEntries = submissions.filter((item) => item.id !== id);
    setSubmissions(nextEntries);
    saveSubmissions(nextEntries);
  }

  function clearAllHistory(): void {
    const approved = window.confirm("Clear all intake history?");
    if (!approved) return;
    setSubmissions([]);
    saveSubmissions([]);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Helios Unified Intake Router</h1>
        <p>Validate requests, route cleanly, and keep local intake history.</p>
      </header>

      {storageWarning ? <p className="warning">{storageWarning}</p> : null}

      <main className="panel">
        <h2>New Intake Request</h2>
        <form className="intake-form" onSubmit={handleSubmit}>
          <label>
            Request Type *
            <select
              value={form.requestType}
              onChange={(event) => updateField("requestType", event.target.value as RequestType | "")}
            >
              <option value="">Select request type</option>
              {REQUEST_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Domain *
            <select value={form.domain} onChange={(event) => updateField("domain", event.target.value as Domain | "")}>
              <option value="">Select domain</option>
              {DOMAINS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Urgency *
            <select
              value={form.urgency}
              onChange={(event) => updateField("urgency", event.target.value as Urgency | "")}
            >
              <option value="">Select urgency</option>
              {URGENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Scope Boundary *
            <select
              value={form.scopeBoundary}
              onChange={(event) => updateField("scopeBoundary", event.target.value as ScopeBoundary | "")}
            >
              <option value="">Select scope</option>
              {SCOPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Secondary Domain
            <select
              value={form.secondaryDomain}
              onChange={(event) => updateField("secondaryDomain", event.target.value as Domain | "")}
            >
              <option value="">None</option>
              {DOMAINS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.reviewRequired}
              onChange={(event) => updateField("reviewRequired", event.target.checked)}
            />
            Review Required
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.codexPromptReady}
              onChange={(event) => updateField("codexPromptReady", event.target.checked)}
            />
            Codex Prompt Ready
          </label>

          <label className="full-width">
            Desired Output *
            <textarea
              value={form.desiredOutput}
              onChange={(event) => updateField("desiredOutput", event.target.value)}
              maxLength={280}
              rows={4}
            />
            <span className="counter">{form.desiredOutput.length}/280</span>
          </label>

          <label className="full-width">
            Constraints *
            <textarea
              value={form.constraints}
              onChange={(event) => updateField("constraints", event.target.value)}
              maxLength={280}
              rows={4}
            />
            <span className="counter">{form.constraints.length}/280</span>
          </label>

          <label className="full-width">
            Success Criteria *
            <textarea
              value={form.successCriteria}
              onChange={(event) => updateField("successCriteria", event.target.value)}
              maxLength={280}
              rows={4}
            />
            <span className="counter">{form.successCriteria.length}/280</span>
          </label>

          {errorMessage ? <p className="error">{errorMessage}</p> : null}

          <div className="form-actions full-width">
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Validate and Route"}
            </button>
            <button type="button" className="button" onClick={resetForNewRequest}>
              New Request
            </button>
          </div>
        </form>
      </main>

      <section className="panel">
        <div className="section-header">
          <h2>Validated Output</h2>
          <button type="button" className="button" onClick={handleCopyOutput} disabled={!output}>
            Copy Output
          </button>
        </div>

        {!output ? (
          <div className="empty-state">
            <p>Submit a valid intake request to generate the validated output block.</p>
          </div>
        ) : (
          <>
            <pre className="output-block">{`[HELIOS INTAKE — VALIDATED]
requestType:      ${output.requestType}
domain:           ${output.domain}
urgency:          ${output.urgency}
scopeBoundary:    ${output.scopeBoundary}
desiredOutput:    ${output.desiredOutput}
constraints:      ${output.constraints}
successCriteria:  ${output.successCriteria}
routedTo:         ${output.routedTo}
secondaryDomain:  ${output.secondaryDomain || "—"}
reviewRequired:   ${output.reviewRequired}
codexPromptReady: ${output.codexPromptReady}`}</pre>
            <p className="route-note">{output.routeMessage}</p>
          </>
        )}

        {copyStatus ? <p className="status">{copyStatus}</p> : null}
      </section>

      <section className="panel">
        <div className="section-header">
          <h2>Submission History</h2>
          <button type="button" className="button danger" onClick={clearAllHistory} disabled={submissions.length === 0}>
            Clear all history
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-state">
            <p>No submissions yet. Your validated intake records will appear here.</p>
          </div>
        ) : (
          <ul className="history-list">
            {submissions.map((item) => (
              <li key={item.id} className="history-item">
                <div>
                  <p className="history-summary">
                    {item.requestType} / {item.domain} / {item.urgency} / {item.routedTo}
                  </p>
                  <p className="history-text">{item.desiredOutput.slice(0, 60)}</p>
                </div>
                <button type="button" className="button danger" onClick={() => deleteSubmission(item.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        {showFilteredEmptyStub ? (
          <div className="empty-state filtered-stub">
            <p>No results match.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
