"use client";

import React, { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = "" }: TabsProps) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex flex-wrap gap-2 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                transition-all duration-200 ease-in-out
                ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.icon && (
                <span className="text-lg" role="img" aria-label={tab.label}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ children, className = "" }: TabPanelProps) {
  return (
    <div className={`py-6 ${className}`}>
      {children}
    </div>
  );
}

