import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, X, Check } from "lucide-react";
import { ICD10Search } from "./ICD10Search";
import type { IcdCode } from "@/types/arabicClaims";
import type { ICD10SearchResult } from "@/lib/arabicClaimsApi";

interface ICD10EditorProps {
  codes: IcdCode[];
  onChange?: (codes: IcdCode[]) => void;
  isEditable?: boolean;
  hasUserEdits?: boolean;
  hasLlmSuggestion?: boolean;
}

export function ICD10Editor({
  codes,
  onChange,
  isEditable = true,
  hasUserEdits = false,
  hasLlmSuggestion = false,
}: ICD10EditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCode, setEditCode] = useState<IcdCode>({ code: "", description: "", confidence: 0.9 });

  const handleAddCode = (result: ICD10SearchResult) => {
    // Check if code already exists
    if (codes.some((c) => c.code.toUpperCase() === result.code.toUpperCase())) {
      return; // Don't add duplicates
    }

    const newCode: IcdCode = {
      code: result.code,
      description: result.description,
      confidence: 1.0, // User-added codes have high confidence
    };

    onChange?.([...codes, newCode]);
  };

  const handleRemoveCode = (index: number) => {
    const newCodes = codes.filter((_, i) => i !== index);
    onChange?.(newCodes);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditCode({ ...codes[index] });
  };

  const handleEditSave = () => {
    if (editingIndex !== null && editCode.code.trim()) {
      const newCodes = [...codes];
      newCodes[editingIndex] = editCode;
      onChange?.(newCodes);
    }
    setEditingIndex(null);
    setEditCode({ code: "", description: "", confidence: 0.9 });
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditCode({ code: "", description: "", confidence: 0.9 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleEditSave();
    if (e.key === "Escape") handleEditCancel();
  };

  if (codes.length === 0 && !isEditable) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          ICD Codes
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
          {codes.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No ICD codes assigned</p>
          ) : (
            codes.map((icd, i) => {
              if (editingIndex === i) {
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <Input
                      value={editCode.code}
                      onChange={(e) => setEditCode({ ...editCode, code: e.target.value.toUpperCase() })}
                      placeholder="Code"
                      className="w-28 font-mono"
                      autoFocus
                      onKeyDown={handleKeyDown}
                    />
                    <Input
                      value={editCode.description || ""}
                      onChange={(e) => setEditCode({ ...editCode, description: e.target.value })}
                      placeholder="Description"
                      className="flex-1"
                      onKeyDown={handleKeyDown}
                    />
                    <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleEditSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }

              return (
                <div key={i} className="group flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="font-mono cursor-text"
                    onClick={() => isEditable && onChange && handleEditStart(i)}
                  >
                    {icd.code}
                  </Badge>
                  <span
                    className="text-slate-700 flex-1 cursor-text hover:bg-slate-50 px-1 rounded"
                    onClick={() => isEditable && onChange && handleEditStart(i)}
                  >
                    {icd.description}
                  </span>
                  {icd.confidence !== undefined && (
                    <span className="text-xs text-slate-400">
                      ({(icd.confidence * 100).toFixed(0)}%)
                    </span>
                  )}
                  {isEditable && onChange && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveCode(i)}
                      title="Remove code"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })
          )}

          {/* Search to add new codes */}
          {isEditable && onChange && (
            <div className="pt-2 border-t mt-2">
              <ICD10Search
                onSelect={handleAddCode}
                placeholder="Search ICD-10 codes to add..."
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}