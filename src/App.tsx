import { useMemo, useState } from "react";

/** ---------- helpers ---------- */
type Form = {
  defendantName: string;
  plaintiffName: string;
  courtCity: string;
  courtCounty: string;
  courtState: string;
  courtType: string;
  attyName: string;
  attyPhone: string;
  attyAddress: string;
  hasBeenSued: boolean;
  includeCounterclaim: boolean;
  arbitrationClause: boolean;
  reported1099C: boolean;
  assignmentNoticeFiled: boolean;
  attyAuthorizedByOriginalCreditor: boolean;
  caseNumber: string;
  filingDate: string;
  facts: string;
};

const initialForm: Form = {
  defendantName: "",
  plaintiffName: "",
  courtCity: "",
  courtCounty: "",
  courtState: "",
  courtType: "",
  attyName: "",
  attyPhone: "",
  attyAddress: "",
  hasBeenSued: false,
  includeCounterclaim: false,
  arbitrationClause: false,
  reported1099C: false,
  assignmentNoticeFiled: false,
  attyAuthorizedByOriginalCreditor: false,
  caseNumber: "",
  filingDate: "",
  facts: "",
};

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** ---------- business logic ---------- */
const sig = {
  validation:
    "CredSmash Signature: The alleged claim is disputed in its entirety pending strict proof with competent, admissible evidence establishing standing and a complete chain of title.",
  verification:
    "CredSmash Signature: Provide sworn verification by a person with personal knowledge, not a mere servicer declaration or hearsay custodian affidavit.",
  answer:
    "CredSmash Signature: Defendant denies for lack of sufficient knowledge where Plaintiff’s pleading is built on assignment, redaction, or data-dump exhibits without a witness competent to testify.",
  admissions:
    "CredSmash Signature: Requests track the elements of standing, ownership, and admissibility to position this case for a clean Summary Judgment if Plaintiff defaults.",
  productions:
    "CredSmash Signature: Produce the complete, unredacted chain of title, bill of sale with schedules referencing the Account, and authenticated records under Rules of Evidence.",
  rogs:
    "CredSmash Signature: Interrogatories compel Plaintiff to identify each custodian, each document relied upon, and the legal basis for suing under this caption.",
  counter:
    "CredSmash Signature: Plaintiff’s acts, as alleged, constitute unfair or deceptive practices actionable under state UDAP and the FDCPA where applicable.",
};

function headerBlock(f: Form) {
  const courtLine = `${f.courtCity}, ${f.courtCounty} County, ${f.courtState} – ${f.courtType} Court`
    .replace(/\s+/g, " ")
    .trim();
  return `IN THE ${courtLine.toUpperCase()}

${f.plaintiffName} (Plaintiff)
vs.
${f.defendantName} (Defendant)

Case No.: ${f.caseNumber || "[TBD]"}
Filed: ${f.filingDate || "[TBD]"}
`;
}

function preSuitValidation(f: Form) {
  const L: string[] = [];
  L.push("RE: Debt Validation Letter", "");
  L.push(`To: ${f.attyName} | ${f.attyAddress} | ${f.attyPhone}`, "");
  L.push("This is a request for validation under the FDCPA and any similar state law. The alleged debt is disputed.");
  L.push(
    "1) Identify the current creditor and complete chain of title from the original creditor, including each assignment and bill of sale where the specific Account is listed or referenced."
  );
  L.push(
    "2) Provide the signed agreement, full account-level transaction history, and itemization of the amount claimed (principal, interest, fees).\n"
  );
  L.push("Authority & Assignment:");
  L.push(
    "3) State whether you (or your firm) are authorized by the ORIGINAL CREDITOR to collect or litigate in their name; provide the actual written authorization if so."
  );
  L.push("4) Confirm whether an assignment notice was filed/served as required by law for any transfer of the alleged account.");
  L.push(
    "5) Identify whether any attorney was hired by a debt buyer to file suit in the original creditor’s name. If so, provide the written authorization and engagement.\n"
  );
  if (f.reported1099C) {
    L.push("Debt Closure Doctrine:");
    L.push("6) Confirm whether a Form 1099-C was issued for this account and whether the creditor treated the account as discharged/closed.");
  }
  L.push("", sig.validation);
  return L.join("\n");
}

