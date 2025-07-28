// src/components/ui/StatCard.js
import React from 'react';
import '../../styles/StatCard.css';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon, color }) => {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`stat-icon ${color}`}>
        {icon} {/* ✅ Render icon directly */}
      </div>
      <div className="stat-info">
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
