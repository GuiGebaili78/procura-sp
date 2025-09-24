"use client";

import React, { useEffect } from "react";
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
import { EstabelecimentoSaude } from "../../lib/services/saudeLocal.service";
import { HealthMarkerPopup } from "../health/HealthMarkerPopup";

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
    console.log("🗺️ [MapController] useEffect executado:");
    console.log("🗺️ [MapController] - userLocation:", userLocation);
    console.log("🗺️ [MapController] - isFeira:", isFeira);
    console.log("🗺️ [MapController] - feiras.length:", feiras.length);
    console.log("🗺️ [MapController] - isSaude:", isSaude);
    console.log("🗺️ [MapController] - estabelecimentosSaude.length:", estabelecimentosSaude.length);
    
    if (isSaude && estabelecimentosSaude.length > 0) {
      // Para saúde, centralizar no usuário primeiro para facilitar navegação
      if (userLocation) {
        console.log("🗺️ [MapController] Centralizando no usuário para saúde:", userLocation);
        // Centralizar no usuário com zoom adequado para ver estabelecimentos próximos
        map.setView(userLocation, 15);
        
        // Opcionalmente, ajustar bounds para incluir estabelecimentos próximos
        // mas mantendo o foco no usuário
        setTimeout(() => {
          const bounds = new LatLngBounds([]);
          bounds.extend(userLocation);
          
          // Adicionar apenas estabelecimentos próximos (dentro de 2km)
          estabelecimentosSaude.forEach(estabelecimento => {
            if (estabelecimento.latitude && estabelecimento.longitude) {
              // Calcular distância do usuário
              const distancia = map.distance(userLocation, [estabelecimento.latitude, estabelecimento.longitude]);
              if (distancia <= 2000) { // 2km
                bounds.extend([estabelecimento.latitude, estabelecimento.longitude]);
              }
            }
          });
          
          // Se há estabelecimentos próximos, ajustar bounds suavemente
          if (bounds.isValid() && bounds.getNorthEast() !== bounds.getSouthWest()) {
            console.log("🗺️ [MapController] Ajustando bounds para estabelecimentos próximos");
            map.fitBounds(bounds, { padding: [30, 30] });
          }
        }, 500); // Delay para suavizar a transição
      } else {
        // Fallback: se não há userLocation, usar bounds normal
        const bounds = new LatLngBounds([]);
        estabelecimentosSaude.forEach(estabelecimento => {
          if (estabelecimento.latitude && estabelecimento.longitude) {
            bounds.extend([estabelecimento.latitude, estabelecimento.longitude]);
          }
        });
        
        if (bounds.isValid()) {
          console.log("🗺️ [MapController] Ajustando bounds para saúde (sem userLocation)");
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    } else if (isFeira && feiras.length > 0) {
      // Para feiras, ajustar para mostrar todas as feiras e o usuário
      const bounds = new LatLngBounds([]);
      
      if (userLocation) {
        console.log("🗺️ [MapController] Adicionando userLocation aos bounds:", userLocation);
        bounds.extend(userLocation);
      }
      
      feiras.forEach(feira => {
        if (feira.latitude && feira.longitude) {
          bounds.extend([feira.latitude, feira.longitude]);
        }
      });
      
      if (bounds.isValid()) {
        console.log("🗺️ [MapController] Ajustando bounds para feiras");
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
      console.log("🗺️ [MapController] Centralizando no userLocation:", userLocation);
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
  console.log("🗺️ [MapView] Props recebidas:");
  console.log("🗺️ [MapView] - center:", center);
  console.log("🗺️ [MapView] - userLocation:", userLocation);
  console.log("🗺️ [MapView] - userAddress:", userAddress);
  console.log("🗺️ [MapView] - isFeira:", isFeira);
  console.log("🗺️ [MapView] - feiras:", feiras.length);
  console.log("🗺️ [MapView] - isSaude:", isSaude);
  console.log("🗺️ [MapView] - estabelecimentosSaude:", estabelecimentosSaude.length);
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
            <>
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
            </>
          )}

          {/* Marcadores das feiras */}
          {isFeira && feiras.map((feira) => {
            if (!feira.latitude || !feira.longitude) return null;
            
            return (
              <Marker 
                key={feira.id} 
                position={[feira.latitude, feira.longitude]} 
                icon={createCustomIcon("#22C55E")}
              >
                <Popup>
                  <div className="text-center p-2">
                    <strong>🛒 Feira {feira.numeroFeira}</strong>
                    <br />
                    <small className="text-gray-600">{feira.endereco}</small>
                    <br />
                    <small className="text-blue-600">{feira.diaSemana}</small>
                    <br />
                    <small className="text-green-600">{feira.categoria}</small>
                    {feira.distancia && (
                      <>
                        <br />
                        <small className="text-orange-600">📏 {feira.distancia.toFixed(2)} km</small>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Marcadores dos estabelecimentos de saúde com agrupamento por coordenadas */}
          {isSaude && (() => {
            // Agrupar estabelecimentos por coordenadas
            const grupos: Record<string, EstabelecimentoSaude[]> = {};
            
            estabelecimentosSaude.forEach(estabelecimento => {
              if (estabelecimento.latitude && estabelecimento.longitude) {
                const key = `${estabelecimento.latitude.toFixed(6)},${estabelecimento.longitude.toFixed(6)}`;
                if (!grupos[key]) {
                  grupos[key] = [];
                }
                grupos[key].push(estabelecimento);
              }
            });

            // Renderizar marcadores agrupados
            return Object.entries(grupos).map(([coords, estabelecimentos]) => {
              const [lat, lng] = coords.split(',').map(Number);
              const isMultiple = estabelecimentos.length > 1;
              
              // Função para obter cor baseada na categoria
              const getCorPorCategoria = (categoria: string | null): string => {
                if (!categoria) return "#6B7280"; // Cinza padrão
                
                const coresPorCategoria: Record<string, string> = {
                  'Unidade Básica de Saúde': '#3B82F6', // Azul
                  'Hospital Geral': '#EF4444', // Vermelho
                  'Hospital': '#EF4444', // Vermelho
                  'Hospital Especializado': '#EF4444', // Vermelho
                  'Pronto Socorro Geral': '#F97316', // Laranja
                  'Pronto Atendimento': '#F97316', // Laranja
                  'AMA Especialidades': '#10B981', // Verde
                  'Assistência Médica Ambulatorial': '#10B981', // Verde
                  'Ambulatório de Especialidades': '#10B981', // Verde
                  'Centro e Serviços de Diagnóstico por Imagem': '#8B5CF6', // Roxo
                  'Centro/Clínica de Especialidades Odontológicas': '#06B6D4', // Ciano
                  'Laboratório': '#EC4899', // Rosa
                  'Centro de Atenção Psicossocial Adulto': '#6B7280', // Cinza
                  'Centro de Atenção Psicossocial Infantil': '#6B7280', // Cinza
                  'Centro de Atenção Psicossocial Álcool e Drogas': '#6B7280', // Cinza
                  'Centro de Reabilitação': '#84CC16', // Verde lima
                  'Núcleo Integrado de Reabilitação': '#84CC16', // Verde lima
                };
                
                return coresPorCategoria[categoria] || '#6B7280';
              };

              // Usar a cor da primeira categoria ou uma cor padrão para múltiplos
              const cor = isMultiple ? '#F59E0B' : getCorPorCategoria(estabelecimentos[0].categoria);
              
              return (
                <Marker 
                  key={coords} 
                  position={[lat, lng]} 
                  icon={createCustomIcon(cor)}
                >
                  <Popup>
                    <HealthMarkerPopup estabelecimentos={estabelecimentos} />
                  </Popup>
                </Marker>
              );
            });
          })()}

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
