import { useState } from "react";

export default function App() {
  const [plaintiff, setPlaintiff] = useState("CAPITAL ONE, N.A.");
  const [defendant, setDefendant] = useState("John Doe");
  const [caseNumber, setCaseNumber] = useState("2025-CA-000123");
  const [courtCity, setCourtCity] = useState("Fort Lauderdale");
  const [courtCounty, setCourtCounty] = useState("Broward");
  const [courtState, setCourtState] = useState("Florida");
  const [courtType, setCourtType] = useState("Circuit Court");

  const [plaintiffAttorneyName, setPlaintiffAttorneyName] = useState("Jane Lawyer, Esq.");
  const [plaintiffAttorneyPhone, setPlaintiffAttorneyPhone] = useState("(555) 123-4567");
  const [plaintiffAttorneyAddress, setPlaintiffAttorneyAddress] = useState(
    "123 Firm Rd, Suite 400, City, ST 00000"
  );

  const [lawsuitFiled, setLawsuitFiled] = useState(false);
  const [counterclaim, setCounterclaim] = useState(false);
  const [arbitration, setArbitration] = useState(false);
  const [debtClosure, setDebtClosure] = useState(false);
  const [assignmentNotice, setAssignmentNotice] = useState(false);
  const [attorneyAuth, setAttorneyAuth] = useState(false);

  const [facts, setFacts] = useState("");

  const generatedText = `
RE: Debt Validation Letter

To:  |  |  

This is a request for validation under the FDCPA and any similar state law. The alleged debt is disputed.
1) Identify the current creditor and complete chain of title from the original creditor, including each assignment and bill of sale where the specific Account is listed or referenced.
2) Provide the signed agreement, full account-level transaction history, and itemization of the amount claimed (principal, interest, fees).

Authority & Assignment:
3) State whether you (or your firm) are authorized by the ORIGINAL CREDITOR to collect or litigate in their name; provide the actual written authorization if so.
4) Confirm whether an assignment notice was filed/served as required by law for any transfer of the alleged account.
5) Identify whether any attorney was hired by a debt buyer to file suit in the original creditor’s name. If so, provide the written authorization and engagement.

CredSmash Signature: The alleged claim is disputed in its entirety pending strict proof with competent, admissible evidence establishing standing and a complete chain of title.
`;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        CredSmash Court-Ready Doc Generator (MVP)
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left column: Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2>Case Caption</h2>
          <input value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} placeholder="Plaintiff" />
          <input value={defendant} onChange={(e) => setDefendant(e.target.value)} placeholder="Defendant" />
          <input value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} placeholder="Case Number" />
          <input value={courtCity} onChange={(e) => setCourtCity(e.target.value)} placeholder="Court City" />
          <input value={courtCounty} onChange={(e) => setCourtCounty(e.target.value)} placeholder="Court County" />
          <input value={courtState} onChange={(e) => setCourtState(e.target.value)} placeholder="Court State" />
          <input value={courtType} onChange={(e) => setCourtType(e.target.value)} placeholder="Court Type" />

          <h2>Plaintiff’s Attorney</h2>
          <input value={plaintiffAttorneyName} onChange={(e) => setPlaintiffAttorneyName(e.target.value)} placeholder="Name" />
          <input value={plaintiffAttorneyPhone} onChange={(e) => setPlaintiffAttorneyPhone(e.target.value)} placeholder="Phone" />
          <input value={plaintiffAttorneyAddress} onChange={(e) => setPlaintiffAttorneyAddress(e.target.value)} placeholder="Address" />

          <h2>Status & Strategy</h2>
          <label>
            <input type="checkbox" checked={lawsuitFiled} onChange={(e) => setLawsuitFiled(e.target.checked)} /> Has a lawsuit already been filed?
          </label>
          <label>
            <input type="checkbox" checked={counterclaim} onChange={(e) => setCounterclaim(e.target.checked)} /> Include Counterclaim (optional)
          </label>
          <label>
            <input type="checkbox" checked={arbitration} onChange={(e) => setArbitration(e.target.checked)} /> Arbitration clause applies
          </label>
          <label>
            <input type="checkbox" checked={debtClosure} onChange={(e) => setDebtClosure(e.target.checked)} /> 1099-C reported / debt discharged
          </label>
          <label>
            <input type="checkbox" checked={assignmentNotice} onChange={(e) => setAssignmentNotice(e.target.checked)} /> Assignment notice filed/served
          </label>
          <label>
            <input type="checkbox" checked={attorneyAuth} onChange={(e) => setAttorneyAuth(e.target.checked)} /> Attorney has written authorization from original creditor
          </label>

          <textarea
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            placeholder="Facts (optional)"
            rows={4}
          />
        </div>

        {/* Right column: Generated Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h2>Generated Documents</h2>
          <textarea
            readOnly
            value={generatedText}
            style={{
              width: "100%",
              height: "calc(100vh - 200px)",
              padding: "10px",
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigator.clipboard.writeText(generatedText)}
              style={{ padding: "8px 12px", backgroundColor: "#444", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Copy
            </button>
            <button
              onClick={() => {
                const blob = new Blob([generatedText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "CredSmash_Doc.txt";
                a.click();
              }}
              style={{ padding: "8px 12px", backgroundColor: "#444", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Download .txt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