function preSuitVerification(f: Form) {
  return `RE: Debt Verification Letter

To: ${f.attyName} | ${f.attyAddress} | ${f.attyPhone}

Provide sworn verification from a person with personal knowledge of the records, including the basis for ownership/standing.
Attach authenticated documents sufficient for trial under the Rules of Evidence, not mere spreadsheets or summaries.

${sig.verification}`;
}

function suitAnswer(f: Form) {
  const L: string[] = [];
  L.push(headerBlock(f), "DEFENDANT’S ANSWER", "");
  L.push("1. Defendant denies each and every material allegation not expressly admitted herein.");
  L.push("2. Plaintiff lacks standing absent a complete chain of title and admissible proof of ownership.");
  if (f.arbitrationClause)
    L.push("3. Affirmative Defense – Arbitration: The governing card agreement requires binding arbitration. Defendant invokes arbitration and waives litigation.");
  if (!f.assignmentNoticeFiled)
    L.push("4. Affirmative Defense – Assignment/Notice: No compliant notice of assignment was provided; any transfer is unenforceable against Defendant.");
  if (!f.attyAuthorizedByOriginalCreditor)
    L.push(
      "5. Affirmative Defense – Authority: Any attorney purporting to sue in the original creditor’s name must show actual written authorization; none has been produced."
    );
  if (f.reported1099C)
    L.push("6. Affirmative Defense – Debt Closure: The account was discharged and a 1099-C issued/treated as income; collection is barred.");
  L.push("", sig.answer);
  return L.join("\n");
}

function suitAdmissions(f: Form) {
  const L: string[] = [];
  L.push(headerBlock(f), "DEFENDANT’S FIRST REQUESTS FOR ADMISSION TO PLAINTIFF", "");
  L.push("RFA 1: Admit you do not possess a complete, unredacted chain of title linking the alleged Account from the original creditor to Plaintiff.");
  L.push("RFA 2: Admit the alleged Account is not identified by unique account number in any bill of sale relied upon by Plaintiff.");
  L.push("RFA 3: Admit you lack a witness with personal knowledge competent to authenticate the records under the Rules of Evidence.");
  L.push("RFA 4: Admit the governing card agreement contains a binding arbitration clause applicable to the claims.", "", sig.admissions);
  return L.join("\n");
}

function suitProductions(f: Form) {
  const L: string[] = [];
  L.push(headerBlock(f), "DEFENDANT’S FIRST REQUEST FOR PRODUCTION TO PLAINTIFF", "");
  L.push("1. Complete, unredacted chain of title with schedules referencing the specific Account.");
  L.push("2. Executed cardmember agreement(s) applicable to the alleged Account and time period.");
  L.push("3. Full, itemized account-level transaction history supporting the amount claimed.");
  L.push("4. Communications evidencing actual written authorization for any attorney to file in the original creditor’s name.");
  L.push("5. Any Form 1099-C and related discharge/charge-off entries.", "", sig.productions);
  return L.join("\n");
}

function suitInterrogatories(f: Form) {
  const L: string[] = [];
  L.push(headerBlock(f), "DEFENDANT’S FIRST SET OF INTERROGATORIES TO PLAINTIFF", "");
  L.push("1. Identify each person with knowledge supporting standing/ownership, including title and custodian responsibilities.");
  L.push("2. Identify each document you contend authenticates ownership/assignment of the alleged Account.");
  L.push("3. State the legal basis for suing under this caption and whether authority was granted by the original creditor.");
  L.push("4. Describe any arbitration clause and your position on its applicability.", "", sig.rogs);
  return L.join("\n");
}

function suitCounterclaim(f: Form) {
  const L: string[] = [];
  L.push(headerBlock(f), "DEFENDANT’S COUNTERCLAIM", "");
  L.push("Count I – Unfair or Deceptive Practices (UDAP)");
  L.push("Count II – FDCPA Violations (where applicable)");
  L.push("Facts: " + (f.facts || "[Insert concise factual narrative with dates]"));
  if (!f.attyAuthorizedByOriginalCreditor)
    L.push("Allegation: Filing in the name of the original creditor without written authorization is deceptive and unlawful.");
  if (f.reported1099C) L.push("Allegation: Attempting to collect after discharge/1099-C constitutes an unfair practice.", "", sig.counter);
  return L.join("\n");
}

