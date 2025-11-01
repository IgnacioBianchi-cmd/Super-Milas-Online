// frontend/src/components/common/PlaceholderView.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const PlaceholderView = ({ title }) => (
  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
      <Clock size={48} className="text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-600">Esta sección está en desarrollo</p>
  </div>
);

export default PlaceholderView;