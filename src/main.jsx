import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BadgeCheck,
  Banknote,
  BookOpen,
  FileCheck2,
  Landmark,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import "./styles.css";

const SOURCES = [
  { id: "gst", label: "GST", icon: ReceiptText, weight: 1.1 },
  { id: "upi", label: "UPI", icon: WalletCards, weight: 1 },
  { id: "epfo", label: "EPFO", icon: Users, weight: 0.8 },
  { id: "aa", label: "Account Aggregator", icon: Landmark, weight: 1.2 },
  { id: "receivables", label: "Receivables / TReDS", icon: FileCheck2, weight: 0.9 },
];

const PERSONAS = {
  kirana: {
    name: "Kirana Store",
    owner: "S. Ramesh",
    location: "Tier-3 grocery retailer",
    status: "Existing-to-bank",
    requested: 1200000,
    cibil: "NH",
    note: "Stable UPI receipts with thin bureau history.",
    base: {
      cashFlow: 78,
      revenue: 74,
      compliance: 82,
      repayment: 70,
      receivables: 58,
      risk: 76,
    },
    sourceBoosts: {
      gst: { revenue: 7, compliance: 5 },
      upi: { cashFlow: 9, repayment: 4 },
      epfo: { compliance: 2 },
      aa: { cashFlow: 7, repayment: 7, risk: 3 },
      receivables: { receivables: 8 },
    },
    inputs: {
      monthlyRevenue: 675000,
      monthlyUpi: 530000,
      gstDelayDays: 1,
      employees: 3,
      pendingReceivables: 150000,
      buyerQuality: 62,
      existingEmi: 22500,
    },
  },
  garment: {
    name: "Garment Manufacturer",
    owner: "A. Fatima",
    location: "Small export supplier",
    status: "New-to-bank",
    requested: 1800000,
    cibil: "722",
    note: "Receivables explain lumpy bank inflows.",
    base: {
      cashFlow: 61,
      revenue: 81,
      compliance: 86,
      repayment: 66,
      receivables: 84,
      risk: 68,
    },
    sourceBoosts: {
      gst: { revenue: 8, compliance: 4 },
      upi: { cashFlow: 3 },
      epfo: { compliance: 6, risk: 2 },
      aa: { cashFlow: 5, repayment: 5 },
      receivables: { receivables: 11, cashFlow: 5, risk: 4 },
    },
    inputs: {
      monthlyRevenue: 1175000,
      monthlyUpi: 210000,
      gstDelayDays: 0,
      employees: 18,
      pendingReceivables: 950000,
      buyerQuality: 88,
      existingEmi: 55000,
    },
  },
  firstTime: {
    name: "First-time Borrower",
    owner: "N. Kavya",
    location: "Home foods unit",
    status: "New-to-credit",
    requested: 650000,
    cibil: "NH",
    note: "No credit history treated as neutral, not negative.",
    base: {
      cashFlow: 64,
      revenue: 59,
      compliance: 63,
      repayment: 62,
      receivables: 46,
      risk: 70,
    },
    sourceBoosts: {
      gst: { revenue: 5, compliance: 4 },
      upi: { cashFlow: 10, repayment: 6 },
      epfo: { compliance: 1 },
      aa: { cashFlow: 6, repayment: 6, risk: 2 },
      receivables: { receivables: 5 },
    },
    inputs: {
      monthlyRevenue: 325000,
      monthlyUpi: 290000,
      gstDelayDays: 2,
      employees: 2,
      pendingReceivables: 75000,
      buyerQuality: 58,
      existingEmi: 0,
    },
  },
};

