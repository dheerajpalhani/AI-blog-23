import React from 'react';

const SkeletonCard = ({ variant = 'card' }) => {
  if (variant === 'details') {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        {/* Banner image block */}
        <div className="w-full h-64 md:h-96 rounded-2xl skeleton" />

        {/* Category tag */}
        <div className="w-24 h-4 rounded skeleton" />

        {/* Title */}
        <div className="w-3/4 h-8 md:h-12 rounded skeleton" />

        {/* Author row */}
        <div className="flex items-center gap-4 py-4 border-y border-slate-800/40">
          <div className="w-12 h-12 rounded-full skeleton" />
          <div className="space-y-2">
            <div className="w-32 h-4 rounded skeleton" />
            <div className="w-20 h-3 rounded skeleton" />
          </div>
        </div>

        {/* Content Paragraph lines */}
        <div className="space-y-3 pt-4">
          <div className="w-full h-4 rounded skeleton" />
          <div className="w-full h-4 rounded skeleton" />
          <div className="w-11/12 h-4 rounded skeleton" />
          <div className="w-5/6 h-4 rounded skeleton" />
          <div className="w-full h-4 rounded skeleton" />
          <div className="w-10/12 h-4 rounded skeleton" />
        </div>
      </div>
    );
  }

  // Fallback: standard Feed Post Card Skeleton
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-full">
      {/* Cover image placeholder */}
      <div className="w-full h-48 skeleton" />
      
      {/* Text context details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
        <div className="space-y-3">
          <div className="w-16 h-3 rounded skeleton" />
          <div className="w-5/6 h-5 rounded skeleton" />
          <div className="w-full h-3 rounded skeleton" />
          <div className="w-11/12 h-3 rounded skeleton" />
        </div>
        
        {/* Footer author indicator row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full skeleton" />
            <div className="w-20 h-3 rounded skeleton" />
          </div>
          <div className="w-12 h-3 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
