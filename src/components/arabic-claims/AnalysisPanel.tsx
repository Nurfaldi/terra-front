import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Clock3,
  Stethoscope,
  Pill,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Activity,
  Check,
  X,
  Trash2,
  CheckCircle,
  User,
  DollarSign,
} from "lucide-react";
import { diffWords } from "diff";
import { ICD10Editor } from "./ICD10Editor";
import type { DocumentAnalysis, ChronologicalLogEntry, IcdCode } from "@/types/arabicClaims";
import type { AnalysisDiffState } from "@/hooks/useAnalysisDiff";

type AnalysisFieldName = keyof AnalysisDiffState;

interface AnalysisPanelProps {
  analysis: DocumentAnalysis | null;
  diffState?: AnalysisDiffState;
  onFieldChange?: (fieldName: AnalysisFieldName, value: string) => void;
  onAcceptSuggestion?: (fieldName: AnalysisFieldName) => void;
  onRejectSuggestion?: (fieldName: AnalysisFieldName) => void;
  onRemoveWarning?: (index: number) => void;
  onValidateWarning?: (index: number) => void;
}

// Word-level diff renderer
function renderWordDiff(original: string, edited: string, isUserEdit: boolean) {
  if (!isUserEdit) {
    return <span>{edited}</span>;
  }

  const changes = diffWords(original, edited);

  return (
    <>
      {changes.map((change, idx) => {
        if (change.added) {
          return (
            <span key={idx} className="bg-blue-100 text-blue-900 border-b-2 border-blue-500 px-0.5">
              {change.value}
            </span>
          );
        }
        if (change.removed) {
          // Don't show removed text for user edits - they replaced it
          return null;
        }
        return <span key={idx}>{change.value}</span>;
      })}
    </>
  );
}

