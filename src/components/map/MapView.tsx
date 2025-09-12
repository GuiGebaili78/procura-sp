"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { LatLngTuple, Icon, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { TrechoCoordinates } from "../../types/cataBagulho";
import { FeiraLivre } from "../../types/feiraLivre";
import { EstabelecimentoSaude, TIPOS_ESTABELECIMENTO } from "../../types/saude";

// Ícones customizados
const createCustomIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color}" stroke="#000" stroke-width="1" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.596 19.404 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="7"/>
    </svg>
  `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const userLocationIcon = createCustomIcon("#00ADB5");
const trechoIcon = createCustomIcon("#FF6B6B");


interface MapViewProps {
  center: LatLngTuple;
  userLocation?: LatLngTuple;
  userAddress?: string;
  trechoCoordinates?: TrechoCoordinates | null;
  className?: string;
  isFeira?: boolean;
  feiras?: FeiraLivre[];
  selectedFeiraId?: string;
  isSaude?: boolean;
  estabelecimentosSaude?: EstabelecimentoSaude[];
}

// Componente para gerenciar rotas (temporariamente desabilitado)
function RouteController({
  selectedFeiraId,
}: {
  userLocation?: LatLngTuple;
  selectedFeiraId?: string;
  feiras?: FeiraLivre[];
}) {
  // TODO: Implementar roteamento quando a biblioteca estiver funcionando
  console.log('Rota solicitada para feira:', selectedFeiraId);
  return null;
}

// Componente para ajustar automaticamente a visualização do mapa
function MapController({
  userLocation,
  trechoCoordinates,
  feiras = [],
  isFeira = false,
  estabelecimentosSaude = [],
  isSaude = false,
}: {
  userLocation?: LatLngTuple;
  trechoCoordinates?: TrechoCoordinates | null;
  feiras?: FeiraLivre[];
  isFeira?: boolean;
  estabelecimentosSaude?: EstabelecimentoSaude[];
  isSaude?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (isSaude && estabelecimentosSaude.length > 0) {
      // Para saúde, ajustar para mostrar todos os estabelecimentos e o usuário
      const bounds = new LatLngBounds([]);
      
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      estabelecimentosSaude.forEach(estabelecimento => {
        bounds.extend([estabelecimento.coordenadas.lat, estabelecimento.coordenadas.lng]);
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (isFeira && feiras.length > 0) {
      // Para feiras, ajustar para mostrar todas as feiras e o usuário
      const bounds = new LatLngBounds([]);
      
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      feiras.forEach(feira => {
        if (feira.coords) {
          bounds.extend([feira.coords.lat, feira.coords.lng]);
        }
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (
      trechoCoordinates &&
      trechoCoordinates.coordinates &&
      trechoCoordinates.coordinates.length > 0
    ) {
      // Se há trecho selecionado, ajusta para mostrar todo o trecho + localização do usuário
      const bounds = new LatLngBounds([]);

      // Adiciona pontos do trecho
      trechoCoordinates.coordinates.forEach((coord) => {
        bounds.extend([coord.lat, coord.lng]);
      });

      // Adiciona localização do usuário se existir
      if (userLocation) {
        bounds.extend(userLocation);
      }

      // Ajusta o mapa para mostrar todos os pontos
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (userLocation) {
      // Se apenas tem localização do usuário, centraliza nela
      map.setView(userLocation, 16);
    }
  }, [map, userLocation, trechoCoordinates, feiras, isFeira, estabelecimentosSaude, isSaude]);

  return null;
}

export function MapView({
  center,
  userLocation,
  userAddress,
  trechoCoordinates,
  className = "",
  isFeira = false,
  feiras = [],
  selectedFeiraId,
  isSaude = false,
  estabelecimentosSaude = [],
}: MapViewProps) {
  // Fix para ícones do Leaflet no Next.js
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Tipagem específica para o prototype do Icon Default
      interface IconDefaultPrototype extends Icon.Default {
        _getIconUrl?: () => string;
      }

      delete (Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
      Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });
    }
  }, []);

  return (
    <div
      id="mapa-section"
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      <div className="p-4 gradient-secondary">
        <h3 className="text-lg font-semibold text-white">
          Localização e Trecho
        </h3>
      </div>

      <div className="h-96 w-full">
        <MapContainer
          center={center}
          zoom={15}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Controlador para ajuste automático do mapa */}
          <MapController
            userLocation={userLocation}
            trechoCoordinates={trechoCoordinates}
            feiras={feiras}
            isFeira={isFeira}
            estabelecimentosSaude={estabelecimentosSaude}
            isSaude={isSaude}
          />

          {/* Controlador para rotas */}
          {isFeira && (
            <RouteController
              userLocation={userLocation}
              selectedFeiraId={selectedFeiraId}
              feiras={feiras}
            />
          )}

          {/* Marcador da localização do usuário */}
          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div className="text-center">
                  <strong>📍 Sua Localização</strong>
                  <br />
                  {userAddress && (
                    <>
                      <small className="text-gray-600">{userAddress}</small>
                      <br />
                    </>
                  )}
                  <small className="text-gray-500">
                    {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                  </small>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcadores das feiras */}
          {isFeira && feiras.map((feira) => {
            if (!feira.coords) return null;
            
            return (
              <Marker 
                key={feira.id} 
                position={[feira.coords.lat, feira.coords.lng]} 
                icon={createCustomIcon("#22C55E")}
              >
                <Popup>
                  <div className="text-center">
                    <strong>🛒 {feira.nome}</strong>
                    <br />
                    <small>{feira.diaSemana}</small>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Marcadores dos estabelecimentos de saúde */}
          {isSaude && estabelecimentosSaude.map((estabelecimento) => {
            // Determinar o tipo e cor do estabelecimento
            const getTipoInfo = () => {
              const tipoMap: Record<string, keyof typeof TIPOS_ESTABELECIMENTO> = {
                "05": "UBS",
                "01": "HOSPITAL", 
                "02": "POSTO",
                "03": "FARMACIA",
                "04": "MATERNIDADE",
                "06": "URGENCIA",
                "07": "ACADEMIA",
                "08": "CAPS",
                "09": "SAUDE_BUCAL",
                "10": "DOENCAS_RARAS"
              };
              
              const tipo = tipoMap[estabelecimento.tipoCodigo] || "UBS";
              return TIPOS_ESTABELECIMENTO[tipo];
            };

            const tipoInfo = getTipoInfo();
            
            return (
              <Marker 
                key={estabelecimento.id} 
                position={[estabelecimento.coordenadas.lat, estabelecimento.coordenadas.lng]} 
                icon={createCustomIcon(tipoInfo.cor)}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{tipoInfo.icone} {estabelecimento.nome}</strong>
                    <br />
                    <small>{tipoInfo.nome}</small>
                    <br />
                    <small className="text-gray-600">{estabelecimento.endereco}</small>
                    {estabelecimento.distancia && (
                      <>
                        <br />
                        <small className="text-blue-600">
                          📍 {estabelecimento.distancia < 1000 
                            ? `${Math.round(estabelecimento.distancia)}m` 
                            : `${(estabelecimento.distancia / 1000).toFixed(1)}km`}
                        </small>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Linha do trecho */}
          {trechoCoordinates &&
            trechoCoordinates.coordinates &&
            trechoCoordinates.coordinates.length > 1 && (
              <>
                <Polyline
                  positions={trechoCoordinates.coordinates.map(
                    (coord) => [coord.lat, coord.lng] as LatLngTuple,
                  )}
                  color="#00ADB5"
                  weight={4}
                  opacity={0.8}
                />

                {/* Marcadores de início e fim do trecho */}
                <Marker
                  position={[
                    trechoCoordinates.coordinates[0].lat,
                    trechoCoordinates.coordinates[0].lng,
                  ]}
                  icon={trechoIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Início do Trecho</strong>
                      <br />
                      <small>Cata-Bagulho</small>
                    </div>
                  </Popup>
                </Marker>

                <Marker
                  position={[
                    trechoCoordinates.coordinates[
                      trechoCoordinates.coordinates.length - 1
                    ].lat,
                    trechoCoordinates.coordinates[
                      trechoCoordinates.coordinates.length - 1
                    ].lng,
                  ]}
                  icon={trechoIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Fim do Trecho</strong>
                      <br />
                      <small>Cata-Bagulho</small>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
        </MapContainer>
      </div>

      {trechoCoordinates && (
        <div className="p-3 bg-gray-50 border-t">
          <p className="text-xs text-gray-600 text-center">
            Trecho: {trechoCoordinates.cd_mapa} •
            {trechoCoordinates.coordinates.length} pontos de coordenadas
          </p>
        </div>
      )}
    </div>
  );
}
