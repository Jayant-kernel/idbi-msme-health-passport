# IDBI Innovate 2026 - Track 03 Research Brief

## Track 03 Problem

IDBI is asking for an AI/ML-driven MSME Financial Health Card that uses alternate data such as GST, UPI, Account Aggregator, EPFO and related ecosystem signals to score MSMEs, explain risk factors, and support near-real-time credit decisions through ULI, OCEN and Account Aggregator integrations.

## Actual Ground Problem

The core issue is not only "MSMEs do not get credit." The sharper problem is:

> Many MSMEs now leave useful digital trails, but lenders still struggle to convert fragmented, consented, alternate data into a trusted, explainable, loan-ready view of business viability.

This creates a gap between what an MSME is actually doing and what a bank can confidently underwrite.

## Verified Evidence

1. Formal credit access has improved, but remains low.
   - PIB/NITI Aayog says the share of micro and small enterprises accessing credit through scheduled banks rose from 14% in 2020 to 20% in 2024.
   - It also says only 19% of MSME credit demand was formally met by FY21, leaving an estimated INR 80 lakh crore unmet.
   - Source: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2126063

2. SIDBI estimates a large addressable credit gap.
   - SIDBI's 2025 report estimates overall debt demand at about INR 92 lakh crore, addressable debt demand at about INR 64 lakh crore, formal debt supply at about INR 34 lakh crore, and an addressable MSME credit gap of about INR 30 lakh crore.
   - It attributes the gap to information asymmetry on financial/business viability and inability to offer collateral.
   - Source: https://www.sidbi.in/uploads/Understanding_Indian_MSME_sector_Progress_and_Challenges_13_05_25_Final.pdf

3. The government is already pushing digital-footprint-based MSME credit assessment.
   - In March 2025, the Ministry of Finance launched a new credit assessment model for MSMEs, based on scoring digital footprints.
   - The model explicitly mentions GST data via APIs, bank statement analysis through Account Aggregator, ITR verification, bureau fetches, fraud checks, objective decisioning, and model-based limit assessment for existing-to-bank and new-to-bank MSME borrowers.
   - This is very close to what Track 03 asks for, so our solution should position itself as an implementation layer for this direction.
   - Source: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2108812

4. ULI is becoming the national lending infrastructure layer.
   - PIB describes Unified Lending Interface as a digital public infrastructure for lending, meant to integrate technology, data and policy into a seamless platform.
   - The same release highlights rich trusted datasets from government ministries and states that can power faster, inclusive lending for underserved borrowers.
   - Source: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2139039

5. Account Aggregator is real, scaled, and directly relevant.
   - PIB says the AA framework is a secure, consent-based system for financial data sharing.
   - As of the September 2025 release, over 2.2 billion financial accounts were enabled for AA-based data sharing, with 112.34 million users having linked accounts.
   - PIB specifically states AA can unlock formal credit access, especially for MSMEs and personal lending.
   - Source: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2162953

6. SIDBI shows the digital lending opportunity is underused.
   - SIDBI reports that only about 18% of surveyed MSMEs had opted for financing through digital mode, while more than 90% accepted digital payments.
   - This is a powerful contradiction: digital payment behavior exists, but digital credit adoption is still low.
   - Source: https://www.sidbi.in/uploads/Understanding_Indian_MSME_sector_Progress_and_Challenges_13_05_25_Final.pdf

## Pain Points We Should Design For

1. Data fragmentation
   - GST, bank statements, UPI flows, EPFO, ITR, bureau, invoices and receivables sit in different places.
   - Bank officers need one normalized view, not raw dumps.

2. Lack of financial history
   - New-to-credit and new-to-bank MSMEs may have business activity but lack traditional audited financials or collateral.
   - The Financial Health Card should translate activity into viability.

3. Collateral dependence
   - SIDBI explicitly names inability to offer collateral as a credit-gap driver.
   - The prototype should show collateral-light limit assessment using cash-flow and compliance signals.

4. Weak explainability
   - Banks cannot rely on a black-box "score = 78."
   - The output should explain which signals improved or reduced the score, with audit-friendly reason codes.

5. Consent and trust friction
   - AA is consent-based, but users still need a clear, low-friction data-sharing journey.
   - The prototype should include consent status, data source status, and revocation-aware design.

6. Receivables blindness
   - Delayed payments can make a healthy MSME look cash-flow weak.
   - We should treat verified invoices, buyer quality, expected payment dates and TReDS-style receivable signals as a separate underwriting dimension.

## Strongest Solution Angle

Build a "Living MSME Financial Health Card" rather than a one-time credit score.

It should:

1. Pull consented alternate data.
2. Normalize it into comparable business signals.
3. Score the MSME across multiple dimensions.
4. Explain the reasons behind the score.
5. Recommend an eligible loan limit and repayment capacity.
6. Show what the MSME can do to improve eligibility.
7. Update when new GST, AA, UPI, EPFO or receivable data arrives.

## Suggested Score Dimensions

1. Cash Flow Stability
   - Bank statement inflows/outflows, UPI settlement patterns, monthly volatility, minimum balance stress.

2. Revenue Authenticity and Growth
   - GST turnover trend, invoice consistency, seasonality, customer concentration.

3. Compliance Reliability
   - GST filing regularity, ITR status, EPFO payment consistency, PAN/GST identity match.

4. Repayment Capacity
   - Free cash flow after operating expenses, existing EMI obligations, inferred debt-service coverage.

5. Receivables Strength
   - Pending invoices, buyer quality, payment delay history, TReDS-like discountability.

6. Risk and Fraud Signals
   - Sudden transaction spikes, circular transfers, bureau stress, mismatch across GST/bank/ITR signals.

## Prototype Narrative

For judges, the story should be:

> IDBI does not need another generic credit score. It needs a real-time, explainable MSME viability layer that converts India's digital public infrastructure into lending decisions. Our Financial Health Card uses consented AA data, GST signals, UPI/business cash flows, EPFO compliance, bureau/fraud checks and receivables intelligence to recommend credit limits for new-to-bank MSMEs while showing bank officers exactly why.

## MVP Features To Build

1. MSME onboarding and consent screen.
2. Data-source connection panel: GST, AA/bank statements, UPI, EPFO, ITR, bureau, receivables.
3. Financial Health Card with total score and score dimensions.
4. Explainability panel with top positive and negative reasons.
5. Recommended loan limit and EMI capacity.
6. Receivables-aware cash-flow adjustment.
7. Bank officer dashboard for comparison of applicants.
8. MSME improvement plan: actions for 30, 60 and 90 days.

## Claims To Avoid Unless We Verify More

1. Do not claim Reddit is a major source of Indian MSME credit pain.
2. Do not present invented personas as real case studies.
3. Do not cite a nonexistent RBI explainable-AI mandate.
4. Do not use the outdated "only 14% have formal credit" as a current number; use 20% for micro and small enterprises in 2024 from PIB/NITI.
5. Do not promise 100% automated sanction; position the tool as decision support and model-based limit assessment.

