// Realistic Mock Data for RecoverAI
// Fictional SaaS / Enterprise recurring billing recovery data (INR ₹)

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-1001',
    name: 'Sarah Jenkins',
    company: 'Acme Analytics',
    email: 's.jenkins@acmeanalytics.io',
    phone: '+91 98201 44521',
    plan: 'Enterprise Pro (Annual)',
    amount: 14500.00,
    currency: 'INR',
    dueDate: '2026-11-04',
    invoiceId: 'INV-2026-8912',
    failureReason: 'Insufficient Funds',
    failureCode: 'ERR_INSUFFICIENT_FUNDS',
    paymentStatus: 'Failed', // 'Failed' | 'Recovered' | 'Processing'
    recoveryStatus: 'Pending Retry', // 'Pending Retry' | 'Link Dispatched' | 'Callback Scheduled' | 'Recovered' | 'Human Escalated' | 'Opted Out' | 'Eligible'
    optedOut: false,
    eligible: true,
    attemptsCount: 1,
    lastAttempt: '2026-11-09 14:22',
    notes: 'Customer notified AI that funding transfer completes on Tuesday. Retry scheduled for 10:00 AM.',
    timeline: [
      { timestamp: '2026-11-04 06:00', event: 'Recurring e-NACH/autopay debited ₹14,500.00' },
      { timestamp: '2026-11-04 09:14', event: 'Bank rejected with code ERR_INSUFFICIENT_FUNDS' },
      { timestamp: '2026-11-05 11:30', event: 'RecoverAI voice agent call placed (Duration: 1m 42s)' },
      { timestamp: '2026-11-05 11:32', event: 'Customer requested 48-hour retry window' }
    ]
  },
  {
    id: 'CUST-1002',
    name: 'Marcus Chen',
    company: 'CloudVanguard Inc.',
    email: 'm.chen@cloudvanguard.net',
    phone: '+91 98450 78210',
    plan: 'Scale Cluster Tier 3',
    amount: 38900.00,
    currency: 'INR',
    dueDate: '2026-11-06',
    invoiceId: 'INV-2026-8920',
    failureReason: 'Mandate Inactive',
    failureCode: 'ERR_MANDATE_EXPIRED',
    paymentStatus: 'Failed',
    recoveryStatus: 'Link Dispatched',
    optedOut: false,
    eligible: true,
    attemptsCount: 2,
    lastAttempt: '2026-11-08 16:05',
    notes: 'Corporate debit mandate lapsed. Customer requested direct authenticated portal link to update bank token.',
    timeline: [
      { timestamp: '2026-11-06 00:01', event: 'Scheduled debit failed: e-NACH / UPI mandate authorization expired' },
      { timestamp: '2026-11-07 10:15', event: 'RecoverAI checked eligibility: approved for voice recovery' },
      { timestamp: '2026-11-08 16:05', event: 'AI Voice agent call completed: Intent = Payment Link' },
      { timestamp: '2026-11-08 16:06', event: 'Secure one-time payment & re-mandate link sent via SMS + WhatsApp' }
    ]
  },
  {
    id: 'CUST-1003',
    name: 'Elena Rostova',
    company: 'Hyperion Dynamics',
    email: 'elena@hyperion-dyn.com',
    phone: '+91 97110 33491',
    plan: 'Team Growth',
    amount: 8200.00,
    currency: 'INR',
    dueDate: '2026-11-07',
    invoiceId: 'INV-2026-8933',
    failureReason: 'Bank Declined',
    failureCode: 'ERR_DO_NOT_HONOR',
    paymentStatus: 'Failed',
    recoveryStatus: 'Callback Scheduled',
    optedOut: false,
    eligible: true,
    attemptsCount: 1,
    lastAttempt: '2026-11-09 11:15',
    notes: 'Elena was in an executive review when AI called. Requested a callback tomorrow at 3:00 PM IST.',
    timeline: [
      { timestamp: '2026-11-07 04:30', event: 'Autopay transaction returned generic decline: 05 Do Not Honor' },
      { timestamp: '2026-11-09 11:14', event: 'RecoverAI voice agent engaged customer' },
      { timestamp: '2026-11-09 11:15', event: 'Intent recognized: Callback requested for 2026-11-11 15:00 IST' }
    ]
  },
  {
    id: 'CUST-1004',
    name: 'David Kim',
    company: 'Nexus Health Systems',
    email: 'd.kim@nexushealth.org',
    phone: '+91 99002 66712',
    plan: 'HIPAA Compliant Cloud',
    amount: 21500.00,
    currency: 'INR',
    dueDate: '2026-11-02',
    invoiceId: 'INV-2026-8890',
    failureReason: 'Payment Timeout',
    failureCode: 'ERR_GATEWAY_TIMEOUT',
    paymentStatus: 'Recovered',
    recoveryStatus: 'Recovered',
    optedOut: false,
    eligible: false, // already recovered
    attemptsCount: 1,
    lastAttempt: '2026-11-03 09:40',
    recoveredAt: '2026-11-03 09:45',
    recoveredMethod: 'AI Voice Retry Confirmation',
    notes: 'Transient gateway timeout on first run. Customer authorized immediate retry during AI call; payment cleared instantly.',
    timeline: [
      { timestamp: '2026-11-02 02:00', event: 'Payment gateway timeout during peak clearing window' },
      { timestamp: '2026-11-03 09:40', event: 'RecoverAI contacted customer to confirm retry permission' },
      { timestamp: '2026-11-03 09:42', event: 'Decision engine approved synchronous retry simulator' },
      { timestamp: '2026-11-03 09:45', event: 'Payment cleared: ₹21,500.00 verified by payment gateway simulator' }
    ]
  },
  {
    id: 'CUST-1005',
    name: 'Priya Patel',
    company: 'FinEdge Systems',
    email: 'priya.patel@finedge.co',
    phone: '+91 98190 55410',
    plan: 'Fintech Core API',
    amount: 42000.00,
    currency: 'INR',
    dueDate: '2026-11-05',
    invoiceId: 'INV-2026-8919',
    failureReason: 'Insufficient Funds',
    failureCode: 'ERR_INSUFFICIENT_FUNDS',
    paymentStatus: 'Failed',
    recoveryStatus: 'Human Escalated',
    optedOut: false,
    eligible: true,
    attemptsCount: 2,
    lastAttempt: '2026-11-08 13:20',
    notes: 'Customer disputed invoice usage charges on high-volume endpoints. AI detected ambiguous intent and flagged for human account manager.',
    timeline: [
      { timestamp: '2026-11-05 08:00', event: 'Autopay debit rejected by bank: Insufficient balance' },
      { timestamp: '2026-11-08 13:20', event: 'RecoverAI call initiated' },
      { timestamp: '2026-11-08 13:22', event: 'AI Confidence score dropped to 58% (billing dispute detected)' },
      { timestamp: '2026-11-08 13:23', event: 'Decision Engine triggered Human Escalation policy' }
    ]
  },
  {
    id: 'CUST-1006',
    name: 'Thomas Wright',
    company: 'BlueRock Media',
    email: 'twright@bluerock.io',
    phone: '+91 98860 11200',
    plan: 'Creator Studio Plus',
    amount: 6500.00,
    currency: 'INR',
    dueDate: '2026-11-03',
    invoiceId: 'INV-2026-8898',
    failureReason: 'Card Expired',
    failureCode: 'ERR_CARD_EXPIRED',
    paymentStatus: 'Failed',
    recoveryStatus: 'Opted Out',
    optedOut: true,
    eligible: false, // suppressed due to opt-out
    attemptsCount: 1,
    lastAttempt: '2026-11-04 15:10',
    notes: 'Customer explicitly asked not to be contacted via phone. Strict opt-out compliance applied. Calls blocked.',
    timeline: [
      { timestamp: '2026-11-03 01:00', event: 'Card expiration date passed on card ending 4012' },
      { timestamp: '2026-11-04 15:10', event: 'RecoverAI voice agent call connected' },
      { timestamp: '2026-11-04 15:11', event: 'Customer stated: "Please remove my number and cancel my account"' },
      { timestamp: '2026-11-04 15:11', event: 'AI identified DO_NOT_CALL intent. Number automatically blacklisted' }
    ]
  },
  {
    id: 'CUST-1007',
    name: 'Amanda Vance',
    company: 'Solace AI Labs',
    email: 'amanda@solacelabs.ai',
    phone: '+91 99200 44920',
    plan: 'GPU Compute Dedicated',
    amount: 51000.00,
    currency: 'INR',
    dueDate: '2026-11-01',
    invoiceId: 'INV-2026-8871',
    failureReason: 'Bank Declined',
    failureCode: 'ERR_FRAUD_PREVENTION_HOLD',
    paymentStatus: 'Recovered',
    recoveryStatus: 'Recovered',
    optedOut: false,
    eligible: false,
    attemptsCount: 1,
    lastAttempt: '2026-11-02 11:00',
    recoveredAt: '2026-11-02 14:15',
    recoveredMethod: 'Secure Payment Link SMS',
    notes: 'Bank had placed temporary security review for unusual amount. Customer approved in mobile banking app and paid via RecoverAI link.',
    timeline: [
      { timestamp: '2026-11-01 07:00', event: 'Payment failed due to security rule trigger on ₹50k+ threshold' },
      { timestamp: '2026-11-02 11:00', event: 'RecoverAI voice agent notified customer of bank flag' },
      { timestamp: '2026-11-02 11:03', event: 'AI delivered authenticated link upon customer request' },
      { timestamp: '2026-11-02 14:15', event: 'Customer paid ₹51,000.00 through 3D-Secure authenticated link' }
    ]
  },
  {
    id: 'CUST-1008',
    name: 'Julian Thorne',
    company: 'Stratum Logistics',
    email: 'jthorne@stratumfleet.com',
    phone: '+91 97400 88210',
    plan: 'Fleet Tracking 50x',
    amount: 19800.00,
    currency: 'INR',
    dueDate: '2026-11-08',
    invoiceId: 'INV-2026-8941',
    failureReason: 'Mandate Inactive',
    failureCode: 'ERR_MANDATE_EXPIRED',
    paymentStatus: 'Failed',
    recoveryStatus: 'Pending Retry',
    optedOut: false,
    eligible: true,
    attemptsCount: 1,
    lastAttempt: '2026-11-09 17:30',
    notes: 'Secondary bank mandate re-authorized by finance director. Scheduled for payment simulation on next cycle.',
    timeline: [
      { timestamp: '2026-11-08 03:00', event: 'Corporate debit mandate returned invalid or inactive' },
      { timestamp: '2026-11-09 17:30', event: 'AI voice agent contacted Julian Thorne' },
      { timestamp: '2026-11-09 17:33', event: 'Customer verified mandate updated with HDFC Bank; authorized retry' }
    ]
  },
  {
    id: 'CUST-1009',
    name: 'Rachel Green',
    company: 'Vertex Design Studio',
    email: 'rachel@vertexds.co',
    phone: '+91 98210 77312',
    plan: 'Design Infrastructure Pro',
    amount: 9400.00,
    currency: 'INR',
    dueDate: '2026-11-03',
    invoiceId: 'INV-2026-8894',
    failureReason: 'Payment Timeout',
    failureCode: 'ERR_GATEWAY_TIMEOUT',
    paymentStatus: 'Recovered',
    recoveryStatus: 'Recovered',
    optedOut: false,
    eligible: false,
    attemptsCount: 1,
    lastAttempt: '2026-11-04 10:20',
    recoveredAt: '2026-11-04 10:25',
    recoveredMethod: 'AI Voice Retry Confirmation',
    notes: 'Resolved automatically after network timeout. Customer confirmed payment during automated voice check.',
    timeline: [
      { timestamp: '2026-11-03 04:12', event: 'Processor connection timeout during nightly batch' },
      { timestamp: '2026-11-04 10:20', event: 'RecoverAI placed voice check' },
      { timestamp: '2026-11-04 10:25', event: 'Simulator retry succeeded with confirmation token TX_99410' }
    ]
  },
  {
    id: 'CUST-1010',
    name: 'Carlos Mendez',
    company: 'Pulse Growth Media',
    email: 'carlos@pulsegrowth.io',
    phone: '+91 99801 22390',
    plan: 'Agency Scaling Tier',
    amount: 32000.00,
    currency: 'INR',
    dueDate: '2026-11-09',
    invoiceId: 'INV-2026-8955',
    failureReason: 'Insufficient Funds',
    failureCode: 'ERR_INSUFFICIENT_FUNDS',
    paymentStatus: 'Failed',
    recoveryStatus: 'Eligible',
    optedOut: false,
    eligible: true,
    attemptsCount: 0,
    lastAttempt: null,
    notes: 'Failed 12 hours ago. Passed grace period checks and recovery eligibility engine. Ready for initial AI contact.',
    timeline: [
      { timestamp: '2026-11-09 23:45', event: 'Autopay debit failed with Insufficient Funds (R01)' },
      { timestamp: '2026-11-10 02:00', event: 'Ingested by RecoverAI: verified clean DNC history' },
      { timestamp: '2026-11-10 08:00', event: 'Queued in morning recovery dispatch queue' }
    ]
  }
];