export function AnalysisPanel({
  analysis,
  diffState,
  onFieldChange,
  onAcceptSuggestion,
  onRejectSuggestion,
  onRemoveWarning,
  onValidateWarning,
}: AnalysisPanelProps) {
  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No analysis available yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper to get field state
  const getFieldState = (fieldName: AnalysisFieldName) => {
    return diffState?.[fieldName];
  };

  // Editable text field component
  const EditableTextField = ({
    fieldName,
    label,
    icon,
    value,
    placeholder = "",
    multiline = true,
  }: {
    fieldName: AnalysisFieldName;
    label: string;
    icon: React.ReactNode;
    value: string;
    placeholder?: string;
    multiline?: boolean;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const field = getFieldState(fieldName);

    const handleSave = () => {
      if (editValue.trim() !== value.trim()) {
        onFieldChange?.(fieldName, editValue.trim());
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    // Compute word-level diff for display
    const hasUserEdits = field?.hasUserEdits || false;
    const hasLlmSuggestion = field?.hasLlmSuggestion || false;

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {label}
            {hasUserEdits && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Edited
              </Badge>
            )}
            {hasLlmSuggestion && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Suggestion
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-2">
              {multiline ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[100px]"
                  placeholder={placeholder}
                  autoFocus
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                />
              )}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="text-sm text-slate-700 leading-relaxed cursor-text hover:bg-slate-50 p-2 rounded -mx-2 min-h-[40px]"
                onClick={() => onFieldChange && setIsEditing(true)}
              >
                {value ? (
                  hasUserEdits && field ? (
                    renderWordDiff(field.originalValue, value, true)
                  ) : (
                    value
                  )
                ) : (
                  <span className="text-slate-400 italic">{placeholder || `Click to add ${label.toLowerCase()}`}</span>
                )}
              </div>

              {/* Accept/Reject for AI suggestions */}
              {hasLlmSuggestion && field?.llmValue && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground flex-1">
                    AI suggests changes
                  </span>
                  {onAcceptSuggestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-50"
                      onClick={() => onAcceptSuggestion(fieldName)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Accept
                    </Button>
                  )}
                  {onRejectSuggestion && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700 border-red-300 hover:bg-red-50"
                      onClick={() => onRejectSuggestion(fieldName)}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Editable list component
  const EditableListField = ({
    fieldName,
    label,
    icon,
    items,
  }: {
    fieldName: AnalysisFieldName;
    label: string;
    icon: React.ReactNode;
    items: string[];
  }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newValue, setNewValue] = useState("");
    const field = getFieldState(fieldName);

    const handleEditStart = (index: number) => {
      setEditingIndex(index);
      setEditValue(items[index] || "");
    };

    const handleEditSave = () => {
      if (editingIndex !== null && editValue.trim()) {
        const newItems = [...items];
        newItems[editingIndex] = editValue.trim();
        onFieldChange?.(fieldName, newItems.join("\n"));
      }
      setEditingIndex(null);
      setEditValue("");
    };

    const handleCancel = () => {
      setEditingIndex(null);
      setEditValue("");
    };

    const handleRemove = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      onFieldChange?.(fieldName, newItems.join("\n"));
    };

    const handleAddSave = () => {
      if (newValue.trim()) {
        onFieldChange?.(fieldName, [...items, newValue.trim()].join("\n"));
        setNewValue("");
        setIsAddingNew(false);
      }
    };

    const handleAddCancel = () => {
      setNewValue("");
      setIsAddingNew(false);
    };

    const hasUserEdits = field?.hasUserEdits || false;
    const hasLlmSuggestion = field?.hasLlmSuggestion || false;
    const originalItems = field?.originalValue?.split("\n").filter(Boolean) || [];

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {label}
            {hasUserEdits && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Edited
              </Badge>
            )}
            {hasLlmSuggestion && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Suggestion
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, i) => {
              const isUserAdded = hasUserEdits && !originalItems.includes(item);

              if (editingIndex === i) {
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave();
                        if (e.key === "Escape") handleCancel();
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleEditSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }

              return (
                <div key={i} className="group flex items-center gap-2">
                  <span
                    className={`flex-1 text-sm px-2 py-1 rounded cursor-text hover:bg-slate-100 ${
                      isUserAdded ? "bg-blue-100 text-blue-900 border-l-4 border-blue-500" : "bg-slate-50"
                    }`}
                    onClick={() => onFieldChange && handleEditStart(i)}
                  >
                    {item}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemove(i)}
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}

            {/* Add new item inline form */}
            {isAddingNew && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Enter new ${label.toLowerCase().replace(/s$/, "")}...`}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSave();
                    if (e.key === "Escape") handleAddCancel();
                  }}
                />
                <Button size="sm" variant="ghost" onClick={handleAddCancel}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleAddSave}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* AI suggested additions */}
            {hasLlmSuggestion && field?.llmValue && (
              <>
                {field.llmValue
                  .split("\n")
                  .filter(Boolean)
                  .filter((item) => !items.includes(item))
                  .map((item, i) => (
                    <div key={`llm-${i}`} className="flex items-center gap-2">
                      <span className="flex-1 text-sm px-2 py-1 rounded bg-green-50 text-green-800 border-l-4 border-green-500">
                        {item}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onFieldChange?.(fieldName, [...items, item].join("\n"))}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          // Reject this specific addition - just don't add it
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </>
            )}

            {onFieldChange && !isAddingNew && (
              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" onClick={() => setIsAddingNew(true)}>
                + Add item
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Editable chronological log component
  const EditableChronologicalLog = () => {
    const entries = analysis.chronological_log || [];
    const field = getFieldState("chronological_log");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editEntry, setEditEntry] = useState<ChronologicalLogEntry>({ date: "", event: "" });
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newEntry, setNewEntry] = useState<ChronologicalLogEntry>({ date: "", event: "" });

    // Parse original entries for comparison
    // originalValue is stored in string format: "date: event\ndate: event"
    let originalEntries: ChronologicalLogEntry[] = [];
    if (field?.originalValue) {
      // Try JSON format first (new format)
      try {
        const parsed = JSON.parse(field.originalValue);
        if (Array.isArray(parsed)) {
          originalEntries = parsed;
        }
      } catch {
        // Fall back to legacy string format: "date: event" per line
        originalEntries = field.originalValue.split("\n").filter(Boolean).map((line) => {
          const match = line.match(/^(.+?):\s*(.+)$/);
          if (match) {
            return { date: match[1].trim(), event: match[2].trim(), date_iso: "", source_page: undefined };
          }
          return { date: "", event: line.trim(), date_iso: "", source_page: undefined };
        });
      }
    }

    const handleEditStart = (index: number) => {
      setEditingIndex(index);
      setEditEntry({ ...entries[index] });
    };

    const handleEditSave = () => {
      if (editingIndex !== null) {
        const newEntries = [...entries];
        // Preserve date_iso and source_page from original entry
        const originalEntry = entries[editingIndex];
        newEntries[editingIndex] = {
          date: editEntry.date,
          event: editEntry.event || "",
          date_iso: editEntry.date, // Use edited date as date_iso
          source_page: originalEntry.source_page, // Preserve source_page
        };
        // Store as JSON to preserve all fields
        onFieldChange?.("chronological_log", JSON.stringify(newEntries));
      }
      setEditingIndex(null);
    };

    const handleCancel = () => {
      setEditingIndex(null);
      setEditEntry({ date: "", event: "" });
    };

    const handleRemove = (index: number) => {
      const newEntries = entries.filter((_, i) => i !== index);
      onFieldChange?.("chronological_log", JSON.stringify(newEntries));
    };

    const handleAddSave = () => {
      if (newEntry.date?.trim() && newEntry.event?.trim()) {
        const newEntries = [...entries, {
          date: newEntry.date.trim(),
          event: newEntry.event.trim(),
          date_iso: newEntry.date.trim(),
          source_page: undefined,
        }];
        onFieldChange?.("chronological_log", JSON.stringify(newEntries));
        setNewEntry({ date: "", event: "" });
        setIsAddingNew(false);
      }
    };

    const handleAddCancel = () => {
      setNewEntry({ date: "", event: "" });
      setIsAddingNew(false);
    };

    const hasUserEdits = field?.hasUserEdits || false;
    const hasLlmSuggestion = field?.hasLlmSuggestion || false;

    // Check if a specific entry was edited
    const isEntryEdited = (index: number) => {
      if (!hasUserEdits) return false;
      const current = entries[index];
      const original = originalEntries[index];
      if (!original) return true; // New entry added
      return current.date !== original.date || current.event !== original.event;
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Chronological Log
            {hasUserEdits && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Edited
              </Badge>
            )}
            {hasLlmSuggestion && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Suggestion
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 && !isAddingNew ? (
            <p className="text-sm text-slate-500">No chronological events extracted.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => {
                if (editingIndex === i) {
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                      <Input
                        value={editEntry.date || ""}
                        onChange={(e) => setEditEntry({ ...editEntry, date: e.target.value })}
                        placeholder="Date (YYYY-MM-DD)"
                        className="w-36"
                        autoFocus
                      />
                      <Input
                        value={editEntry.event || ""}
                        onChange={(e) => setEditEntry({ ...editEntry, event: e.target.value })}
                        placeholder="Event"
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") handleCancel();
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleEditSave}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                }

                const eventText = entry.event || "";
                const dateStr = entry.date || entry.date_iso || "";
                const pageStr = entry.source_page ? ` (p.${entry.source_page})` : "";
                const edited = isEntryEdited(i);

                return (
                  <div key={i} className="group flex items-start gap-2">
                    <div
                      className={`flex-1 text-sm p-2 rounded cursor-text hover:bg-slate-50 ${
                        edited ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                      onClick={() => onFieldChange && handleEditStart(i)}
                    >
                      {dateStr && <span className={`font-medium ${edited ? "text-blue-900" : ""}`}>{dateStr}: </span>}
                      <span className={edited ? "text-blue-900" : ""}>{eventText}</span>
                      {pageStr && <span className="text-slate-400">{pageStr}</span>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                      onClick={() => handleRemove(i)}
                      title="Remove event"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}

              {/* Add new entry inline form */}
              {isAddingNew && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                  <Input
                    value={newEntry.date || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    placeholder="Date (YYYY-MM-DD)"
                    className="w-36"
                    autoFocus
                  />
                  <Input
                    value={newEntry.event || ""}
                    onChange={(e) => setNewEntry({ ...newEntry, event: e.target.value })}
                    placeholder="Event description"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddSave();
                      if (e.key === "Escape") handleAddCancel();
                    }}
                  />
                  <Button size="sm" variant="ghost" onClick={handleAddCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleAddSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {onFieldChange && !isAddingNew && (
                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" onClick={() => setIsAddingNew(true)}>
                  + Add event
                </Button>
              )}
            </div>
          )}

          {hasLlmSuggestion && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground flex-1">
                AI has updates
              </span>
              {onAcceptSuggestion && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => onAcceptSuggestion("chronological_log")}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Accept
                </Button>
              )}
              {onRejectSuggestion && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                  onClick={() => onRejectSuggestion("chronological_log")}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Handle ICD codes change
  const handleIcdCodesChange = (newCodes: IcdCode[]) => {
    onFieldChange?.("icd_codes" as AnalysisFieldName, JSON.stringify(newCodes));
  };

  // Get ICD codes field state for badges
  const icdFieldState = getFieldState("icd_codes" as AnalysisFieldName);

  return (
    <div className="space-y-4">
      {/* Claimant Name */}
      <EditableTextField
        fieldName="claimant_name"
        label="Claimant Name"
        icon={<User className="h-4 w-4" />}
        value={analysis.claimant_name || ""}
        placeholder="Click to add claimant name"
        multiline={false}
      />

      {/* Document Summary */}
      <EditableTextField
        fieldName="summary"
        label="Document Summary"
        icon={<FileText className="h-4 w-4" />}
        value={analysis.summary || ""}
        placeholder="Click to add summary"
      />

      {/* Chronological Log */}
      <EditableChronologicalLog />

      {/* Overall Readability - not editable, display only */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 mb-2">Overall Readability</p>
            <div className="text-3xl font-bold text-blue-600">
              {analysis.overall_readability.toFixed(1)}
              <span className="text-sm text-slate-400">/10</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inferred Case Type - now editable */}
      <EditableTextField
        fieldName="inferred_case_type"
        label="Inferred Case Type"
        icon={<FileText className="h-4 w-4" />}
        value={analysis.inferred_case_type || "UNKNOWN"}
        placeholder="IP, OP, or UNKNOWN"
        multiline={false}
      />

      {/* Case Type Reasoning */}
      {analysis.case_type_reasoning && (
        <EditableTextField
          fieldName="case_type_reasoning"
          label="Case Type Reasoning"
          icon={<FileText className="h-4 w-4" />}
          value={analysis.case_type_reasoning}
          placeholder="Reasoning for case type inference"
        />
      )}

      {/* ICD Codes */}
      <ICD10Editor
        codes={analysis.icd_codes || []}
        onChange={onFieldChange ? handleIcdCodesChange : undefined}
        isEditable={!!onFieldChange}
        hasUserEdits={icdFieldState?.hasUserEdits || false}
        hasLlmSuggestion={icdFieldState?.hasLlmSuggestion || false}
      />

      {/* Financial Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            {analysis.total_claimed_amount != null ? (
              <>
                <span className="text-2xl font-bold text-green-600">
                  {analysis.total_claimed_amount.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500">
                  {analysis.currency || "USD"}
                </span>
              </>
            ) : (
              <span className="text-sm text-slate-400">No financial information available</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <EditableListField
        fieldName="key_findings"
        label="Key Findings"
        icon={<ClipboardList className="h-4 w-4" />}
        items={analysis.key_findings || []}
      />

      {/* Medical Conditions */}
      <EditableListField
        fieldName="medical_conditions"
        label="Medical Conditions"
        icon={<Stethoscope className="h-4 w-4" />}
        items={analysis.medical_conditions || []}
      />

      {/* Treatments */}
      <EditableListField
        fieldName="treatments_mentioned"
        label="Treatments"
        icon={<Activity className="h-4 w-4" />}
        items={analysis.treatments_mentioned || []}
      />

      {/* Medications */}
      <EditableListField
        fieldName="medications"
        label="Medications"
        icon={<Pill className="h-4 w-4" />}
        items={analysis.medications || []}
      />

      {/* Recommendations */}
      <EditableListField
        fieldName="recommendations"
        label="Recommendations"
        icon={<CheckCircle2 className="h-4 w-4" />}
        items={analysis.recommendations || []}
      />

      {/* Risk Flags */}
      {(analysis.risk_flags?.length || 0) > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Risk Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.risk_flags?.map((flag, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <p className="text-sm text-red-700 flex-1">{flag}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {onValidateWarning && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-green-700 hover:bg-green-100"
                        onClick={() => onValidateWarning(i)}
                        title="Mark as valid/acknowledged"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Valid
                      </Button>
                    )}
                    {onRemoveWarning && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-700 hover:bg-red-100"
                        onClick={() => onRemoveWarning(i)}
                        title="Dismiss this warning"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      {diffState && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground p-3 bg-slate-50 rounded-lg">
          <span className="font-medium">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-blue-100 border-b-2 border-blue-500 rounded-sm" />
            Your edit (preserved)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-green-100 border-b-2 border-green-500 rounded-sm" />
            AI suggests
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-50 line-through" />
            AI removes
          </span>
        </div>
      )}
    </div>
  );
}