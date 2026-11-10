import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  INITIAL_CUSTOMERS,
  INITIAL_CALLS,
  INITIAL_CAMPAIGNS,
  DEFAULT_SETTINGS
} from '../data/mockData';

const RecoveryContext = createContext(null);

export function RecoveryProvider({ children }) {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [calls, setCalls] = useState(INITIAL_CALLS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorTargetCustomerId, setSimulatorTargetCustomerId] = useState(null);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  
  // Real-time notifications log
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-1',
      title: 'Payment Recovered',
      message: 'David Kim authorized retry. ₹21,500.00 verified by payment simulator.',
      timestamp: '15m ago',
      type: 'success',
      read: false
    },
    {
      id: 'NOTIF-2',
      title: 'DNC Opt-Out Enforced',
      message: 'Thomas Wright opted out. Phone number added to suppression list.',
      timestamp: '2h ago',
      type: 'warning',
      read: false
    },
    {
      id: 'NOTIF-3',
      title: 'Human Review Flagged',
      message: 'Priya Patel AI confidence dropped to 58%. Escalated to billing director.',
      timestamp: '4h ago',
      type: 'info',
      read: true
    }
  ]);

  // Derived KPIs adhering to strict fintech rules
  // Rule: Pending payments MUST NOT be counted as recovered.
  // Only paymentStatus === 'Recovered' counts as verified recovered.
  const kpis = useMemo(() => {
    // 1. Failed payments requiring recovery (currently failed and not opted out)
    const failedPayments = customers.filter(c => c.paymentStatus === 'Failed' && !c.optedOut);
    const failedCount = failedPayments.length;

    // 2. Amount at risk (total of currently eligible failed payments)
    const amountAtRisk = failedPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Amount recovered (only verified payments)
    const recoveredPayments = customers.filter(c => c.paymentStatus === 'Recovered');
    const amountRecovered = recoveredPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Recovery Rate (% of total cohort value recovered)
    const totalEligibleCohort = amountRecovered + amountAtRisk;
    const recoveryRate = totalEligibleCohort > 0 
      ? ((amountRecovered / totalEligibleCohort) * 100).toFixed(1) 
      : '0.0';

    return {
      failedCount,
      amountAtRisk,
      amountRecovered,
      recoveryRate,
      recoveredCount: recoveredPayments.length,
      totalCount: customers.length,
      optedOutCount: customers.filter(c => c.optedOut).length
    };
  }, [customers]);

  // Outcome distribution derived from active customer states
  const outcomeBreakdown = useMemo(() => {
    const counts = {
      recovered: 0,
      link: 0,
      callback: 0,
      declined: 0,
      human: 0,
      eligible: 0
    };

    customers.forEach(c => {
      if (c.paymentStatus === 'Recovered') {
        counts.recovered += 1;
      } else if (c.recoveryStatus === 'Link Dispatched') {
        counts.link += 1;
      } else if (c.recoveryStatus === 'Callback Scheduled') {
        counts.callback += 1;
      } else if (c.optedOut || c.recoveryStatus === 'Opted Out') {
        counts.declined += 1;
      } else if (c.recoveryStatus === 'Human Escalated') {
        counts.human += 1;
      } else {
        counts.eligible += 1;
      }
    });

    return [
      { name: 'Payment Recovered', count: counts.recovered, percentage: Math.round((counts.recovered / customers.length) * 100), color: '#10B981', border: 'border-emerald-500' },
      { name: 'Payment Link Requested', count: counts.link, percentage: Math.round((counts.link / customers.length) * 100), color: '#3B82F6', border: 'border-blue-500' },
      { name: 'Callback Scheduled', count: counts.callback, percentage: Math.round((counts.callback / customers.length) * 100), color: '#8B5CF6', border: 'border-purple-500' },
      { name: 'Declined / Opted Out', count: counts.declined, percentage: Math.round((counts.declined / customers.length) * 100), color: '#64748B', border: 'border-slate-500' },
      { name: 'Human Assistance Required', count: counts.human, percentage: Math.round((counts.human / customers.length) * 100), color: '#F59E0B', border: 'border-amber-500' }
    ];
  }, [customers]);

  // Payment simulator execution (simulates backend bank retry validation)
  const executePaymentSimulator = (customerId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCustomers(prev => prev.map(c => {
          if (c.id === customerId) {
            return {
              ...c,
              paymentStatus: 'Recovered',
              recoveryStatus: 'Recovered',
              recoveredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              recoveredMethod: 'Payment Simulator Retry',
              timeline: [
                {
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  event: `Payment Simulator: Instant e-NACH/Card retry verified successfully (₹${c.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
                },
                ...c.timeline
              ]
            };
          }
          return c;
        }));

        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          setNotifications(prev => [
            {
              id: `NOTIF-${Date.now()}`,
              title: 'Payment Simulator Success',
              message: `₹${customer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} recovered for ${customer.name} (${customer.company}).`,
              timestamp: 'Just now',
              type: 'success',
              read: false
            },
            ...prev
          ]);
        }
        resolve(true);
      }, 1200);
    });
  };

  // AI Voice Agent execution simulator
  const recordSimulatedCall = ({
    customerId,
    outcome,
    aiConfidence,
    intent,
    transcript,
    decisionLog,
    finalAction
  }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const callId = `CALL-${8800 + calls.length + 1}`;
    const newCall = {
      id: callId,
      customerId,
      customerName: customer.name,
      company: customer.company,
      phone: customer.phone,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      duration: '1m 35s',
      outcome,
      aiConfidence,
      status: outcome === 'Escalated to human' ? 'Escalated' : outcome === 'Declined' ? 'Opted Out' : 'Completed',
      intent,
      failureReason: customer.failureReason,
      finalAction,
      amount: customer.amount,
      transcript,
      decisionLog
    };

    setCalls(prev => [newCall, ...prev]);

    // Update customer status according to decision engine
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        let newPaymentStatus = c.paymentStatus;
        let newRecoveryStatus = c.recoveryStatus;
        let newOptedOut = c.optedOut;
        let newEligible = c.eligible;
        let newRecoveredAt = c.recoveredAt;
        let newRecoveredMethod = c.recoveredMethod;

        if (outcome === 'Retry requested') {
          // If customer authorized instant retry and simulator confirms
          newPaymentStatus = 'Recovered';
          newRecoveryStatus = 'Recovered';
          newEligible = false;
          newRecoveredAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
          newRecoveredMethod = 'AI Voice Instant Retry';
        } else if (outcome === 'Payment link requested') {
          newPaymentStatus = 'Failed';
          newRecoveryStatus = 'Link Dispatched';
        } else if (outcome === 'Callback requested') {
          newPaymentStatus = 'Failed';
          newRecoveryStatus = 'Callback Scheduled';
        } else if (outcome === 'Declined') {
          newPaymentStatus = 'Failed';
          newRecoveryStatus = 'Opted Out';
          newOptedOut = true;
          newEligible = false;
        } else if (outcome === 'Escalated to human') {
          newPaymentStatus = 'Failed';
          newRecoveryStatus = 'Human Escalated';
        }

        return {
          ...c,
          paymentStatus: newPaymentStatus,
          recoveryStatus: newRecoveryStatus,
          optedOut: newOptedOut,
          eligible: newEligible,
          recoveredAt: newRecoveredAt,
          recoveredMethod: newRecoveredMethod,
          attemptsCount: c.attemptsCount + 1,
          lastAttempt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          timeline: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              event: `AI Call Outcome: ${outcome} (Intent: ${intent}, Confidence: ${aiConfidence}%)`
            },
            ...c.timeline
          ]
        };
      }
      return c;
    }));

    // Trigger notification
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: `AI Call: ${customer.name}`,
        message: `${outcome} • Action: ${finalAction}`,
        timestamp: 'Just now',
        type: outcome === 'Retry requested' ? 'success' : outcome === 'Escalated to human' ? 'warning' : 'info',
        read: false
      },
      ...prev
    ]);
  };

  // Create Campaign handler
  const createCampaign = (campaignData) => {
    const newId = `CMP-10${campaigns.length + 1}`;
    const newCampaign = {
      id: newId,
      name: campaignData.name,
      createdAt: new Date().toISOString().split('T')[0],
      eligibleCustomers: campaignData.eligibleCount || 3,
      callsCompleted: 0,
      successfulRecoveries: 0,
      amountRecovered: 0,
      amountTarget: campaignData.amountTarget || 4500,
      status: 'Active',
      voiceTone: campaignData.voiceTone || 'Professional / Concierge',
      recoveryRate: '0.0%'
    };

    setCampaigns(prev => [newCampaign, ...prev]);

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Campaign Launched',
        message: `Campaign "${campaignData.name}" initialized with ${campaignData.eligibleCount || 3} customers.`,
        timestamp: 'Just now',
        type: 'info',
        read: false
      },
      ...prev
    ]);
  };

  // Toggle customer opt-out compliance
  const toggleCustomerOptOut = (customerId) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const nextOptedOut = !c.optedOut;
        return {
          ...c,
          optedOut: nextOptedOut,
          recoveryStatus: nextOptedOut ? 'Opted Out' : (c.paymentStatus === 'Recovered' ? 'Recovered' : 'Eligible'),
          eligible: !nextOptedOut && c.paymentStatus !== 'Recovered',
          timeline: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              event: nextOptedOut 
                ? 'Manual Compliance Action: Added to Do Not Call registry (Suppressed)' 
                : 'Compliance status restored: Customer opted back in'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    }));
  };

  // Send payment link manually
  const dispatchPaymentLink = (customerId) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          recoveryStatus: 'Link Dispatched',
          timeline: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              event: 'Secure tokenized payment link manually dispatched via SMS and email'
            },
            ...c.timeline
          ]
        };
      }
      return c;
    }));

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: 'Payment Link Sent',
        message: `Encrypted link dispatched to customer record.`,
        timestamp: 'Just now',
        type: 'info',
        read: false
      },
      ...prev
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <RecoveryContext.Provider
      value={{
        customers,
        calls,
        campaigns,
        settings,
        setSettings,
        searchQuery,
        setSearchQuery,
        kpis,
        outcomeBreakdown,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedCallId,
        setSelectedCallId,
        isSimulatorOpen,
        setIsSimulatorOpen,
        simulatorTargetCustomerId,
        setSimulatorTargetCustomerId,
        isCreateCampaignOpen,
        setIsCreateCampaignOpen,
        notifications,
        markAllNotificationsRead,
        executePaymentSimulator,
        recordSimulatedCall,
        createCampaign,
        toggleCustomerOptOut,
        dispatchPaymentLink
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error('useRecovery must be used within a RecoveryProvider');
  }
  return context;
}

