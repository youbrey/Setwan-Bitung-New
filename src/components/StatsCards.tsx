import React from 'react';
import { EmployeeMonthlySummary } from '../types';

interface StatsCardsProps {
  summaries: EmployeeMonthlySummary[];
  totalDaysInPeriod: number;
  totalEntriesCount: number;
  totalReviewCount: number;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  summaries,
  totalDaysInPeriod,
  totalEntriesCount,
  totalReviewCount,
  activeFilter,
  onFilterChange,
}) => {
  const totalEmployees = summaries.length;

  const cards = [
    {
      id: 'stat-employees',
      label: 'Pegawai',
      value: String(totalEmployees),
      filterKey: 'all',
      isAlert: false,
    },
    {
      id: 'stat-period',
      label: 'Hari dalam periode',
      value: String(totalDaysInPeriod),
      filterKey: 'all',
      isAlert: false,
    },
    {
      id: 'stat-entries',
      label: 'Data kehadiran',
      value: totalEntriesCount.toLocaleString('id-ID'),
      filterKey: 'all',
      isAlert: false,
    },
    {
      id: 'stat-review',
      label: 'Perlu review',
      value: String(totalReviewCount),
      filterKey: 'issues',
      isAlert: totalReviewCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const isActive = activeFilter === card.filterKey && card.filterKey !== 'all';

        return (
          <div
            key={card.id}
            id={card.id}
            onClick={() => onFilterChange(card.filterKey)}
            className={`cursor-pointer bg-white px-4 py-3.5 rounded-[10px] border transition shadow-2xs ${
              isActive
                ? 'border-[#1D73E8] ring-2 ring-blue-200'
                : 'border-[#E3E8EF] hover:border-[#C9D3DF]'
            }`}
          >
            <div
              className={`text-2xl sm:text-[26px] font-bold leading-tight ${
                card.isAlert ? 'text-[#B42318]' : 'text-[#17324D]'
              }`}
            >
              {card.value}
            </div>
            <div className="text-xs text-[#66788A] font-medium mt-1">
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
