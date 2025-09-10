import React from "react";

interface SkeletonLoadingProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
}

export function SkeletonLoading({ 
  className = "", 
  lines = 3, 
  showAvatar = false 
}: SkeletonLoadingProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-300 rounded ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}

// Componente específico para skeleton de feiras
export function FeirasSkeletonLoading() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      <div className="p-6">
        {/* Cabeçalho skeleton */}
        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>

        {/* Lista de feiras skeleton */}
        <div className="space-y-4 mb-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem skeleton */}
        <div className="text-center p-4 bg-gray-100 rounded-lg mb-4">
          <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3 mx-auto"></div>
        </div>

        {/* Informações skeleton */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

// Componente específico para skeleton de cata-bagulho
export function CataBagulhoSkeletonLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6">
            {/* Cabeçalho do card */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>

            {/* Grid de informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="h-3 bg-gray-300 rounded w-1/4 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="h-3 bg-gray-300 rounded w-1/4 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
                <div className="h-3 bg-gray-300 rounded w-1/4 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>

            {/* Lista de datas */}
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-3"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, dateIndex) => (
                  <div key={dateIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
