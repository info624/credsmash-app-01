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
    L.push("5. Affirmative Defense – Authority: Any attorney purporting to sue in the original creditor’s name must show actual written authorization; none has been produced.");
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
  L.push("3. Full, itemized account-level transaction history supporting the amoun