export const INITIAL_CALLS = [
  {
    id: 'CALL-8801',
    customerId: 'CUST-1004',
    customerName: 'David Kim',
    company: 'Nexus Health Systems',
    phone: '+91 99002 66712',
    timestamp: '2026-11-03 09:40',
    duration: '1m 24s',
    outcome: 'Retry requested',
    aiConfidence: 98,
    status: 'Completed',
    intent: 'AUTHORIZE_RETRY',
    failureReason: 'Payment Timeout',
    finalAction: 'Immediate Payment Simulator Retry',
    amount: 21500.00,
    transcript: [
      { speaker: 'AI', text: "Hello David, this is RecoverAI calling on behalf of Nexus Health Systems' cloud infrastructure service. I'm reaching out because your scheduled autopay of ₹21,500.00 on November 2nd encountered a momentary network timeout from your bank." },
      { speaker: 'Customer', text: "Oh hey! Yeah, I noticed an SMS saying it didn't go through. Is everything okay with the account?" },
      { speaker: 'AI', text: "Everything is in good standing. It was just a temporary gateway delay. If you'd like, I can submit an instant payment retry right now using your existing authorized card ending in 4920." },
      { speaker: 'Customer', text: "Yes please, go ahead and run it right now." },
      { speaker: 'AI', text: "Perfect. Submitting the retry request to our payment simulator now... Confirmed! The payment was approved and your tax invoice has been emailed. Thank you for choosing us, David. Have a great day!" },
      { speaker: 'Customer', text: "Awesome, thank you!" }
    ],
    decisionLog: [
      { step: 'NLP Parse', result: 'Intent = AUTHORIZE_RETRY (Confidence 0.98)' },
      { step: 'Eligibility Check', result: 'No active chargebacks; valid card token on file' },
      { step: 'Execution', result: 'Dispatched synchronous retry to Payment Simulator' },
      { step: 'Verification', result: 'Simulator returned HTTP 200 SUCCESS (Ref: TX-984421)' }
    ]
  },
  {
    id: 'CALL-8802',
    customerId: 'CUST-1007',
    customerName: 'Amanda Vance',
    company: 'Solace AI Labs',
    phone: '+91 99200 44920',
    timestamp: '2026-11-02 11:00',
    duration: '2m 10s',
    outcome: 'Payment link requested',
    aiConfidence: 95,
    status: 'Completed',
    intent: 'REQUEST_PAYMENT_LINK',
    failureReason: 'Bank Declined',
    finalAction: 'Secure Tokenized Link Dispatched',
    amount: 51000.00,
    transcript: [
      { speaker: 'AI', text: "Hello Amanda, I'm calling from Solace AI Labs regarding your recent monthly GPU compute subscription invoice of ₹51,000.00." },
      { speaker: 'Customer', text: "Yes, our corporate card was temporarily held for security review on large transfers." },
      { speaker: 'AI', text: "Understood. Would you prefer we schedule a retry for a specific day, or would you like me to send a direct, secure payment link so you can complete it once your bank clears the hold?" },
      { speaker: 'Customer', text: "Please send me a payment link to my work email and phone. I'll authorize it as soon as the bank fraud team calls back." },
      { speaker: 'AI', text: "Certainly. I have generated a time-sensitive, 256-bit encrypted payment link and sent it via SMS to this number and to amanda@solacelabs.ai. You will have 72 hours to finalize the payment." },
      { speaker: 'Customer', text: "Great, I see the text coming in now. Thanks!" }
    ],
    decisionLog: [
      { step: 'NLP Parse', result: 'Intent = REQUEST_PAYMENT_LINK (Confidence 0.95)' },
      { step: 'Security Filter', result: 'Verified primary contact matches billing record' },
      { step: 'Token Generation', result: 'Created single-use payment session payload' },
      { step: 'Delivery', result: 'Multi-channel SMS + Email dispatch verified' }
    ]
  },
  {
    id: 'CALL-8803',
    customerId: 'CUST-1001',
    customerName: 'Sarah Jenkins',
    company: 'Acme Analytics',
    phone: '+91 98201 44521',
    timestamp: '2026-11-05 11:30',
    duration: '1m 42s',
    outcome: 'Retry requested',
    aiConfidence: 92,
    status: 'Completed',
    intent: 'SCHEDULE_RETRY_WINDOW',
    failureReason: 'Insufficient Funds',
    finalAction: 'Retry Queued for Tuesday 10:00 AM',
    amount: 14500.00,
    transcript: [
      { speaker: 'AI', text: "Hi Sarah, this is RecoverAI reaching out regarding your Acme Analytics subscription renewal of ₹14,500.00 that was due on November 4th." },
      { speaker: 'Customer', text: "Hi. Yes, our operating account was low while waiting for a client NEFT transfer. It should land by Tuesday morning." },
      { speaker: 'AI', text: "Got it. I can hold further alerts and program our automated recovery engine to retry your autopay on Tuesday at 10:00 AM. Does that work for you?" },
      { speaker: 'Customer', text: "Yes, that would be ideal. Tuesday morning is safe." },
      { speaker: 'AI', text: "Consider it scheduled. Your services will remain fully active with zero interruption. Have a wonderful week!" }
    ],
    decisionLog: [
      { step: 'NLP Parse', result: 'Intent = SCHEDULE_RETRY_WINDOW (Confidence 0.92)' },
      { step: 'Policy Engine', result: 'Requested delay of 4 days is within max grace limit (7 days)' },
      { step: 'Scheduler', result: 'Job queued for 2026-11-11 10:00:00 UTC' }
    ]
  },
  {
    id: 'CALL-8804',
    customerId: 'CUST-1003',
    customerName: 'Elena Rostova',
    company: 'Hyperion Dynamics',
    phone: '+91 97110 33491',
    timestamp: '2026-11-09 11:15',
    duration: '0m 48s',
    outcome: 'Callback requested',
    aiConfidence: 94,
    status: 'Completed',
    intent: 'REQUEST_CALLBACK',
    failureReason: 'Bank Declined',
    finalAction: 'Voice Agent Callback Scheduled',
    amount: 8200.00,
    transcript: [
      { speaker: 'AI', text: "Good morning Elena, this is RecoverAI with an update regarding your Hyperion Dynamics subscription." },
      { speaker: 'Customer', text: "I'm walking into an urgent executive briefing right now. Can you call me back tomorrow afternoon around 3?" },
      { speaker: 'AI', text: "Of course. I will reschedule our call for tomorrow at 3:00 PM IST. Good luck with your briefing!" },
      { speaker: 'Customer', text: "Thank you, talk then." }
    ],
    decisionLog: [
      { step: 'NLP Parse', result: 'Intent = REQUEST_CALLBACK (Confidence 0.94)' },
      { step: 'Calendar Check', result: 'Slot 2026-11-11 15:00 IST registered in call queue' }
    ]
  },
  {
    id: 'CALL-8805',
    customerId: 'CUST-1005',
    customerName: 'Priya Patel',
    company: 'FinEdge Systems',
    phone: '+91 98190 55410',
    timestamp: '2026-11-08 13:20',
    duration: '2m 45s',
    outcome: 'Escalated to human',
    aiConfidence: 58,
    status: 'Escalated',
    intent: 'BILLING_DISPUTE_DETECTED',
    failureReason: 'Insufficient Funds',
    finalAction: 'Handed off to Senior Accounts Representative',
    amount: 42000.00,
    transcript: [
      { speaker: 'AI', text: "Hello Priya, I am RecoverAI calling regarding your FinEdge API tier renewal of ₹42,000.00." },
      { speaker: 'Customer', text: "Wait, why is it ₹42,000? Our agreement stated ₹30,000 base plus overage capped at ₹5,000. This is overbilled by ₹7,000!" },
      { speaker: 'AI', text: "I see that you have questions regarding the usage metering calculation for last month's tier." },
      { speaker: 'Customer', text: "I'm not authorizing any payment until an account manager reviews the raw query logs with me." },
      { speaker: 'AI', text: "I completely understand. Because this involves a contract discrepancy, I am immediately routing your ticket to your dedicated customer success director, Mark Vance, along with your request for query logs. He will follow up via email within two hours." },
      { speaker: 'Customer', text: "Alright, that works." }
    ],
    decisionLog: [
      { step: 'NLP Parse', result: 'Intent = BILLING_DISPUTE_DETECTED (Confidence 0.58)' },
      { step: 'Threshold Check', result: 'Confidence < 75% triggers safety escalation protocol' },
      { step: 'Escalation', result: 'CRM Ticket #DISP-9902 created and assigned to Human Rep' }
    ]
  },
  {
    id: 'CALL-8806',
    customerId: 'CUST-1006',
    customerName: 'Thomas Wright',
    company: 'BlueRock Media',
    phone: '+91 98860 11200',
    timestamp: '2026-11-04 15:10',
    duration: '0m 35s',
    outcome: 'Declined',
    aiConfidence: 99,
    status: 'Opted Out',
    intent: 'DO_NOT_CALL_AND_CANCEL',
    failureReason: 'Card Expired',
    finalAction: 'Opted Out & Added to DNC Registry',
    amount: 6500.00,
    transcript: [
      { speaker: 'AI', text: "Hello Thomas, this is RecoverAI regarding your BlueRock Media membership autopay of ₹6,500.00." },
      { speaker: 'Customer', text: "Stop calling me. Take my phone number off your system immediately and cancel my plan." },
      { speaker: 'AI', text: "I have recorded your request immediately. Your phone number has been placed on our Do Not Call list and no further recovery calls will be made. Have a good day." }
    ],
    decisionLog: [
      { step: 'NLP Parse', result: 'Intent = DO_NOT_CALL_AND_CANCEL (Confidence 0.99)' },
      { step: 'Compliance Action', result: 'Enforced instant suppression list entry (DNC ID: #OPT-419)' },
      { step: 'State Update', result: 'Account marked as Suppressed / Opted Out' }
    ]
  }
];

