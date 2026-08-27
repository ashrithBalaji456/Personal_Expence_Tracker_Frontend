import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw, Key, Coins, Activity, Compass, TrendingDown, TrendingUp, Calendar, ShieldAlert, GraduationCap, Heart, PiggyBank, LineChart, Briefcase, Home, Zap, Smile, AlertTriangle, FileText, Users, Target, Clock } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import toast from '../components/ui/Toast';

export const AiAdvisor = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your Gemini AI Financial Advisor. I have loaded your current budget limits, income details, and transaction history for this month.\n\nAsk me anything! For example: \n* *'How can I save more money?'*\n* *'Analyze my spending trends this month'* \n* *'Am I on track to meet my savings goal?'*",
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAiActive, setIsAiActive] = useState(true);
  const chatContainerRef = useRef(null);

  const [aiTips, setAiTips] = useState([
    "Your spending targets are dynamically synced based on your monthly salary.",
    "Keep housing costs below 30% of your net income to ensure wealth preservation.",
    "Automatic SIP contributions ensure you consistently build long-term wealth.",
    "Maintaining a liquid emergency fund of 3-6 months of expenses is recommended.",
    "Ensure your term insurance cover is at least 10x your annual income."
  ]);

  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const fetchDynamicAlerts = async () => {
      try {
        const res = await trackerApi.getAiPredictiveAlerts();
        if (res && res.length > 0 && !res[0].includes("Gemini API Key is not configured")) {
          setAiTips(res);
        }
      } catch (err) {
        // Use fallbacks
      }
    };
    fetchDynamicAlerts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % aiTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [aiTips.length]);

  const suggestedPrompts = [
    "Suggest budget adjustments",
    "Analyze my spending this month",
    "Where can I save more money?",
    "Am I on track to save this month?"
  ];

  const bigSuggestedPrompts = [
    {
      title: "Optimize Budget Limits",
      desc: "Suggest adjustments to my category allocation targets",
      prompt: "Suggest budget adjustments",
      icon: Coins,
      textColor: "text-brand-violet"
    },
    {
      title: "Analyze Spending Habits",
      desc: "Scan this month's expenses and flag spending trends",
      prompt: "Analyze my spending this month",
      icon: Activity,
      textColor: "text-brand-cyan"
    },
    {
      title: "Locate Saving Hotspots",
      desc: "Analyze categories where I can cut down and save money",
      prompt: "Where can I save more money?",
      icon: Compass,
      textColor: "text-emerald-400"
    },
    {
      title: "Savings Goal Forecast",
      desc: "Check if I am on track to meet my goal this month",
      prompt: "Am I on track to save this month?",
      icon: Sparkles,
      textColor: "text-pink-400"
    },
    {
      title: "Debt Reduction Plan",
      desc: "Plan snowballs or avalanches to eliminate liabilities",
      prompt: "Suggest a strategy to pay off my debts quickly",
      icon: AlertTriangle,
      textColor: "text-rose-400"
    },
    {
      title: "Emergency Fund Setup",
      desc: "Calculate ideal reserve thresholds for rainy days",
      prompt: "How should I structure my emergency fund?",
      icon: ShieldAlert,
      textColor: "text-amber-400"
    },
    {
      title: "Retirement Goal Math",
      desc: "Estimate retirement needs based on spending rates",
      prompt: "Analyze my retirement savings goals",
      icon: Clock,
      textColor: "text-indigo-400"
    },
    {
      title: "Tax Saving Options",
      desc: "Maximize deductions under active tax brackets",
      prompt: "Suggest tax-saving investment options",
      icon: FileText,
      textColor: "text-sky-400"
    },
    {
      title: "Asset Allocation Review",
      desc: "Balance risk-reward ratios for growth portfolios",
      prompt: "Review my investment and asset allocation options",
      icon: LineChart,
      textColor: "text-teal-400"
    },
    {
      title: "SIP Target Setting",
      desc: "Automate investing to reach compound goals",
      prompt: "Help me set an ideal monthly SIP target",
      icon: PiggyBank,
      textColor: "text-emerald-300"
    },
    {
      title: "Housing Overheads Check",
      desc: "Compare housing overheads against the 30% rule",
      prompt: "Are my rent or mortgage costs balanced?",
      icon: Home,
      textColor: "text-orange-400"
    },
    {
      title: "Subscription Cleanup",
      desc: "Detect and flag redundant ongoing service bills",
      prompt: "Audit my subscription and utility expenses",
      icon: Zap,
      textColor: "text-yellow-400"
    },
    {
      title: "Entertainment Cap",
      desc: "Balance fun allocations without hurting targets",
      prompt: "Optimize my entertainment and dining budget",
      icon: Smile,
      textColor: "text-fuchsia-400"
    },
    {
      title: "Income Stream Multipliers",
      desc: "Explore side hustles and passive income assets",
      prompt: "How can I build multiple streams of income?",
      icon: Briefcase,
      textColor: "text-violet-400"
    },
    {
      title: "Family Support Budget",
      desc: "Optimize fixed recurring allocations for dependants",
      prompt: "Budget for family and parents support",
      icon: Users,
      textColor: "text-blue-400"
    },
    {
      title: "Short-Term Goal Fund",
      desc: "Fund vacations, devices, or cars in 1-2 years",
      prompt: "Help me budget for a short-term savings goal",
      icon: Target,
      textColor: "text-pink-500"
    },
    {
      title: "Healthcare Backup",
      desc: "Secure coverage against rising healthcare costs",
      prompt: "How can I budget for medical emergencies?",
      icon: Heart,
      textColor: "text-rose-500"
    },
    {
      title: "Education savings Plan",
      desc: "Model savings for college or certification fees",
      prompt: "Help me budget for higher education planning",
      icon: GraduationCap,
      textColor: "text-cyan-400"
    },
    {
      title: "Curb Impulse Spends",
      desc: "Apply the 48-hour rule to curb emotional buying",
      prompt: "Suggest rules to control emotional impulse shopping",
      icon: TrendingDown,
      textColor: "text-red-400"
    },
    {
      title: "Beat Inflation Strategy",
      desc: "Beat inflation using equities, gold, or yields",
      prompt: "How can I protect my savings from inflation?",
      icon: TrendingUp,
      textColor: "text-emerald-400"
    }
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await trackerApi.sendAiChatMessage(textToSend);
      setIsAiActive(res.active);
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Failed to get response from AI advisor.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedAlert = (text) => {
    if (typeof text !== 'string') return text;
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-white">{part}</strong>;
      }
      return part;
    });
  };

  const parseMarkdown = (text) => {
    const lines = text.split('\n');
    const elements = [];
    
    let inList = false;
    let currentListItems = [];
    
    let inTable = false;
    let tableHeaders = null;
    let tableRows = [];

    const flushList = (key) => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-5 mb-3 space-y-1 text-slate-300 text-xs">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
      }
      inList = false;
    };

    const flushTable = (key) => {
      if (tableHeaders || tableRows.length > 0) {
        elements.push(
          <div key={`table-container-${key}`} className="overflow-x-auto my-3 border border-white/5 rounded-xl">
            <table className="min-w-full divide-y divide-white/5 text-[10px] sm:text-xs">
              {tableHeaders && (
                <thead className="bg-slate-900/60">
                  <tr>
                    {tableHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-black text-slate-300 border-b border-white/5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-white/5 bg-slate-800/10">
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-white/5 transition-colors">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-slate-300 font-medium">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = null;
        tableRows = [];
      }
      inTable = false;
    };

    const formatInline = (str) => {
      let html = str;
      // Handle bold **text**
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle bold *text* (single star fallback)
      html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      // Handle inline code `code`
      html = html.replace(/`(.*?)`/g, '<code class="bg-slate-900/80 px-1 py-0.5 rounded text-[10px] text-pink-300 font-mono">$1</code>');
      return html;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for table line
      if (line.startsWith('|')) {
        flushList(i);
        inTable = true;
        
        // Parse cell content
        const cells = line.split('|')
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1); // remove empty outer cells

        // Skip divider rows e.g. |---|---|
        const isDivider = cells.every(c => c.match(/^:?-+:?$/));
        if (!isDivider) {
          if (!tableHeaders) {
            tableHeaders = cells;
          } else {
            tableRows.push(cells);
          }
        }
        continue;
      } else if (inTable) {
        flushTable(i);
      }

      // Check for list items
      if ((line.startsWith('-') && !line.startsWith('---')) || (line.startsWith('*') && !line.startsWith('**'))) {
        inList = true;
        const itemText = line.substring(1).trim();
        currentListItems.push(
          <li key={`li-${i}`} dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
        );
        continue;
      } else if (inList) {
        flushList(i);
      }

      // Check for headers
      if (line.startsWith('### ')) {
        const text = line.substring(4).trim();
        elements.push(
          <h4 key={i} className="text-xs sm:text-sm font-black text-brand-cyan mt-3 mb-1.5" dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        );
      } else if (line.startsWith('## ')) {
        const text = line.substring(3).trim();
        elements.push(
          <h3 key={i} className="text-sm sm:text-base font-black text-white mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        );
      } else if (line.startsWith('# ')) {
        const text = line.substring(2).trim();
        elements.push(
          <h2 key={i} className="text-base sm:text-lg font-black text-white mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        );
      } else if (line === '') {
        // empty paragraph spacing
        elements.push(<div key={i} className="h-2" />);
      } else {
        // normal paragraph
        elements.push(
          <p key={i} className="text-xs text-slate-300 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      }
    }

    // Flush any remaining active groups
    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto h-[calc(100vh-105px)] md:h-[calc(100vh-135px)] flex flex-col md:flex-row gap-6 p-1"
    >
      {/* Left Sidebar / Action Panel */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
        {/* Advisor Details Card */}
        <div className="glass-card rounded-3xl p-5 border border-white/5 bg-gradient-to-b from-[#1E293B]/90 to-[#0F172A]/90 relative overflow-hidden flex flex-col justify-between h-auto md:h-[220px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Advisor Core</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 shadow-glow-emerald">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Gemini Active
              </div>
            </div>

            <h3 className="text-base font-black text-white leading-tight">
              Personal AI Consultant
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Your financial consultant analyzes budget targets, actual category spending, and monthly savings capacity to deliver actionable strategies.
            </p>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3 flex items-center justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1">🛡️ Secure Context</span>
            <span>v1.2.0</span>
          </div>
        </div>

        {/* Suggested Prompts Column - Hidden on Mobile if chat has messages, or displayed as big grid */}
        <div className="hidden md:flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Instant Consultations</span>
          
          {bigSuggestedPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.prompt)}
                disabled={loading || !isAiActive}
                className="w-full text-left glass-card rounded-2xl p-2.5 border border-white/5 bg-[#1E293B]/40 hover:bg-[#1E293B]/70 hover:border-brand-violet/30 transition-all duration-300 flex items-start gap-3 group relative cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${p.textColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">{p.title}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Financial Insights Rotating Banner */}
        <div className="hidden md:block glass-card rounded-3xl p-4 border border-brand-violet/10 bg-gradient-to-r from-brand-violet/5 via-[#1E293B]/50 to-[#0F172A]/50 relative overflow-hidden shrink-0 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-1.5 text-brand-cyan">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Advisor Insight</span>
          </div>

          <div className="h-[50px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-[9px] sm:text-[10px] text-slate-300 leading-relaxed font-semibold"
              >
                {renderFormattedAlert(aiTips[tipIdx])}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="flex gap-1 mt-2.5 justify-center">
            {aiTips.map((_, i) => (
              <span 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === tipIdx ? 'w-4 bg-brand-cyan' : 'w-1 bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Chatbot Workspace */}
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-[#1E293B]/40 to-[#0F172A]/40 border border-white/5 rounded-3xl overflow-hidden p-4 sm:p-5 relative shadow-2xl">
        {/* Chat Feed Header */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4 shrink-0">
          <MessageSquare className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-black text-white uppercase tracking-wider">Chat Console</span>
        </div>

        {/* Message Container */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-3xl px-4 py-3 border relative shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-violet to-indigo-600 border-brand-violet/20 text-white rounded-tr-none'
                      : 'bg-[#1E293B]/80 border-white/5 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.sender === 'user' ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        {parseMarkdown(msg.text)}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[8px] text-slate-400/80 block text-right mt-2 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-[#1E293B]/80 border border-white/5 rounded-3xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-lg">
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {/* Ref scroll container target */}
        </div>

        {/* Mobile Prompt Selector Cards (shown horizontally on mobile/tablet) */}
        {!loading && isAiActive && (
          <div className="flex md:hidden gap-3 overflow-x-auto my-3 pb-2 shrink-0 scrollbar-none">
            {bigSuggestedPrompts.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p.prompt)}
                  className="glass-card rounded-2xl p-3 border border-white/5 bg-[#1E293B]/85 hover:bg-[#1E293B] shrink-0 w-64 text-left cursor-pointer transition-all active:scale-98"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center ${p.textColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{p.title}</h4>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-normal line-clamp-1">{p.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* API Key Missing Setup Guide Warning Card */}
        {!isAiActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-4 border border-rose-500/20 bg-rose-500/5 my-3 shrink-0 flex items-start gap-3.5 shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
              <Key className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-rose-300">Missing Gemini API Key Configuration</h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                To unlock full AI Financial Advisory features, please obtain a Gemini API key from the Google AI Studio and configure it in your backend environment variables or <code className="bg-slate-900 px-1 py-0.5 rounded text-[9px] text-rose-200">application.properties</code>:
              </p>
              <pre className="bg-slate-950/80 rounded-lg p-2.5 mt-2 text-[9px] text-slate-300 overflow-x-auto border border-white/5 leading-normal">
                {"# Option A: In application.properties\ngemini.api.key=YOUR_API_KEY_HERE\n\n# Option B: Set Environment Variable\nGEMINI_API_KEY=YOUR_API_KEY_HERE"}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Text Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center gap-2.5 mt-3 shrink-0"
        >
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isAiActive ? "Ask your financial advisor about your budgets..." : "AI Adviser offline - Configure key to start chat"}
              disabled={loading || !isAiActive}
              className="w-full glass-input rounded-2xl pl-5 pr-12 py-3.5 text-xs font-semibold focus:outline-none placeholder-slate-500 focus:border-brand-violet/40 transition-colors shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputValue.trim() || !isAiActive}
            className="w-12 h-12 bg-brand-violet hover:bg-brand-violet/90 disabled:opacity-40 rounded-2xl flex items-center justify-center text-white transition-all shadow-glow-violet shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
export default AiAdvisor;
