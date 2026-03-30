import { useState, useCallback, useMemo } from "react";
import type { DocumentAnalysis } from "@/types/arabicClaims";

export interface FieldDiffState {
  originalValue: string;
  userValue: string;
  llmValue: string | null;
  hasUserEdits: boolean;
  hasLlmSuggestion: boolean;
}

export interface AnalysisDiffState {
  claimant_name: FieldDiffState;
  summary: FieldDiffState;
  chronological_log: FieldDiffState;
  key_findings: FieldDiffState;
  medical_conditions: FieldDiffState;
  treatments_mentioned: FieldDiffState;
  medications: FieldDiffState;
  recommendations: FieldDiffState;
  risk_flags: FieldDiffState;
  inferred_case_type: FieldDiffState;
  case_type_reasoning: FieldDiffState;
}

type AnalysisFieldName = keyof AnalysisDiffState;

function fieldToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    // For chronological_log (array of objects)
    if (value.length > 0 && typeof value[0] === "object") {
      return value
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            const date = (item as Record<string, unknown>).date || (item as Record<string, unknown>).date_iso || "";
            const event = (item as Record<string, unknown>).event || String(item);
            return date ? `${date}: ${event}` : String(event);
          }
          return String(item);
        })
        .join("\n");
    }
    return value.join("\n");
  }
  return String(value);
}

function stringToField(fieldName: AnalysisFieldName, value: string): unknown {
  if (fieldName === "chronological_log") {
    // Try to parse as JSON first (new format)
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fall back to legacy string format
    }
    // Legacy format: "date: event" per line
    return value.split("\n").filter(Boolean).map((line) => {
      const match = line.match(/^(.+?):\s*(.+)$/);
      if (match) {
        return { date: match[1].trim(), event: match[2].trim(), date_iso: match[1].trim() };
      }
      return { date: "", event: line.trim(), date_iso: "" };
    });
  }
  if (
    fieldName === "key_findings" ||
    fieldName === "medical_conditions" ||
    fieldName === "treatments_mentioned" ||
    fieldName === "medications" ||
    fieldName === "recommendations" ||
    fieldName === "risk_flags"
  ) {
    return value.split("\n").filter(Boolean);
  }
  // For claimant_name, inferred_case_type, case_type_reasoning - return as string
  return value;
}

function createFieldState(original: unknown, user: unknown, llm: unknown | null): FieldDiffState {
  const originalStr = fieldToString(original);
  const userStr = fieldToString(user);
  const llmStr = llm !== null ? fieldToString(llm) : null;

  return {
    originalValue: originalStr,
    userValue: userStr,
    llmValue: llmStr,
    hasUserEdits: originalStr !== userStr,
    hasLlmSuggestion: llmStr !== null && llmStr !== userStr,
  };
}