export const INITIAL_CAMPAIGNS = [
  {
    id: 'CMP-101',
    name: 'High-Value Invoices (> ₹20,000)',
    createdAt: '2026-11-01',
    eligibleCustomers: 4,
    callsCompleted: 4,
    successfulRecoveries: 2,
    amountRecovered: 72500.00,
    amountTarget: 145400.00,
    status: 'Active',
    voiceTone: 'Professional / Concierge',
    recoveryRate: '50.0%'
  },
  {
    id: 'CMP-102',
    name: 'Mid-Tier Autopay Re-engagement',
    createdAt: '2026-11-03',
    eligibleCustomers: 4,
    callsCompleted: 3,
    successfulRecoveries: 1,
    amountRecovered: 9400.00,
    amountTarget: 48900.00,
    status: 'Active',
    voiceTone: 'Friendly / Supportive',
    recoveryRate: '25.0%'
  },
  {
    id: 'CMP-103',
    name: 'Expired Mandate Recovery Sweep',
    createdAt: '2026-10-25',
    eligibleCustomers: 6,
    callsCompleted: 6,
    successfulRecoveries: 4,
    amountRecovered: 64800.00,
    amountTarget: 89000.00,
    status: 'Completed',
    voiceTone: 'Informative / Direct',
    recoveryRate: '66.7%'
  }
];

