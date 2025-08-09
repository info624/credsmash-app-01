import { useMemo, useState } from "react";

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

function decideDocTypes(f: Form): string[] {
  if (!f.hasBeenSued) {
    return ["Debt Validation Letter", "Debt Verification Letter"];
  }
  const out = ["Answer", "Requests for Admission", "Requests for Production", "Interrogatories"];
  if (f.includeCounterclaim) out.push("Counterclaim");
  return out;
}

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

const sig = {
  validation: "CredSmash Signature: The alleged claim is disputed pending strict proof with admissible evidence establishing standing and chain of title.",
  verification: "CredSmash Signature: Provide sworn verification by a person with personal knowledge, not a mere servicer declaration.",
  answer: "CredSmash Signature: Defendant denies for lack of sufficient knowledge where Plaintiff’s pleading relies on assignment or unverified records.",
  admissions: "CredSmash Signature: Requests track the elements of standing, ownership, and admissibility to position this case for Summary Judgment if Plaintiff defaults.",
  productions: "CredSmash Signature: Produce the complete, unredacted chain of title, bill of sale with schedules, and authenticated records under Rules of Evidence.",
  rogs: "CredSmash Signature: Interrogatories compel Plaintiff to identify custodians, relied-upon documents, and legal basis for suing.",
  counter: "CredSmash Signature: Plaintiff’s acts constitute unfair or deceptive practices under UDAP and FDCPA where applicable.",
};

function preSuitValidation(f: Form) {
  const L: string[] = [];
  L.push("RE: Debt Validation Letter", "");
  L.push(`To: ${f.attyName} | ${f.attyAddress} | ${f.attyPhone}`, "");
  L.push("This is a request for validation under the FDCPA. The alleged debt is disputed.");
  if (f.reported1099C) {
    L.push("Confirm whether a Form 1099-C was issued for this account.");
  }
  L.push("", sig.validation);
  return L.join("\n");
}

function preSuitVerification(f: Form) {
  return `RE: Debt Verification Letter

To: ${f.attyName} | ${f.attyAddress} | ${f.attyPhone}

Provide sworn verification from a person with personal knowledge of the records.
${sig.verification}`;
}

function suitAnswer(f: Form) {
  const L: string[] = [];
  L.push(headerBlock(f), "DEFENDANT’S ANSWER", "");
  L.push("1. Defendant denies each and every material allegation.");
  if (f.arbitrationClause) L.push("Arbitration clause applies.");
  if (f.reported1099C) L.push("Debt Closure: 1099-C issued/treated as income; collection barred.");
  L.push("", sig.answer);
  return L.join("\n");
}

function renderDocs(f: Form) {
  const types = decideDocTypes(f);
  if (!f.hasBeenSued) {
    return [
      { title: types[0], body: preSuitValidation(f) },
      { title: types[1], body: preSuitVerification(f) },
    ];
  }
  const out = [{ title: "Answer", body: suitAnswer(f) }];
  return out;
}

export default function App() {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeIdx, setActiveIdx] = useState(0);
  const docs = useMemo(() => renderDocs(form), [form]);
  const activeDoc = docs[activeIdx];

  const field = (label: string, key: keyof Form, props: any = {}) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12 }}>{label}</label>
      <input
        style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        value={form[key] as string}
        onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
        {...props}
      />
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>CredSmash Doc Generator</h1>
      {field("Plaintiff", "plaintiffName")}
      {field("Defendant", "defendantName")}
      <label>
        <input
          type="checkbox"
          checked={form.hasBeenSued}
          onChange={(e) => setForm((s) => ({ ...s, hasBeenSued: e.target.checked }))}
        />{" "}
        Has a lawsuit been filed?
      </label>
      <div style={{ marginTop: 20 }}>
        {docs.map((d, i) => (
          <button key={i} onClick={() => setActiveIdx(i)} style={{ marginRight: 10 }}>
            {d.title}
          </button>
        ))}
      </div>
      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{activeDoc?.body}</pre>
    </div>
  );
}