export function useAnalysisDiff(initialAnalysis: DocumentAnalysis | null) {
  // Store the original analysis (from DB/LLM before any user edits)
  const [originalAnalysis, setOriginalAnalysis] = useState<DocumentAnalysis | null>(initialAnalysis);

  // Store user's current edited version
  const [userAnalysis, setUserAnalysis] = useState<DocumentAnalysis | null>(initialAnalysis);

  // Store LLM's suggested version (after regeneration, before user accepts)
  const [llmSuggestion, setLlmSuggestion] = useState<DocumentAnalysis | null>(null);

  // Track which fields have been edited by user
  const [editedFields, setEditedFields] = useState<Set<AnalysisFieldName>>(new Set());

  // Initialize when analysis loads
  const initializeAnalysis = useCallback((analysis: DocumentAnalysis | null) => {
    setOriginalAnalysis(analysis);
    setUserAnalysis(analysis);
    setLlmSuggestion(null);
    setEditedFields(new Set());
  }, []);

  // Update a field value (user edit)
  const updateField = useCallback(
    (fieldName: AnalysisFieldName, value: string) => {
      if (!userAnalysis) return;

      const convertedValue = stringToField(fieldName, value);
      setUserAnalysis((prev) => {
        if (!prev) return prev;
        return { ...prev, [fieldName]: convertedValue };
      });

      setEditedFields((prev) => new Set(prev).add(fieldName));
    },
    [userAnalysis]
  );

  // Set LLM suggestion after regeneration
  const setLlmSuggestedAnalysis = useCallback((suggestion: DocumentAnalysis | null) => {
    setLlmSuggestion(suggestion);
  }, []);

  // Accept LLM suggestion for a field
  const acceptLlmSuggestion = useCallback(
    (fieldName: AnalysisFieldName) => {
      if (!llmSuggestion) return;

      setUserAnalysis((prev) => {
        if (!prev) return prev;
        return { ...prev, [fieldName]: llmSuggestion[fieldName] };
      });

      setEditedFields((prev) => {
        const next = new Set(prev);
        next.delete(fieldName);
        return next;
      });
    },
    [llmSuggestion]
  );

  // Reject LLM suggestion for a field (keep user value)
  const rejectLlmSuggestion = useCallback(
    (fieldName: AnalysisFieldName) => {
      // Mark as rejected - just clear the LLM suggestion flag for this field
      // User's current value is preserved
      setLlmSuggestion((prev) => {
        if (!prev) return prev;
        // Keep the LLM suggestion but mark it as "rejected" by not having it affect the diff
        // Actually, we should remove just this field from the suggestion
        const next = { ...prev };
        if (userAnalysis) {
          (next as Record<string, unknown>)[fieldName] = userAnalysis[fieldName];
        }
        return next;
      });
    },
    [userAnalysis]
  );

  // Accept all LLM suggestions
  const acceptAllSuggestions = useCallback(() => {
    if (!llmSuggestion) return;
    setUserAnalysis(llmSuggestion);
    setEditedFields(new Set());
  }, [llmSuggestion]);

  // Reject all LLM suggestions (keep all user values)
  const rejectAllSuggestions = useCallback(() => {
    setLlmSuggestion(null);
  }, []);

  // Save user edits (clears original, makes current user state the new original)
  const saveEdits = useCallback(() => {
    setOriginalAnalysis(userAnalysis);
    setLlmSuggestion(null);
    setEditedFields(new Set());
  }, [userAnalysis]);

  // Compute diff state for all fields
  const diffState: AnalysisDiffState = useMemo(() => {
    const fields: AnalysisFieldName[] = [
      "claimant_name",
      "summary",
      "chronological_log",
      "key_findings",
      "medical_conditions",
      "treatments_mentioned",
      "medications",
      "recommendations",
      "risk_flags",
      "inferred_case_type",
      "case_type_reasoning",
    ];

    const state = {} as AnalysisDiffState;

    for (const field of fields) {
      state[field] = createFieldState(
        originalAnalysis?.[field],
        userAnalysis?.[field],
        llmSuggestion?.[field] ?? null
      );
    }

    return state;
  }, [originalAnalysis, userAnalysis, llmSuggestion]);

  // Count of changes
  const stats = useMemo(() => {
    const userEditCount = editedFields.size;
    const llmSuggestionCount = llmSuggestion
      ? Object.keys(diffState).filter(
          (k) => diffState[k as AnalysisFieldName].hasLlmSuggestion
        ).length
      : 0;

    return {
      userEditCount,
      llmSuggestionCount,
      totalChanges: userEditCount + llmSuggestionCount,
    };
  }, [editedFields, llmSuggestion, diffState]);

  return {
    userAnalysis,
    llmSuggestion,
    diffState,
    editedFields,
    stats,
    initializeAnalysis,
    updateField,
    setLlmSuggestedAnalysis,
    acceptLlmSuggestion,
    rejectLlmSuggestion,
    acceptAllSuggestions,
    rejectAllSuggestions,
    saveEdits,
  };
}