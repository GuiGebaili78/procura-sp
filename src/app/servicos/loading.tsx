import { Loading } from "../../components/ui/Loading";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-accent to-primary-accent flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-lg text-secondary">Carregando serviços...</p>
      </div>
    </div>
  );
}