function decideDocTypes(f: Form): string[] {
  if (!f.hasBeenSued) return ["Debt Validation Letter", "Debt Verification Letter"];
  const out = ["Answer", "Requests for Admission", "Requests for Production", "Interrogatories"];
  if (f.includeCounterclaim) out.push("Counterclaim");
  return out;
}

function renderDocs(f: Form): { title: string; body: string }[] {
  const types = decideDocTypes(f);
  const out: { title: string; body: string }[] = [];
  if (!f.hasBeenSued) {
    out.push({ title: types[0], body: preSuitValidation(f) });
    out.push({ title: types[1], body: preSuitVerification(f) });
    return out;
  }
  out.push({ title: "Answer", body: suitAnswer(f) });
  out.push({ title: "Requests for Admission", body: suitAdmissions(f) });
  out.push({ title: "Requests for Production", body: suitProductions(f) });
  out.push({ title: "Interrogatories", body: suitInterrogatories(f) });
  if (f.includeCounterclaim) out.push({ title: "Counterclaim", body: suitCounterclaim(f) });
  return out;
}

/** ---------- UI bits ---------- */
const container: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: 16 };
const card: React.CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16 };
const label: React.CSSProperties = { fontSize: 12, color: "#334155", marginBottom: 4 };
const input: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", width: "100%" };

const Field = ({
  labelText,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  labelText: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={label}>{labelText}</label>
    <input style={input} value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} />
  </div>
);

