"use client";

import React from "react";
import { Button } from "../ui/Button";
import { CataBagulhoResult } from "../../types/cataBagulho";

interface ServiceCardProps {
  service: CataBagulhoResult;
  onViewTrecho?: (trechoId: string) => void;
}

export function ServiceCard({ service, onViewTrecho }: ServiceCardProps) {
  const handleVerTrecho = () => {
    if (service.trechos && service.trechos.length > 0 && onViewTrecho) {
      onViewTrecho(service.trechos[0]);

      // Scroll suave para o mapa
      setTimeout(() => {
        const mapElement = document.getElementById("mapa-section");
        if (mapElement) {
          mapElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 fade-in">
      <div className="p-6">
        {/* Cabeçalho do Card */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-dark-primary mb-2">
              {service.street}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              {service.startStretch && (
                <p>
                  <span className="font-medium">Início:</span>{" "}
                  {service.startStretch}
                </p>
              )}
              {service.endStretch && (
                <p>
                  <span className="font-medium">Fim:</span> {service.endStretch}
                </p>
              )}
            </div>
          </div>

          {service.trechos && service.trechos.length > 0 && (
            <Button
              onClick={handleVerTrecho}
              size="sm"
              className="bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1.5 rounded-md transition-colors duration-200"
            >
              Ver Trecho
            </Button>
          )}
        </div>

        {/* Informações de Coleta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {service.frequency && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs font-medium text-gray-500 block mb-1">
                Frequência
              </span>
              <span className="text-sm text-dark-primary">
                {service.frequency}
              </span>
            </div>
          )}

          {service.shift && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs font-medium text-gray-500 block mb-1">
                Turno
              </span>
              <span className="text-sm text-dark-primary">{service.shift}</span>
            </div>
          )}

          {service.schedule && (
            <div className="bg-gray-50 rounded-lg p-3 sm:col-span-2">
              <span className="text-xs font-medium text-gray-500 block mb-1">
                Horário
              </span>
              <span className="text-sm text-dark-primary">
                {service.schedule}
              </span>
            </div>
          )}
        </div>

        {/* Datas de Coleta - Com scroll fixado */}
        {service.dates && service.dates.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Próximas Coletas:
            </h4>
            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {service.dates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-secondary/10 rounded-lg border border-secondary/20"
                >
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-dark-primary font-medium">
                    {date.trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
