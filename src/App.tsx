import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Settings, Sparkles, Download, ClipboardCopy, ChevronRight, ShieldCheck, Scale, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ------------------------------------------------------------
// CredSmash App MVP – Single‑file React component
// ------------------------------------------------------------
// What this does
// - Collects core case data (per your specs)
// - Decides which document to generate (Validation / Verification / Answer / Admissions / Productions / Interrogatories)
// - Injects optional Counterclaim + 1099‑C (Debt Closure Doctrine) language
// - Exports the result as a clean .txt file (one click) or lets users copy to clipboard
// - Uses a light, modern UI with shadcn + Tailwind
// ------------------------------------------------------------

const Section = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
  <Card className="rounded-2xl shadow-sm border border-slate-200">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-slate-800">
        {Icon ? <Icon className="h-5 w-5" /> : null}
        <span className="text-lg">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <div className="flex items-center justify-between p-3 border rounded-xl">
    <Label className="text-sm text-slate-700">{label}</Label>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-slate-900" : "bg-slate-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

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

// ---------------------- Business Logic ----------------------

type Form = {
  // Court caption
  defendantName: string;
  plaintiffName: string;
  courtCity: string;
  courtCounty: string;
  courtState: string;
  courtType: string; // District / Circuit / County etc.

  // Plaintiff counsel contact
  attyName: string;
  attyPhone: string;
  attyAddress: string;

  // Status + strategy
  hasBeenSued: boolean; // if No => Validation/Verification letters
  includeCounterclaim: boolean;
  arbitrationClause: boolean;
  reported1099C: boolean; // Debt Closure Doctrine

  // Authority / assignment checks (pre‑suit & post‑suit relevance)
  assignmentNoticeFiled: boolean;
  attyAuthorizedByOriginalCreditor: boolean;

  // Case metadata
  caseNumber: string;
  filingDate: string; // yyyy-mm-dd

  // Free‑text facts
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

function decideDocTypes(f: Form): string[] {
  if (!f.hasBeenSued) {
    // Pre‑suit workflow
    return ["Debt Validation Letter", "Debt Verification Letter"];
  }
  // Suit filed
  const out = ["Answer", "Requests for Admission", "Requests for Production", "Interrogatories"];
  if (f.includeCounterclaim) out.push("Counterclaim");
  return out;
}

// Signature sentences placeholder (your proprietary hooks)
const signatureSentences = {
  validation: "CredSmash Signature: The alleged claim is disputed in its entirety pending strict proof with competent, admissible evidence establishing standing and a complete chain of title.",
  verification: "CredSmash Signature: Provide sworn verification by a person with personal knowledge, not a mere servicer declaration or hearsay custodian affidavit.",
  answer: "CredSmash Signature: Defendant denies for lack of sufficient knowledge where Plaintiff’s pleading is built on assignment, redaction, or data‑dump exhibits without a witness competent to testify.",
  admissions: "CredSmash Signature: Requests track the elements of standing, ownership, and admissibility to position this case for a clean Summary Judgment if Plaintiff defaults.",
  productions: "CredSmash Signature: Produce the complete, unredacted chain of title, bill of sale with schedules referencing the Account, and authenticated records under Rules of Evidence.",
  rogs: "CredSmash Signature: Interrogatories compel Plaintiff to identify each custodian, each document relied upon, and the legal basis for suing under this caption.",
  counter: "CredSmash Signature: Plaintiff’s acts, as alleged, constitute unfair or deceptive practices actionable under state UDAP and the FDCPA where applicable.",
};

function headerBlock(f: Form) {
  const courtLine = `${f.courtCity}, ${f.courtCounty} County, ${f.courtState} – ${f.courtType} Court`.replace(/\s+/g, " ").trim();
  return `IN THE ${courtLine.toUpperCase()}\n\n${f.plaintiffName} (Plaintiff)\nvs.\n${f.defendantName} (Defendant)\n\nCase No.: ${f.caseNumber || "[TBD]"}\nFiled: ${f.filingDate || "[TBD]"}\n`;
}

function preSuitValidation(f: Form) {
  const lines = [] as string[];
  lines.push("RE: Debt Validation Letter");
  lines.push("");
  lines.push(`To: ${f.attyName} | ${f.attyAddress} | ${f.attyPhone}`);
  lines.push("");
  lines.push("This is a request for validation under the FDCPA and any similar state law. The alleged debt is disputed.");
  lines.push("1) Identify the current creditor and complete chain of title from the original creditor, including each assignment and bill of sale where the specific Account is listed or referenced.");
  lines.push("2) Provide the signed agreement, full account‑level transaction history, and itemization of the amount claimed (principal, interest, fees).\n");
  lines.push("Authority & Assignment:");
  lines.push("3) State whether you (or your firm) are authorized by the ORIGINAL CREDITOR to collect or litigate in their name; provide the actual written authorization if so.");
  lines.push("4) Confirm whether an assignment notice was filed/served as required by law for any transfer of the alleged account.");
  lines.push("5) Identify whether any attorney was hired by a debt buyer to file suit in the original creditor’s name. If so, provide the written authorization and engagement.\n");
  if (f.reported1099C) {
    lines.push("Debt Closure Doctrine:");
    lines.push("6) Confirm whether a Form 1099‑C was issued for this account and whether the creditor treated the account as discharged/closed.");
  }
  lines.push("");
  lines.push(signatureSentences.validation);
  return lines.join("\n");
}

function preSuitVerification(f: Form) {
  const lines = [] as string[];
  lines.push("RE: Debt Verification Letter");
  lines.push("");
  lines.push(`To: ${f.attyName} | ${f.attyAddress} | ${f.attyPhone}`);
  lines.push("");
  lines.push("Provide sworn verification from a person with personal knowledge of the records, including the basis for ownership/standing.");
  lines.push("Attach authenticated documents sufficient for trial under the Rules of Evidence, not mere spreadsheets or summaries.");
  lines.push("");
  lines.push(signatureSentences.verification);
  return lines.join("\n");
}

function suitAnswer(f: Form) {
  const lines = [] as string[];
  lines.push(headerBlock(f));
  lines.push("DEFENDANT’S ANSWER");
  lines.push("");
  lines.push("1. Defendant denies each and every material allegation not expressly admitted herein.");
  lines.push("2. Plaintiff lacks standing absent a complete chain of title and admissible proof of ownership.");
  if (f.arbitrationClause) lines.push("3. Affirmative Defense – Arbitration: The governing card agreement requires binding arbitration. Defendant invokes arbitration and waives litigation.");
  if (!f.assignmentNoticeFiled) lines.push("4. Affirmative Defense – Assignment/Notice: No compliant notice of assignment was provided; any transfer is unenforceable against Defendant.");
  if (!f.attyAuthorizedByOriginalCreditor) lines.push("5. Affirmative Defense – Authority: Any attorney purporting to sue in the original creditor’s name must show actual written authorization; none has been produced.");
  if (f.reported1099C) lines.push("6. Affirmative Defense – Debt Closure: The account was discharged and a 1099‑C issued/treated as income; collection is barred.");
  lines.push("");
  lines.push(signatureSentences.answer);
  return lines.join("\n");
}

function suitAdmissions(f: Form) {
  const lines = [] as string[];
  lines.push(headerBlock(f));
  lines.push("DEFENDANT’S FIRST REQUESTS FOR ADMISSION TO PLAINTIFF");
  lines.push("");
  lines.push("RFA 1: Admit you do not possess a complete, unredacted chain of title linking the alleged Account from the original creditor to Plaintiff.");
  lines.push("RFA 2: Admit the alleged Account is not identified by unique account number in any bill of sale relied upon by Plaintiff.");
  lines.push("RFA 3: Admit you lack a witness with personal knowledge competent to authenticate the records under the Rules of Evidence.");
  lines.push("RFA 4: Admit the governing card agreement contains a binding arbitration clause applicable to the claims.");
  lines.push("");
  lines.push(signatureSentences.admissions);
  return lines.join("\n");
}

function suitProductions(f: Form) {
  const lines = [] as string[];
  lines.push(headerBlock(f));
  lines.push("DEFENDANT’S FIRST REQUEST FOR PRODUCTION TO PLAINTIFF");
  lines.push("");
  lines.push("1. Complete, unredacted chain of title with schedules referencing the specific Account.");
  lines.push("2. Executed cardmember agreement(s) applicable to the alleged Account and time period.");
  lines.push("3. Full, itemized account‑level transaction history supporting the amount claimed.");
  lines.push("4. Communications evidencing actual written authorization for any attorney to file in the original creditor’s name.");
  lines.push("5. Any Form 1099‑C and related discharge/charge‑off entries.");
  lines.push("");
  lines.push(signatureSentences.productions);
  return lines.join("\n");
}

function suitInterrogatories(f: Form) {
  const lines = [] as string[];
  lines.push(headerBlock(f));
  lines.push("DEFENDANT’S FIRST SET OF INTERROGATORIES TO PLAINTIFF");
  lines.push("");
  lines.push("1. Identify each person with knowledge supporting standing/ownership, including title and custodian responsibilities.");
  lines.push("2. Identify each document you contend authenticates ownership/assignment of the alleged Account.");
  lines.push("3. State the legal basis for suing under this caption and whether authority was granted by the original creditor.");
  lines.push("4. Describe any arbitration clause and your position on its applicability.");
  lines.push("");
  lines.push(signatureSentences.rogs);
  return lines.join("\n");
}

function suitCounterclaim(f: Form) {
  const lines = [] as string[];
  lines.push(headerBlock(f));
  lines.push("DEFENDANT’S COUNTERCLAIM");
  lines.push("");
  lines.push("Count I – Unfair or Deceptive Practices (UDAP)");
  lines.push("Count II – FDCPA Violations (where applicable)");
  lines.push("Facts: " + (f.facts || "[Insert concise factual narrative with dates]") );
  if (!f.attyAuthorizedByOriginalCreditor) lines.push("Allegation: Filing in the name of the original creditor without written authorization is deceptive and unlawful.");
  if (f.reported1099C) lines.push("Allegation: Attempting to collect after discharge/1099‑C constitutes an unfair practice.");
  lines.push("");
  lines.push(signatureSentences.counter);
  return lines.join("\n");
}

function renderDocs(f: Form): { title: string; body: string }[] {
  const types = decideDocTypes(f);
  const out: { title: string; body: string }[] = [];

  if (!f.hasBeenSued) {
    out.push({ title: types[0], body: preSuitValidation(f) });
    out.push({ title: types[1], body: preSuitVerification(f) });
    return out;
  }

  // Sued
  out.push({ title: "Answer", body: suitAnswer(f) });
  out.push({ title: "Requests for Admission", body: suitAdmissions(f) });
  out.push({ title: "Requests for Production", body: suitProductions(f) });
  out.push({ title: "Interrogatories", body: suitInterrogatories(f) });
  if (f.includeCounterclaim) out.push({ title: "Counterclaim", body: suitCounterclaim(f) });

  return out;
}

export default function CredSmashAppMVP() {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeIdx, setActiveIdx] = useState(0);
  const docs = useMemo(() => renderDocs(form), [form]);
  const activeDoc = docs[activeIdx];

  const update = (k: keyof Form, v: any) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white grid place-items-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-wide text-slate-500">CredSmash</div>
              <div className="font-semibold">Court‑Ready Doc Generator (MVP)</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" className="rounded-2xl"><Settings className="h-4 w-4 mr-2"/>Settings</Button>
            <Button className="rounded-2xl"><Sparkles className="h-4 w-4 mr-2"/>Generate</Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-2">
        {/* Left: Form */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
          <Section title="Case Caption" icon={Scale}>
            <Row>
              <div>
                <Label>Plaintiff</Label>
                <Input value={form.plaintiffName} onChange={(e) => update("plaintiffName", e.target.value)} placeholder="CAPITAL ONE, N.A."/>
              </div>
              <div>
                <Label>Defendant</Label>
                <Input value={form.defendantName} onChange={(e) => update("defendantName", e.target.value)} placeholder="John Doe"/>
              </div>
              <div>
                <Label>Case Number</Label>
                <Input value={form.caseNumber} onChange={(e) => update("caseNumber", e.target.value)} placeholder="2025‑CA‑000123"/>
              </div>
              <div>
                <Label>Filing Date</Label>
                <Input type="date" value={form.filingDate} onChange={(e) => update("filingDate", e.target.value)} />
              </div>
            </Row>
            <Row>
              <div>
                <Label>Court City</Label>
                <Input value={form.courtCity} onChange={(e) => update("courtCity", e.target.value)} placeholder="Fort Lauderdale"/>
              </div>
              <div>
                <Label>Court County</Label>
                <Input value={form.courtCounty} onChange={(e) => update("courtCounty", e.target.value)} placeholder="Broward"/>
              </div>
              <div>
                <Label>Court State</Label>
                <Input value={form.courtState} onChange={(e) => update("courtState", e.target.value)} placeholder="Florida"/>
              </div>
              <div>
                <Label>Court Type</Label>
                <Input value={form.courtType} onChange={(e) => update("courtType", e.target.value)} placeholder="Circuit Court"/>
              </div>
            </Row>
          </Section>

          <Section title="Plaintiff’s Attorney" icon={Hammer}>
            <Row>
              <div>
                <Label>Name</Label>
                <Input value={form.attyName} onChange={(e) => update("attyName", e.target.value)} placeholder="Jane Lawyer, Esq."/>
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.attyPhone} onChange={(e) => update("attyPhone", e.target.value)} placeholder="(555) 123‑4567"/>
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input value={form.attyAddress} onChange={(e) => update("attyAddress", e.target.value)} placeholder="123 Firm Rd, Suite 400, City, ST 00000"/>
              </div>
            </Row>
          </Section>

          <Section title="Status & Strategy" icon={CheckCircle2}>
            <div className="grid gap-3">
              <Toggle checked={form.hasBeenSued} onChange={(v) => update("hasBeenSued", v)} label="Has a lawsuit already been filed?"/>
              <Toggle checked={form.includeCounterclaim} onChange={(v) => update("includeCounterclaim", v)} label="Include Counterclaim (optional)"/>
              <Toggle checked={form.arbitrationClause} onChange={(v) => update("arbitrationClause", v)} label="Arbitration clause applies"/>
              <Toggle checked={form.reported1099C} onChange={(v) => update("reported1099C", v)} label="1099‑C reported / debt discharged"/>
              <Toggle checked={form.assignmentNoticeFiled} onChange={(v) => update("assignmentNoticeFiled", v)} label="Assignment notice filed/served"/>
              <Toggle checked={form.attyAuthorizedByOriginalCreditor} onChange={(v) => update("attyAuthorizedByOriginalCreditor", v)} label="Attorney has written authorization from original creditor"/>
            </div>
          </Section>

          <Section title="Facts (optional)" icon={FileText}>
            <Textarea
              value={form.facts}
              onChange={(e) => update("facts", e.target.value)}
              placeholder="Short narrative (dates, calls, letters, key facts)…"
              className="min-h-[120px]"
            />
          </Section>
        </motion.div>

        {/* Right: Output */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-4">
          <Section title="Generated Documents" icon={Sparkles}>
            <div className="flex flex-wrap gap-2 mb-3">
              {docs.map((d, i) => (
                <Button key={d.title} variant={i === activeIdx ? "default" : "outline"} className="rounded-2xl" onClick={() => setActiveIdx(i)}>
                  {d.title}
                </Button>
              ))}
            </div>
            <div className="rounded-xl border p-3 bg-slate-50">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-slate-800">{activeDoc?.body}</pre>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                className="rounded-2xl"
                onClick={() => {
                  navigator.clipboard.writeText(activeDoc?.body || "");
                }}
              >
                <ClipboardCopy className="h-4 w-4 mr-2"/>Copy
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => downloadText(`${activeDoc?.title?.replace(/\s+/g, "_") || "document"}.txt`, activeDoc?.body || "")}
              >
                <Download className="h-4 w-4 mr-2"/>Download .txt
              </Button>
            </div>
          </Section>

          <Section title="What gets generated (logic)" icon={ChevronRight}>
            <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li><b>Not sued</b> → Validation + Verification letters.</li>
              <li><b>Sued</b> → Answer + Admissions + Productions + Interrogatories. Optional Counterclaim if toggled.</li>
              <li><b>Arbitration on</b> → Inserts an arbitration defense into the Answer.</li>
              <li><b>No assignment notice</b> → Adds an affirmative defense on assignment/notice.</li>
              <li><b>No original‑creditor authorization</b> → Defense on attorney authority and deceptive filing.</li>
              <li><b>1099‑C on</b> → Adds Debt Closure Doctrine language across relevant docs.</li>
            </ul>
          </Section>

          <Section title="Next steps (optional wiring)" icon={Settings}>
            <ol className="text-sm text-slate-700 list-decimal pl-5 space-y-1">
              <li>Swap the .txt exporter with a real <b>.docx</b> generator (use the <code>docx</code> npm package).</li>
              <li>POST the <b>form</b> to your API (Zapier / n8n / Make / Cloudflare Worker) and render a Documint template.</li>
              <li>Gate this behind an <b>Agent Login</b> and log each generation for audits.</li>
              <li>Add <b>state‑specific</b> toggles (e.g., Florida vs. Texas evidence quirks).</li>
            </ol>
          </Section>
        </motion.div>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} CredSmash. Educational use only. Not legal advice.
        </div>
      </footer>
    </div>
  );
}