const DIMENSIONS = [
  ["cashFlow", "Cash-flow stability"],
  ["revenue", "Revenue authenticity"],
  ["compliance", "Compliance reliability"],
  ["repayment", "Repayment capacity"],
  ["receivables", "Receivables strength"],
  ["risk", "Risk controls"],
];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function formatINR(value) {
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function scoreApplicant(persona, enabled, overrides) {
  const scores = { ...persona.base };
  const activeCount = SOURCES.filter((source) => enabled[source.id]).length;

  SOURCES.forEach((source) => {
    if (!enabled[source.id]) return;
    const boosts = persona.sourceBoosts[source.id] || {};
    Object.entries(boosts).forEach(([key, value]) => {
      scores[key] = (scores[key] || 0) + value;
    });
  });

  scores.revenue += (overrides.monthlyRevenue - persona.inputs.monthlyRevenue) / 90000;
  scores.cashFlow += (overrides.monthlyUpi - persona.inputs.monthlyUpi) / 70000;
  scores.compliance -= overrides.gstDelayDays * 1.5;
  scores.compliance += Math.min(6, overrides.employees / 6);
  scores.receivables += (overrides.pendingReceivables - persona.inputs.pendingReceivables) / 85000;
  scores.receivables += (overrides.buyerQuality - 60) / 8;
  scores.repayment -= overrides.existingEmi / 16000;
  scores.risk -= overrides.existingEmi / 22000;

  const inferredSurplus = overrides.monthlyRevenue * 0.18 - overrides.existingEmi;
  const debtBurden = overrides.existingEmi / Math.max(1, overrides.monthlyRevenue);
  const lowSourceCoverage = activeCount <= 2;

  if (debtBurden > 0.32) {
    scores.repayment -= 18;
    scores.risk -= 10;
  }

  if (inferredSurplus < 0) {
    scores.repayment -= 22;
    scores.cashFlow -= 9;
    scores.risk -= 12;
  }

  if (!enabled.aa && !enabled.receivables) {
    scores.cashFlow -= 5;
    scores.receivables -= 8;
    scores.risk -= 4;
  }

  if (!enabled.gst) {
    scores.revenue -= 6;
    scores.compliance -= 6;
  }

  if (lowSourceCoverage) {
    scores.repayment -= 6;
    scores.risk -= 5;
  }

  Object.keys(scores).forEach((key) => {
    scores[key] = clamp(scores[key]);
  });

  const confidence = clamp(20 + activeCount * 14 + SOURCES.reduce((sum, source) => {
    return sum + (enabled[source.id] ? source.weight * 3 : 0);
  }, 0));

  const dataAvailable = activeCount > 0;
  const composite = dataAvailable
    ? clamp(
        scores.cashFlow * 0.2 +
          scores.revenue * 0.18 +
          scores.compliance * 0.16 +
          scores.repayment * 0.2 +
          scores.receivables * 0.12 +
          scores.risk * 0.14
      )
    : null;

  const monthlySurplus = Math.max(0, overrides.monthlyRevenue * 0.18 - overrides.existingEmi);
  const scoreFactor = composite ? composite / 100 : 0;
  const confidenceFactor = confidence / 100;
  const lower = dataAvailable ? monthlySurplus * 14 * scoreFactor * confidenceFactor : 0;
  const upper = dataAvailable ? monthlySurplus * 20 * scoreFactor * confidenceFactor : 0;
  const suggestedUpper = Math.min(persona.requested, Math.max(150000, upper));
  const suggestedLower = Math.min(suggestedUpper, Math.max(100000, lower));
  const notViable =
    dataAvailable &&
    activeCount >= 2 &&
    (composite < 58 ||
      scores.repayment < 45 ||
      (inferredSurplus < 0 && confidence < 70) ||
      (lowSourceCoverage && debtBurden > 0.28));

  return {
    activeCount,
    confidence,
    composite,
    scores,
    notViable,
    inferredSurplus,
    suggestedLower,
    suggestedUpper,
    emi: suggestedUpper / 24,
  };
}

function useApplicantState(personaId) {
  const persona = PERSONAS[personaId];
  const [inputs, setInputs] = useState(persona.inputs);
  useEffect(() => {
    setInputs(persona.inputs);
  }, [personaId, persona.inputs]);
  const reset = () => setInputs(persona.inputs);
  return [inputs, setInputs, reset];
}

function Explanation({ persona, enabled, result }) {
  const lines = [];

  if (result.activeCount === 0) {
    lines.push("Insufficient data for model-based limit assessment. No adverse mark is applied; the application is parked for data refresh.");
  } else {
    if (persona.cibil === "NH") {
      lines.push("CIBIL status is NH. The model treats no-history as neutral and uses consented business activity instead of penalizing the applicant.");
    }
    if (enabled.receivables && result.scores.receivables >= 70) {
      lines.push("Receivables improve the view of cash flow. Pending invoices from stronger buyers offset otherwise lumpy bank inflows.");
    }
    if (!enabled.aa) {
      lines.push("AA data is unavailable, so confidence drops. The score still runs on available sources and avoids a hard error state.");
    }
    if (!enabled.gst) {
      lines.push("GST is disconnected. Revenue authenticity relies more heavily on UPI, AA and receivable signals.");
    }
    if (result.scores.compliance >= 82) {
      lines.push("Compliance reliability is a positive reason code because filings, payroll or identity signals are consistent.");
    }
    if (result.scores.repayment < 65) {
      lines.push("Repayment capacity needs review because current obligations reduce estimated monthly surplus.");
    }
    if (result.notViable) {
      lines.unshift("Not viable at current terms: verified inflows do not support the requested debt load, and missing AA/receivable evidence prevents a safe collateral-free limit.");
    }
  }

  return (
    <section className="memo" aria-labelledby="memo-title">
      <div className="memo-header">
        <span>Decision memo</span>
        <span>Model v0.3</span>
      </div>
      <h2 id="memo-title">Reason codes</h2>
      <div className="memo-lines">
        {lines.slice(0, 5).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}

function Stamp({ result }) {
  let label = "INSUFFICIENT DATA";
  let tone = "low";
  if (result.notViable) {
    label = "NOT VIABLE";
    tone = "danger";
  } else if (result.composite !== null && result.confidence >= 70 && result.composite >= 72) {
    label = "VIABLE";
    tone = "high";
  } else if (result.composite !== null && result.composite >= 58) {
    label = "REVIEW";
    tone = "medium";
  }
  return (
    <div className={`stamp ${tone}`} aria-live="polite" key={`${label}-${result.composite}-${result.confidence}`}>
      {label}
    </div>
  );
}

function App() {
  const [personaId, setPersonaId] = useState("kirana");
  const [enabled, setEnabled] = useState({
    gst: true,
    upi: true,
    epfo: true,
    aa: true,
    receivables: true,
  });
  const [inputs, setInputs, resetInputs] = useApplicantState(personaId);
  const persona = PERSONAS[personaId];

  function changePersona(id) {
    setPersonaId(id);
  }

  function applyStressCase() {
    setPersonaId("kirana");
    setEnabled({
      gst: false,
      upi: true,
      epfo: true,
      aa: false,
      receivables: false,
    });
    setInputs({
      monthlyRevenue: 175000,
      monthlyUpi: 90000,
      gstDelayDays: 10,
      employees: 3,
      pendingReceivables: 75000,
      buyerQuality: 42,
      existingEmi: 90000,
    });
  }

  const result = useMemo(() => scoreApplicant(persona, enabled, inputs), [persona, enabled, inputs]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">IDBI Innovate 2026 / Track 03</p>
          <h1>MSME Financial Health Passport</h1>
        </div>
        <div className="seal" aria-label="Prototype status">
          <BookOpen size={18} />
          <span>Prototype Ledger</span>
        </div>
      </header>

      <section className="workspace" aria-label="Financial health scoring tool">
        <aside className="register panel">
          <div className="section-title">
            <Landmark size={18} />
            <h2>Applicant register</h2>
          </div>

          <div className="persona-tabs" role="tablist" aria-label="Applicant personas">
            {Object.entries(PERSONAS).map(([id, item]) => (
              <button
                key={id}
                role="tab"
                aria-selected={personaId === id}
                className={personaId === id ? "active" : ""}
                onClick={() => changePersona(id)}
              >
                <span>{item.name}</span>
                <small>{item.status}</small>
              </button>
            ))}
          </div>

          <dl className="applicant-card">
            <div>
              <dt>Owner</dt>
              <dd>{persona.owner}</dd>
            </div>
            <div>
              <dt>Profile</dt>
              <dd>{persona.location}</dd>
            </div>
            <div>
              <dt>Bureau</dt>
              <dd>{persona.cibil}</dd>
            </div>
            <div>
              <dt>Requested</dt>
              <dd>{formatINR(persona.requested)}</dd>
            </div>
          </dl>

          <p className="margin-note">{persona.note}</p>

          <div className="source-list">
            <h3>Consented sources</h3>
            {SOURCES.map((source) => {
              const Icon = source.icon;
              return (
                <label className="source-row" key={source.id}>
                  <span>
                    <Icon size={16} />
                    {source.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={enabled[source.id]}
                    onChange={() => setEnabled((current) => ({ ...current, [source.id]: !current[source.id] }))}
                  />
                </label>
              );
            })}
          </div>
        </aside>

        <section className="ledger panel">
          <div className="ledger-head">
            <div className="section-title">
              <ShieldCheck size={18} />
              <h2>Health ledger</h2>
            </div>
            <div className="ledger-actions">
              <button className="reset" onClick={applyStressCase}>
                <ShieldCheck size={15} />
                Stress case
              </button>
              <button className="reset" onClick={resetInputs}>
                <RotateCcw size={15} />
                Reset entries
              </button>
            </div>
          </div>

          <div className="score-strip">
            <div>
              <span>Composite score</span>
              <strong>{result.composite === null ? "--" : result.composite}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{result.confidence}%</strong>
            </div>
            <Stamp result={result} />
          </div>

          <table className="score-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Score</th>
                <th>Ledger mark</th>
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td className="mono">{result.activeCount === 0 ? "--" : result.scores[key]}</td>
                  <td>
                    <div className="tick-track" aria-hidden="true">
                      <span style={{ width: `${result.activeCount === 0 ? 0 : result.scores[key]}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="adjustments" aria-label="Underlying applicant data controls">
            <Slider label="Monthly revenue" value={inputs.monthlyRevenue} min={150000} max={1400000} step={25000} onChange={(monthlyRevenue) => setInputs({ ...inputs, monthlyRevenue })} money />
            <Slider label="Monthly UPI receipts" value={inputs.monthlyUpi} min={50000} max={900000} step={10000} onChange={(monthlyUpi) => setInputs({ ...inputs, monthlyUpi })} money />
            <Slider label="GST delay days" value={inputs.gstDelayDays} min={0} max={10} step={1} onChange={(gstDelayDays) => setInputs({ ...inputs, gstDelayDays })} />
            <Slider label="Pending receivables" value={inputs.pendingReceivables} min={0} max={1100000} step={25000} onChange={(pendingReceivables) => setInputs({ ...inputs, pendingReceivables })} money />
            <Slider label="Buyer quality" value={inputs.buyerQuality} min={20} max={95} step={1} onChange={(buyerQuality) => setInputs({ ...inputs, buyerQuality })} />
            <Slider label="Existing EMI" value={inputs.existingEmi} min={0} max={90000} step={2500} onChange={(existingEmi) => setInputs({ ...inputs, existingEmi })} money />
          </div>
        </section>

        <aside className="decision panel">
          <div className="section-title">
            <Banknote size={18} />
            <h2>Limit note</h2>
          </div>

          <div className="loan-output">
            <span>Recommended range</span>
            <strong>
              {result.activeCount === 0
                ? "Hold for data"
                : result.notViable
                  ? "No safe limit"
                : `${formatINR(result.suggestedLower)} - ${formatINR(result.suggestedUpper)}`}
            </strong>
            <p>
              {result.activeCount === 0
                ? "The passport waits for at least one consented source before proposing a limit."
                : result.notViable
                  ? "Current cash-flow evidence does not support a collateral-free loan. Reassess after AA or verified receivables improve coverage."
                : `Indicative term: 24 months, estimated EMI near ${formatINR(result.emi)}.`}
            </p>
          </div>

          <div className="confidence-book">
            <div>
              <span>Source coverage</span>
              <strong className="mono">{result.activeCount}/5</strong>
            </div>
            <div>
              <span>Audit posture</span>
              <strong>{result.confidence >= 70 ? "Strong" : result.confidence >= 45 ? "Partial" : "Thin"}</strong>
            </div>
          </div>

          <Explanation persona={persona} enabled={enabled} result={result} />

          <div className="improvement">
            <div className="section-title small">
              <BadgeCheck size={16} />
              <h3>Next entries</h3>
            </div>
            <p>30 days: reconnect missing consent sources.</p>
            <p>60 days: reduce GST filing delays below 2 days.</p>
            <p>90 days: route verified receivables through discountable invoice rails.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Slider({ label, value, min, max, step, onChange, money = false }) {
  return (
    <label className="slider">
      <span>
        {label}
        <b>{money ? formatINR(value) : value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
