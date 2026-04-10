import { COMPANY_INSURER_MAPPING } from "@/types/chat";

interface PolicyModeSelectorProps {
  company: string;
  insurer: string;
  onCompanyChange: (company: string) => void;
  onInsurerChange: (insurer: string) => void;
}

export function PolicyModeSelector({
  company,
  insurer,
  onCompanyChange,
  onInsurerChange,
}: PolicyModeSelectorProps) {
  const companies = Object.keys(COMPANY_INSURER_MAPPING);
  const insurers = company ? COMPANY_INSURER_MAPPING[company] || [] : [];

  return (
    <div className="border-b bg-white px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
          Company
        </label>
        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[180px]"
          value={company}
          onChange={(e) => {
            onCompanyChange(e.target.value);
            onInsurerChange("");
          }}
        >
          <option value="">Select company...</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
          Insurer
        </label>
        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm min-w-[200px]"
          value={insurer}
          onChange={(e) => onInsurerChange(e.target.value)}
          disabled={!company}
        >
          <option value="">Select insurer...</option>
          {insurers.map((ins) => (
            <option key={ins} value={ins}>
              {ins}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
