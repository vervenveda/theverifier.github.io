/* The Verifier · Editorial Evidence Registry · v1.0.0
   Public, article-specific corrections/evidence notes. Historical article text
   remains preserved; material corrections are displayed alongside it. */
(() => {
  "use strict";

  const records = [
    {
      id: "foreign-politics-2026-01-03-quiet-consensus",
      title: "The Quiet Consensus No One Voted For",
      published: "2026-01-03",
      correctionDate: "2026-08-22",
      status: "CORRECTION ISSUED · EVIDENCE ADDED · FRAMING REVISED",
      heading: "Correction & Evidence Addendum",
      summary:
        "This January 3, 2026 editorial argued that U.S. policy toward Israel is unusually insulated from political challenge. The argument remains identifiable as opinion, but several categorical factual assertions in the original text were broader than the evidence presented. This addendum corrects those assertions while preserving the historical article.",
      corrections: [
        {
          label: "Criminal allegations withdrawn as factual claims",
          text:
            "The original used the terms “criminal,” “bribery,” and “blackmail” without presenting evidence sufficient to establish those crimes. Those words should not be read as factual findings. Public Federal Election Commission records do document substantial, lawful and disclosed campaign-finance activity by AIPAC PAC and the United Democracy Project. Political spending, lobbying, donor pressure, criticism, and electoral opposition can be analyzed or criticized without being labeled criminal unless evidence establishes a specific offense."
        },
        {
          label: "Public opinion was overstated",
          text:
            "The statement that U.S. public opinion was simply “against supporting Israel” was too categorical. Pew’s September 2025 survey found 56% of U.S. adults viewed the Israeli people favorably while 59% viewed the Israeli government unfavorably. By May 2026, Pew found favorable views of the Israeli people at 52% and favorable views of the Israeli government at 32%, with large age and partisan differences. Gallup in February 2026 found 41% sympathized more with Palestinians and 36% with Israelis, a five-point difference that Gallup said was not statistically significant. The defensible conclusion is that U.S. opinion shifted substantially and became more divided and more critical of the Israeli government—not that Americans uniformly rejected Israel or aid policy."
        },
        {
          label: "Statehood language corrected",
          text:
            "The phrase calling Israel a “false state” should be understood as political rhetoric, not a factual description of international status. Israel was admitted to United Nations membership by General Assembly Resolution 273 (III) on May 11, 1949. Historical, legal, ethical, and political arguments about the creation of Israel, Palestinian dispossession, occupation, borders, settlements, or present government policy remain subjects for evidence-based debate, but the state’s UN membership is a matter of record."
        },
        {
          label: "People, government, ideology, and organizations must remain distinct",
          text:
            "Criticism of the Israeli government, particular military operations, U.S. military aid, AIPAC, other advocacy organizations, or Zionism as a political ideology should not be generalized to Israeli people, Jewish people, or any population as a whole. The Verifier’s human-dignity standard requires criticism to identify the actor, institution, policy, ideology, or conduct being evaluated."
        },
        {
          label: "International-crime claims require attribution",
          text:
            "Claims that conduct constitutes genocide, war crimes, crimes against humanity, or other international crimes should identify the court, prosecutor, commission, investigative body, or other source making the allegation and clarify whether the legal question is alleged, under investigation, subject to a warrant or proceeding, or finally adjudicated. The editorial may argue a moral or political conclusion, but the legal status must be described precisely."
        }
      ],
      sources: [
        {
          label: "FEC — AIPAC PAC committee overview",
          url: "https://www.fec.gov/data/committee/C00797670/?tab=summary",
          note: "Federal Election Commission records for AIPAC PAC, including receipts and disbursements."
        },
        {
          label: "FEC — United Democracy Project committee overview",
          url: "https://www.fec.gov/data/committee/C00799031/",
          note: "Federal Election Commission records identifying UDP as an independent-expenditure-only Super PAC and reporting its financial activity."
        },
        {
          label: "Pew Research Center — October 3, 2025",
          url: "https://www.pewresearch.org/politics/2025/10/03/americans-views-of-israelis-palestinians-and-their-political-leadership/",
          note: "Dated U.S. views of Israeli people, Palestinian people, Israeli government, Palestinian Authority, and Hamas."
        },
        {
          label: "Pew Research Center — July 9, 2026",
          url: "https://www.pewresearch.org/short-reads/2026/07/09/americans-views-of-israelis-have-grown-increasingly-negative-but-views-of-palestinians-have-held-fairly-steady/",
          note: "May 2026 survey showing continued shifts and significant partisan/age differences."
        },
        {
          label: "Gallup — February 27, 2026",
          url: "https://news.gallup.com/poll/702440/israelis-no-longer-ahead-americans-middle-east-sympathies.aspx",
          note: "Middle East sympathy measure; Gallup notes the 41%-36% difference was not statistically significant."
        },
        {
          label: "United Nations — Resolution 273 (III)",
          url: "https://digitallibrary.un.org/record/671023?ln=en",
          note: "UN record of Israel’s admission to membership on May 11, 1949."
        }
      ],
      editorialNote:
        "The original article remains visible as part of the publication record. This addendum controls where the original makes the corrected factual assertions above. The broader argument about lobbying, military aid, political incentives, U.S. foreign policy, Zionism, or Israeli government conduct remains editorial opinion and should be evaluated against evidence."
    }
  ];

  const byTitle = new Map(records.map(record => [record.title.trim().toLowerCase(), record]));

  window.VerifierEditorialEvidence = Object.freeze({
    version: "1.0.0",
    records: Object.freeze(records),
    findByTitle(title) {
      return byTitle.get(String(title || "").trim().toLowerCase()) || null;
    }
  });
})();
