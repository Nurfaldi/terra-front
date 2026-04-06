import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, X, Eye, Pencil, Share2, Loader2, Link, Copy, Check } from "lucide-react";
import {
  shareJob,
  listShares,
  revokeShare,
  updateSharePermission,
  getLinkSharing,
  updateLinkSharing,
  searchUsers,
} from "@/lib/arabicClaimsApi";
import type { ShareResponse } from "@/types/arabicClaims";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  currentUserId: string;
  /** The current user's permission on this job */
  userPermission: "owner" | "edit" | "view";
}

export function ShareDialog({
  open,
  onOpenChange,
  jobId,
  currentUserId,
  userPermission,
}: ShareDialogProps) {
  const [targetUser, setTargetUser] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");
  const [shares, setShares] = useState<ShareResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Link sharing state
  const [linkSharing, setLinkSharing] = useState<"off" | "view" | "edit">("off");
  const [linkCopied, setLinkCopied] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // What this user can grant
  const canGrantEdit = userPermission === "owner" || userPermission === "edit";
  const isOwner = userPermission === "owner";

  // Debounced user search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const handleUserSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchUsers(query);
        // Filter out current user and already-shared users
        const sharedIds = new Set(shares.map((s) => s.shared_with_user_id));
        const filtered = results.filter(
          (u) => u !== currentUserId && !sharedIds.has(u)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);
  }, [currentUserId, shares]);

  useEffect(() => {
    if (open) {
      loadShares();
      loadLinkSharing();
      setError(null);
      setTargetUser("");
      setLinkCopied(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [open, jobId]);

  async function loadShares() {
    setLoading(true);
    try {
      const data = await listShares(jobId, currentUserId);
      setShares(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadLinkSharing() {
    try {
      const data = await getLinkSharing(jobId, currentUserId);
      setLinkSharing(data.link_sharing);
    } catch {
      // ignore
    }
  }

  async function handleShare() {
    if (!targetUser.trim()) return;
    setSharing(true);
    setError(null);
    try {
      await shareJob(jobId, targetUser.trim(), permission, currentUserId);
      setTargetUser("");
      await loadShares();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to share";
      setError(msg);
    } finally {
      setSharing(false);
    }
  }

  async function handleRevoke(shareId: string) {
    try {
      await revokeShare(jobId, shareId, currentUserId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to revoke share";
      setError(msg);
    }
  }

  async function handleTogglePermission(share: ShareResponse) {
    const newPerm = share.permission === "view" ? "edit" : "view";
    // View users can't upgrade to edit
    if (newPerm === "edit" && !canGrantEdit) return;
    try {
      await updateSharePermission(jobId, share.id, newPerm, currentUserId);
      setShares((prev) =>
        prev.map((s) =>
          s.id === share.id ? { ...s, permission: newPerm } : s
        )
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update permission";
      setError(msg);
    }
  }

  async function handleLinkSharingChange(value: "off" | "view" | "edit") {
    try {
      await updateLinkSharing(jobId, value, currentUserId);
      setLinkSharing(value);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update link sharing";
      setError(msg);
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/arabic-claims/${encodeURIComponent(jobId)}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Claim
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy link button — always visible */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopyLink}
          >
            {linkCopied ? (
              <><Check className="h-4 w-4 text-green-600" />Link copied</>
            ) : (
              <><Copy className="h-4 w-4" />Copy link</>
            )}
          </Button>

          {/* Link Sharing toggle — owner only */}
          {isOwner && (
            <div className="space-y-2 p-3 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-slate-500" />
                Anyone with the link
              </div>
              <div className="flex rounded-md border overflow-hidden">
                <button
                  className={`flex-1 px-3 py-1.5 text-xs transition-colors ${
                    linkSharing === "off"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleLinkSharingChange("off")}
                >
                  No access
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs transition-colors ${
                    linkSharing === "view"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleLinkSharingChange("view")}
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs transition-colors ${
                    linkSharing === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleLinkSharingChange("edit")}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              {linkSharing !== "off" && (
                <p className="text-xs text-muted-foreground">
                  Any logged-in user with this link can {linkSharing === "edit" ? "view and edit" : "view"} this claim.
                </p>
              )}
            </div>
          )}

          {/* Show link sharing status for non-owners */}
          {!isOwner && linkSharing !== "off" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border text-sm text-muted-foreground">
              <Link className="h-4 w-4" />
              Anyone with the link can {linkSharing === "edit" ? "edit" : "view"}
            </div>
          )}

          {/* Share with specific users */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Enter username to share with..."
                value={targetUser}
                onChange={(e) => {
                  setTargetUser(e.target.value);
                  handleUserSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && showSuggestions) {
                    e.preventDefault();
                    setActiveSuggestion((prev) =>
                      prev < suggestions.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === "ArrowUp" && showSuggestions) {
                    e.preventDefault();
                    setActiveSuggestion((prev) =>
                      prev > 0 ? prev - 1 : suggestions.length - 1
                    );
                  } else if (e.key === "Enter") {
                    if (showSuggestions && activeSuggestion >= 0) {
                      e.preventDefault();
                      setTargetUser(suggestions[activeSuggestion]);
                      setShowSuggestions(false);
                    } else {
                      handleShare();
                    }
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
              />
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto"
                >
                  {suggestions.map((user, idx) => (
                    <button
                      key={user}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        idx === activeSuggestion
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-slate-50"
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setTargetUser(user);
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                      }}
                    >
                      <Users className="h-3.5 w-3.5 inline mr-2 text-slate-400" />
                      {user}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Permission picker */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Access:</span>
              <div className="flex rounded-md border overflow-hidden">
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                    permission === "view"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setPermission("view")}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                    permission === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  } ${!canGrantEdit ? "opacity-40 cursor-not-allowed" : ""}`}
                  onClick={() => canGrantEdit && setPermission("edit")}
                  disabled={!canGrantEdit}
                  title={
                    !canGrantEdit
                      ? "You have view access — can only share with view permission"
                      : undefined
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
              <Button
                size="sm"
                onClick={handleShare}
                disabled={!targetUser.trim() || sharing}
              >
                {sharing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Share"
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Current shares */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Shared with ({shares.length})
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Not shared with anyone yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {share.shared_with_user_id}
                      </span>
                      <Badge
                        variant={
                          share.permission === "edit" ? "default" : "secondary"
                        }
                        className="text-xs cursor-pointer select-none"
                        onClick={() => handleTogglePermission(share)}
                        title={
                          canGrantEdit
                            ? "Click to toggle permission"
                            : undefined
                        }
                      >
                        {share.permission === "edit" ? (
                          <><Pencil className="h-3 w-3 mr-1" />Edit</>
                        ) : (
                          <><Eye className="h-3 w-3 mr-1" />View</>
                        )}
                      </Badge>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRevoke(share.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Revoke access"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
