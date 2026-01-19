
import React from 'react';

export const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-6 md:mb-8">
    <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">{title}</h2>
    <p className="text-sm md:text-base text-gray-500 font-light">{subtitle}</p>
  </div>
);
