import React from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackPanel = ({ checks, feedback, entropy }) => {
  const checkItems = [
    { key: 'length', label: '12+ Characters' },
    { key: 'uppercase', label: 'Uppercase Letters' },
    { key: 'lowercase', label: 'Lowercase Letters' },
    { key: 'numbers', label: 'Numbers' },
    { key: 'symbols', label: 'Symbols & Special' },
  ];

  return (
    <div className="space-y-6">
      {/* Entropy Info */}
      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Info size={14} className="text-cyan-400" />
          ESTIMATED ENTROPY
        </div>
        <span className="font-mono text-cyan-400 text-sm font-bold">{entropy} bits</span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-3">
        {checkItems.map((item) => (
          <div 
            key={item.key}
            className={`flex items-center gap-2 text-xs transition-colors p-2 rounded-md ${
              checks[item.key] ? 'text-green-400 bg-green-400/5' : 'text-gray-500 bg-gray-800/20'
            }`}
          >
            <CheckCircle2 size={14} className={checks[item.key] ? 'opacity-100' : 'opacity-20'} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Vulnerability Report</h4>
        <AnimatePresence mode="popLayout">
          {feedback.length > 0 ? (
            feedback.map((issue, idx) => (
              <motion.div
                key={issue.message}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex gap-3 p-3 rounded-xl border text-sm ${
                  issue.type === 'critical' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                }`}
              >
                <AlertTriangle size={18} className="shrink-0" />
                <p>{issue.message}</p>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-sm italic flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-green-500" />
              No immediate patterns detected.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FeedbackPanel;
