import { FormEvent, useMemo, useState } from "react";
import { LANGUAGES, PLATFORMS } from "./constants";
import { loadCapcutTemplates, saveCapcutTemplates } from "./storage";
import type { CapcutTemplateEntry, CapcutTemplateFormState } from "./types";

type TemplateFilterState = {
  platform: string;
  language: string;
};

const INITIAL_TEMPLATE_FILTERS: TemplateFilterState = {
  platform: "all",
  language: "all"
};

const EMPTY_TEMPLATE_FORM: CapcutTemplateFormState = {
  templateName: "",
  bestUseCase: "",
  videoLength: "",
  hookFormat: "",
  subtitleFormat: "",
  editingStyle: "",
  bestPlatform: "",
  bestLanguageTest: "",
  notes: ""
};

function requiresValue(value: string): boolean {
  return value.trim().length > 0;
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function CapcutTemplateTracker(): JSX.Element {
  const initialLoad = useMemo(() => loadCapcutTemplates(), []);
  const [templates, setTemplates] = useState<CapcutTemplateEntry[]>(initialLoad.templates);
  const [form, setForm] = useState<CapcutTemplateFormState>(EMPTY_TEMPLATE_FORM);
  const [filters, setFilters] = useState<TemplateFilterState>(INITIAL_TEMPLATE_FILTERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage] = useState(initialLoad.warningMessage);

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return sortedTemplates.filter((template) => {
      const platformMatch = filters.platform === "all" || template.bestPlatform === filters.platform;
      const languageMatch =
        filters.language === "all" || template.bestLanguageTest === filters.language;
      return platformMatch && languageMatch;
    });
  }, [sortedTemplates, filters]);

  const platformOptions = useMemo(() => {
    const optionSet = new Set<string>(PLATFORMS);
    for (const template of templates) optionSet.add(template.bestPlatform);
    return [...optionSet];
  }, [templates]);

  const languageOptions = useMemo(() => {
    const optionSet = new Set<string>(LANGUAGES);
    for (const template of templates) optionSet.add(template.bestLanguageTest);
    return [...optionSet];
  }, [templates]);

  function persist(nextTemplates: CapcutTemplateEntry[]): void {
    setTemplates(nextTemplates);
    saveCapcutTemplates(nextTemplates);
  }

  function handleFieldChange<K extends keyof CapcutTemplateFormState>(
    field: K,
    value: CapcutTemplateFormState[K]
  ): void {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function resetFormState(): void {
    setForm(EMPTY_TEMPLATE_FORM);
    setEditingId(null);
  }

  function validateForm(): boolean {
    const requiredFields = [
      form.templateName,
      form.bestUseCase,
      form.videoLength,
      form.hookFormat,
      form.subtitleFormat,
      form.editingStyle,
      form.bestPlatform,
      form.bestLanguageTest
    ];

    if (!requiredFields.every(requiresValue)) {
      setErrorMessage("Please fill in all required template fields.");
      return false;
    }

    if (form.templateName.trim().length > 100) {
      setErrorMessage("Template name must be 100 characters or fewer.");
      return false;
    }

    if (form.notes.trim().length > 1000) {
      setErrorMessage("Notes must be 1000 characters or fewer.");
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setErrorMessage("");
    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (editingId) {
      const existingTemplate = templates.find((template) => template.id === editingId);
      if (!existingTemplate) {
        setErrorMessage("The selected template could not be found.");
        return;
      }

      const updatedTemplate: CapcutTemplateEntry = {
        ...existingTemplate,
        templateName: form.templateName.trim(),
        bestUseCase: form.bestUseCase.trim(),
        videoLength: form.videoLength.trim(),
        hookFormat: form.hookFormat.trim(),
        subtitleFormat: form.subtitleFormat.trim(),
        editingStyle: form.editingStyle.trim(),
        bestPlatform: form.bestPlatform.trim(),
        bestLanguageTest: form.bestLanguageTest.trim(),
        notes: form.notes.trim(),
        updatedAt: now
      };

      const nextTemplates = templates.map((template) =>
        template.id === editingId ? updatedTemplate : template
      );
      persist(nextTemplates);
      resetFormState();
      return;
    }

    const createdTemplate: CapcutTemplateEntry = {
      id: `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateName: form.templateName.trim(),
      bestUseCase: form.bestUseCase.trim(),
      videoLength: form.videoLength.trim(),
      hookFormat: form.hookFormat.trim(),
      subtitleFormat: form.subtitleFormat.trim(),
      editingStyle: form.editingStyle.trim(),
      bestPlatform: form.bestPlatform.trim(),
      bestLanguageTest: form.bestLanguageTest.trim(),
      notes: form.notes.trim(),
      createdAt: now,
      updatedAt: now
    };

    persist([createdTemplate, ...templates]);
    resetFormState();
  }

  function startEdit(template: CapcutTemplateEntry): void {
    setEditingId(template.id);
    setErrorMessage("");
    setForm({
      templateName: template.templateName,
      bestUseCase: template.bestUseCase,
      videoLength: template.videoLength,
      hookFormat: template.hookFormat,
      subtitleFormat: template.subtitleFormat,
      editingStyle: template.editingStyle,
      bestPlatform: template.bestPlatform,
      bestLanguageTest: template.bestLanguageTest,
      notes: template.notes
    });
  }

  function deleteTemplate(id: string): void {
    const shouldDelete = window.confirm("Delete this CapCut template?");
    if (!shouldDelete) return;
    persist(templates.filter((template) => template.id !== id));
    if (editingId === id) resetFormState();
  }

  function clearFilters(): void {
    setFilters(INITIAL_TEMPLATE_FILTERS);
  }

  const showInitialEmpty = templates.length === 0;
  const showFilteredEmpty = templates.length > 0 && filteredTemplates.length === 0;

  return (
    <section className="panel template-panel">
      <div className="panel-header">
        <h2>CapCut Template Tracker</h2>
        <span>{filteredTemplates.length} shown</span>
      </div>

      <form className="entry-form" onSubmit={handleSubmit}>
        <label>
          Template name *
          <input
            value={form.templateName}
            onChange={(event) => handleFieldChange("templateName", event.target.value)}
            placeholder="e.g. Quick Funny Clip Translation"
          />
        </label>

        <label>
          Video length *
          <input
            value={form.videoLength}
            onChange={(event) => handleFieldChange("videoLength", event.target.value)}
            placeholder="e.g. 12 to 30 seconds"
          />
        </label>

        <label className="full-width">
          Best use case *
          <textarea
            value={form.bestUseCase}
            onChange={(event) => handleFieldChange("bestUseCase", event.target.value)}
            rows={2}
            placeholder="Where this template works best"
          />
        </label>

        <label className="full-width">
          Hook format *
          <textarea
            value={form.hookFormat}
            onChange={(event) => handleFieldChange("hookFormat", event.target.value)}
            rows={2}
            placeholder="How hook text is structured"
          />
        </label>

        <label className="full-width">
          Subtitle format *
          <textarea
            value={form.subtitleFormat}
            onChange={(event) => handleFieldChange("subtitleFormat", event.target.value)}
            rows={2}
            placeholder="Subtitle style and placement"
          />
        </label>

        <label className="full-width">
          Editing style *
          <textarea
            value={form.editingStyle}
            onChange={(event) => handleFieldChange("editingStyle", event.target.value)}
            rows={2}
            placeholder="Editing notes and rhythm"
          />
        </label>

        <label>
          Best platform *
          <select
            value={form.bestPlatform}
            onChange={(event) => handleFieldChange("bestPlatform", event.target.value)}
          >
            <option value="">Select platform</option>
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label>
          Best language test *
          <select
            value={form.bestLanguageTest}
            onChange={(event) => handleFieldChange("bestLanguageTest", event.target.value)}
          >
            <option value="">Select language</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <label className="full-width">
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => handleFieldChange("notes", event.target.value)}
            rows={3}
            placeholder="Optional template notes"
          />
        </label>

        {errorMessage ? <p className="error">{errorMessage}</p> : null}

        <div className="form-actions full-width">
          <button type="submit" className="submit-button">
            {editingId ? "Save Template Changes" : "Save Template"}
          </button>
          {editingId ? (
            <button type="button" className="cancel-button" onClick={resetFormState}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      {warningMessage ? <p className="warning template-warning">{warningMessage}</p> : null}

      <div className="filters template-filters">
        <label>
          Best platform
          <select
            value={filters.platform}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, platform: event.target.value }))
            }
          >
            <option value="all">All platforms</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label>
          Best language test
          <select
            value={filters.language}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, language: event.target.value }))
            }
          >
            <option value="all">All languages</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="clear-button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {showInitialEmpty ? (
        <div className="empty-state">
          <h3>No CapCut templates yet</h3>
          <p>Add your first template to start building a repeatable edit factory.</p>
        </div>
      ) : null}

      {showFilteredEmpty ? (
        <div className="empty-state">
          <h3>No templates match these filters</h3>
          <p>Try changing platform or language filters.</p>
        </div>
      ) : null}

      {filteredTemplates.length > 0 ? (
        <>
          <div className="table-wrap desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Template name</th>
                  <th>Best use case</th>
                  <th>Video length</th>
                  <th>Hook format</th>
                  <th>Subtitle format</th>
                  <th>Editing style</th>
                  <th>Best platform</th>
                  <th>Best language</th>
                  <th>Notes</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.templateName}</td>
                    <td>{template.bestUseCase}</td>
                    <td>{template.videoLength}</td>
                    <td>{template.hookFormat}</td>
                    <td>{template.subtitleFormat}</td>
                    <td>{template.editingStyle}</td>
                    <td>{template.bestPlatform}</td>
                    <td>{template.bestLanguageTest}</td>
                    <td>{template.notes || "-"}</td>
                    <td>{formatUpdatedAt(template.updatedAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="row-button edit"
                          onClick={() => startEdit(template)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="row-button delete"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards">
            {filteredTemplates.map((template) => (
              <article key={`${template.id}-card`} className="entry-card">
                <h3>{template.templateName}</h3>
                <p>
                  <strong>Best use case:</strong> {template.bestUseCase}
                </p>
                <p>
                  <strong>Video length:</strong> {template.videoLength}
                </p>
                <p>
                  <strong>Best platform:</strong> {template.bestPlatform}
                </p>
                <p>
                  <strong>Best language:</strong> {template.bestLanguageTest}
                </p>
                <p>
                  <strong>Hook format:</strong> {template.hookFormat}
                </p>
                <p>
                  <strong>Subtitle format:</strong> {template.subtitleFormat}
                </p>
                <p>
                  <strong>Editing style:</strong> {template.editingStyle}
                </p>
                <p>
                  <strong>Notes:</strong> {template.notes || "-"}
                </p>
                <p>
                  <strong>Updated:</strong> {formatUpdatedAt(template.updatedAt)}
                </p>
                <div className="row-actions">
                  <button type="button" className="row-button edit" onClick={() => startEdit(template)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="row-button delete"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
