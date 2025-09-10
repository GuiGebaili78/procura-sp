import { SERVICE_ICONS } from "../../utils/constants";

interface ServiceSelectorProps {
  selectedService: string;
  onServiceChange: (service: string) => void;
}

export function ServiceSelector({
  selectedService,
  onServiceChange,
}: ServiceSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="service"
          className="block text-sm font-medium text-dark-primary mb-2"
        >
          🔍 Tipo de serviço
        </label>
        <select
          id="service"
          value={selectedService}
          onChange={(e) => onServiceChange(e.target.value)}
          className="input-base w-full"
        >
          <option value="cata-bagulho">
            {SERVICE_ICONS["cata-bagulho"]} Cata-Bagulho
          </option>
          <option value="feiras-livres">
            {SERVICE_ICONS["feiras-livres"]} Feiras Livres
          </option>
          <option value="coleta-lixo">
            {SERVICE_ICONS["coleta-lixo"]} Coleta de Lixo
          </option>
        </select>
      </div>

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <h4 className="font-medium text-dark-primary mb-2">
          {SERVICE_ICONS[selectedService as keyof typeof SERVICE_ICONS]} Sobre este serviço:
        </h4>
        <div className="text-sm text-gray-600">
          {selectedService === "cata-bagulho" ? (
            <div>
              <p className="mb-2">
                <strong>Cata-Bagulho:</strong> Coleta de móveis velhos,
                eletrodomésticos e objetos grandes.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Agendamento necessário</li>
                <li>Horários específicos por região</li>
                <li>Limite de volume por coleta</li>
                <li>Não recolhe lixo comum</li>
              </ul>
            </div>
          ) : selectedService === "feiras-livres" ? (
            <div>
              <p className="mb-2">
                <strong>Feiras Livres:</strong> Encontre feiras livres próximas
                ao seu endereço com horários e dias da semana.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Feiras semanais por região</li>
                <li>Horários e dias específicos</li>
                <li>Localização precisa no mapa</li>
                <li>Informações atualizadas</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="mb-2">
                <strong>Coleta de Lixo:</strong> Consulte horários de coleta
                comum e seletiva na sua região.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Coleta comum (lixo orgânico)</li>
                <li>Coleta seletiva (recicláveis)</li>
                <li>Horários e dias específicos</li>
                <li>Informações oficiais</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