export const RECOVERY_PERFORMANCE_HISTORY = [
  { date: 'Nov 04', recovered: 21500, atRisk: 124000 },
  { date: 'Nov 05', recovered: 30900, atRisk: 141000 },
  { date: 'Nov 06', recovered: 42000, atRisk: 168000 },
  { date: 'Nov 07', recovered: 51000, atRisk: 194000 },
  { date: 'Nov 08', recovered: 68000, atRisk: 221000 },
  { date: 'Nov 09', recovered: 72500, atRisk: 236000 },
  { date: 'Nov 10', recovered: 81900, atRisk: 244600 }
];

export const OUTCOME_BREAKDOWN = [
  { name: 'Payment Recovered', value: 3, percentage: '30%', color: '#10B981' },
  { name: 'Payment Link Requested', value: 2, percentage: '20%', color: '#3B82F6' },
  { name: 'Callback Scheduled', value: 2, percentage: '20%', color: '#8B5CF6' },
  { name: 'Declined / Opt-out', value: 1, percentage: '10%', color: '#64748B' },
  { name: 'Human Assistance Required', value: 2, percentage: '20%', color: '#F59E0B' }
];

export const FAILURE_REASON_STATS = [
  { reason: 'Insufficient Funds', count: 4, share: '40%', recoveredCount: 1 },
  { reason: 'Bank Declined', count: 2, share: '20%', recoveredCount: 1 },
  { reason: 'Mandate Inactive', count: 2, share: '20%', recoveredCount: 0 },
  { reason: 'Payment Timeout', count: 2, share: '20%', recoveredCount: 2 }
];

export const DEFAULT_SETTINGS = {
  voiceTone: 'Professional & Empathetic',
  agentName: 'Aria (RecoverAI)',
  maxAttempts: 3,
  retryDelayHours: 24,
  callingWindowStart: '09:00',
  callingWindowEnd: '18:00',
  weekendCalling: false,
  autoOptOutKeywords: 'stop, unsubscribe, do not call, cancel, lawyer, don\'t call',
  minInvoiceThreshold: 500.00,
  gracePeriodDays: 2,
  humanEscalationThreshold: 75, // Below 75% confidence routes to human
  autoSmsPaymentLink: true,
  strictDncEnforcement: true
};
