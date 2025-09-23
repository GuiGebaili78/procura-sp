import { ServiceCard } from "./ServiceCard";
import { FeirasList } from "./FeirasList";
import { ColetaLixoList } from "./ColetaLixoList";
import { HealthList } from "../health/HealthList";
import { CataBagulhoResult } from "../../types/cataBagulho";
import { FeiraLivre } from "../../types/feiraLivre";
import { ColetaLixoResponse } from "../../types/coletaLixo";
import { EstabelecimentoSaude } from "../../types/saude";

interface ServicesListProps {
  services?: CataBagulhoResult[];
  feiras?: FeiraLivre[];
  coletaLixo?: ColetaLixoResponse;
  estabelecimentosSaude?: EstabelecimentoSaude[];
  serviceType?: string;
  onViewTrecho?: (trechoId: string) => void;
  selectedFeiraId?: string;
}

export function ServicesList({ services, feiras, coletaLixo, estabelecimentosSaude, serviceType, onViewTrecho, selectedFeiraId }: ServicesListProps) {
  // Se for feiras livres, usar o componente específico
  if (serviceType === "feiras-livres" && feiras) {
    return <FeirasList feiras={feiras} onViewTrecho={onViewTrecho} selectedFeiraId={selectedFeiraId} />;
  }

  // Se for coleta de lixo, usar o componente específico
  if (serviceType === "coleta-lixo" && coletaLixo) {
    return <ColetaLixoList coletaComum={coletaLixo.coletaComum} coletaSeletiva={coletaLixo.coletaSeletiva} />;
  }

  // Se for saúde, usar o componente específico
  if (serviceType === "saude" && estabelecimentosSaude) {
    return <HealthList estabelecimentos={estabelecimentosSaude} />;
  }

  // Se for cata-bagulho ou outros serviços
  if (services && services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🤷</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-gray-600">
          Não encontramos serviços para este endereço. Tente verificar se o
          endereço está correto ou tente um endereço próximo.
        </p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <ServiceCard
          key={`${service.street}-${service.startStretch || ''}-${service.endStretch || ''}-${index}`}
          service={service}
          onViewTrecho={onViewTrecho}
        />
      ))}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          📋 {services.length} resultado{services.length !== 1 ? "s" : ""}{" "}
          encontrado{services.length !== 1 ? "s" : ""}
        </h4>
        <p className="text-sm text-blue-700">
          Os horários e datas podem variar. Recomendamos confirmar as
          informações diretamente com a prefeitura ou deixar os itens
          disponíveis nos horários indicados.
        </p>
      </div>
    </div>
  );
}