export default function App() {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeIdx, setActiveIdx] = useState(0);
  const docs = useMemo(() => renderDocs(form), [form]);
  const activeDoc = docs[activeIdx];

  const update = <K extends keyof Form>(k: K, v: Form[K]) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, background: "white", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ ...container, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>CredSmash</div>
            <div style={{ fontWeight: 700 }}>Court-Ready Doc Generator (MVP)</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ padding: "8px 12px", borderRadius: 14, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
              Settings
            </button>
            <button style={{ padding: "8px 12px", borderRadius: 14, border: "1px solid #0f172a", background: "#0f172a", color: "white", cursor: "pointer" }}>
              Generate
            </button>
          </div>
        </div>
      </header>

      <main style={{ ...container, display: "grid", gap: 16, gridTemplateColumns: "1fr", alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "grid", gap: 16 }}>
          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Case Caption</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <Field labelText="Plaintiff" value={form.plaintiffName} onChange={(v) => update("plaintiffName", v)} placeholder="CAPITAL ONE, N.A." />
              <Field labelText="Defendant" value={form.defendantName} onChange={(v) => update("defendantName", v)} placeholder="John Doe" />
              <Field labelText="Case Number" value={form.caseNumber} onChange={(v) => update("caseNumber", v)} placeholder="2025-CA-000123" />
              <Field labelText="Filing Date" value={form.filingDate} onChange={(v) => update("filingDate", v)} type="date" />
              <Field labelText="Court City" value={form.courtCity} onChange={(v) => update("courtCity", v)} placeholder="Fort Lauderdale" />
              <Field labelText="Court County" value={form.courtCounty} onChange={(v) => update("courtCounty", v)} placeholder="Broward" />
              <Field labelText="Court State" value={form.courtState} onChange={(v) => update("courtState", v)} placeholder="Florida" />
              <Field labelText="Court Type" value={form.courtType} onChange={(v) => update("courtType", v)} placeholder="Circuit Court" />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Plaintiff’s Attorney</div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <Field labelText="Name" value={form.attyName} onChange={(v) => update("attyName", v)} placeholder="Jane Lawyer, Esq." />
              <Field labelText="Phone" value={form.attyPhone} onChange={(v) => update("attyPhone", v)} placeholder="(555) 123-4567" />
              <div style={{ gridColumn: "1 / span 2" }}>
                <Field
                  labelText="Address"
                  value={form.attyAddress}
                  onChange={(v) => update("attyAddress", v)}
                  placeholder="123 Firm Rd, Suite 400, City, ST 00000"
                />
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Status & Strategy</div>
            <div style={{ display: "grid", gap: 10 }}>
              <label><input type="checkbox" checked={form.hasBeenSued} onChange={(e) => update("hasBeenSued", e.target.checked)} /> Has a lawsuit already been filed?</label>
              <label><input type="checkbox" checked={form.includeCounterclaim} onChange={(e) => update("includeCounterclaim", e.target.checked)} /> Include Counterclaim (optional)</label>
              <label><input type="checkbox" checked={form.arbitrationClause} onChange={(e) => update("arbitrationClause", e.target.checked)} /> Arbitration clause applies</label>
              <label><input type="checkbox" checked={form.reported1099C} onChange={(e) => update("reported1099C", e.target.checked)} /> 1099-C reported / debt discharged</label>
              <label><input type="checkbox" checked={form.assignmentNoticeFiled} onChange={(e) => update("assignmentNoticeFiled", e.target.checked)} /> Assignment notice filed/served</label>
              <label>
                <input
                  type="checkbox"
                  checked={form.attyAuthorizedByOriginalCreditor}
                  onChange={(e) => update("attyAuthorizedByOriginalCreditor", e.target.checked)}
                />{" "}
                Attorney has written authorization from original creditor
              </label>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Facts (optional)</div>
            <textarea
              value={form.facts}
              onChange={(e) => update("facts", e.target.value)}
              placeholder="Short narrative (dates, calls, letters, key facts)…"
              style={{ width: "100%", minHeight: 120, padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
            />
          </div>
        </div>

        {/* Right column */}
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Generated Documents</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {docs.map((d, i) => (
              <button
                key={d.title}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: i === activeIdx ? "1px solid #0f172a" : "1px solid #cbd5e1",
                  background: i === activeIdx ? "#0f172a" : "white",
                  color: i === activeIdx ? "white" : "#0f172a",
                  cursor: "pointer",
                }}
              >
                {d.title}
              </button>
            ))}
          </div>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f1f5f9",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              minHeight: 260,
              fontSize: 13,
            }}
          >
{activeDoc?.body}
          </pre>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={() => navigator.clipboard.writeText(activeDoc?.body || "")}
              style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}
            >
              Copy
            </button>
            <button
              onClick={() =>
                downloadText(`${(activeDoc?.title || "document").replace(/\s+/g, "_")}.txt`, activeDoc?.body || "")
              }
              style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}
            >
              Download .txt
            </button>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: "#475569" }}>
            <b>What gets generated (logic)</b>
            <ul style={{ marginTop: 6, paddingLeft: 18 }}>
              <li><b>Not sued</b> → Validation + Verification letters.</li>
              <li><b>Sued</b> → Answer + Admissions + Productions + Interrogatories. Optional Counterclaim if toggled.</li>
              <li><b>Arbitration on</b> → Inserts arbitration defense into the Answer.</li>
              <li><b>No assignment notice</b> → Adds an affirmative defense on assignment/notice.</li>
              <li><b>No original-creditor authorization</b> → Defense on attorney authority and deceptive filing.</li>
              <li><b>1099-C on</b> → Adds Debt Closure Doctrine language across relevant docs.</li>
            </ul>
          </div>
        </div>

        <div style={{ ...card }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Next steps (optional wiring)</div>
          <ol style={{ paddingLeft: 18, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
            <li>Swap the .txt exporter with a real <b>.docx</b> generator (npm <code>docx</code>).</li>
            <li>POST the form to your API (Zapier / n8n / Make / Cloudflare Worker) and render a Documint template.</li>
            <li>Gate this behind an <b>Agent Login</b> and log each generation for audits.</li>
            <li>Add <b>state-specific</b> toggles (e.g., Florida vs. Texas evidence quirks).</li>
          </ol>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid #e2e8f0", background: "white", marginTop: 16 }}>
        <div style={{ ...container, padding: "12px 16px", fontSize: 12, color: "#64748b" }}>
          © {new Date().getFullYear()} CredSmash. Educational use only. Not legal advice.
        </div>
      </footer>
    </div>
  );
}
