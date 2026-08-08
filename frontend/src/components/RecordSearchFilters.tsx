"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterProps {
  filterOptions: {
    departments: string[];
    conditions: string[];
    severities: string[];
  };
  totalResults: number;
}

export default function RecordSearchFilters({ filterOptions, totalResults }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [severity, setSeverity] = useState(searchParams.get('severity') || '');
  const [datePreset, setDatePreset] = useState(searchParams.get('date_preset') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [conditionType, setConditionType] = useState(searchParams.get('condition_type') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');

  const buildUrl = useCallback((overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    const values: Record<string, string> = {
      search: searchValue,
      severity,
      date_preset: datePreset,
      department,
      condition_type: conditionType,
      sort_by: sortBy,
      ...overrides,
    };
    Object.entries(values).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    return `/records?${params.toString()}`;
  }, [searchValue, severity, datePreset, department, conditionType, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(buildUrl(), { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (key: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      severity: setSeverity,
      date_preset: setDatePreset,
      department: setDepartment,
      condition_type: setConditionType,
      sort_by: setSortBy,
    };
    setters[key]?.(value);
    router.push(buildUrl({ [key]: value }), { scroll: false });
  };

  const clearFilters = () => {
    setSearchValue('');
    setSeverity('');
    setDatePreset('');
    setDepartment('');
    setConditionType('');
    setSortBy('newest');
    router.push('/records', { scroll: false });
  };

  const activeFilterCount = [severity, datePreset, department, conditionType].filter(Boolean).length;
  const hasAnyFilter = activeFilterCount > 0 || searchValue;

  const dateOptions = [
    { value: '', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'severity', label: 'Highest Severity' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search monitoring records..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base"
          id="record-search-input"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mr-1">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Filters</span>
        </div>

        {/* Severity */}
        <div className="relative">
          <select
            value={severity}
            onChange={(e) => applyFilter('severity', e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
              severity ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            id="filter-severity"
          >
            <option value="">Severity</option>
            {filterOptions.severities.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date */}
        <div className="relative">
          <select
            value={datePreset}
            onChange={(e) => applyFilter('date_preset', e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
              datePreset ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            id="filter-date"
          >
            {dateOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Department */}
        <div className="relative">
          <select
            value={department}
            onChange={(e) => applyFilter('department', e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
              department ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            id="filter-department"
          >
            <option value="">Department</option>
            {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Condition */}
        <div className="relative">
          <select
            value={conditionType}
            onChange={(e) => applyFilter('condition_type', e.target.value)}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
              conditionType ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            id="filter-condition"
          >
            <option value="">Condition Type</option>
            {filterOptions.conditions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={sortBy}
            onChange={(e) => applyFilter('sort_by', e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-300 transition-all"
            id="sort-by"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Clear Filters */}
        {hasAnyFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            id="clear-filters-btn"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Result Count + Active filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{totalResults}</span> monitoring record{totalResults !== 1 ? 's' : ''}
        </p>
        {/* Active filter badges */}
        <div className="flex flex-wrap gap-1.5">
          {severity && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              Severity: {severity}
              <button onClick={() => applyFilter('severity', '')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {datePreset && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              Date: {dateOptions.find(o => o.value === datePreset)?.label}
              <button onClick={() => applyFilter('date_preset', '')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {department && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              Dept: {department}
              <button onClick={() => applyFilter('department', '')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
            </span>
          )}
          {conditionType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              Condition: {conditionType}
              <button onClick={() => applyFilter('condition_type', '')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
