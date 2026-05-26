import React from 'react';
import { motion } from 'framer-motion';

const StrengthMeter = ({ score, strength }) => {
  const getGradient = () => {
    if (score < 30) return 'linear-gradient(90deg, #ef4444 0%, #991b1b 100%)';
    if (score < 60) return 'linear-gradient(90deg, #f59e0b 0%, #b45309 100%)';
    return 'linear-gradient(90deg, #10b981 0%, #064e3b 100%)';
  };

  const getLabelColor = () => {
    if (score < 30) return '#ef4444';
    if (score < 60) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">
          Strength Score
        </span>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={strength}
          className="text-lg font-bold"
          style={{ color: getLabelColor() }}
        >
          {strength.toUpperCase()}
        </motion.span>
      </div>
      
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{ background: getGradient() }}
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-gray-600 font-mono">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default StrengthMeter;
