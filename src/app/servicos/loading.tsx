import { Loading } from "../../components/ui/Loading";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-lg text-gray-600">Carregando serviços...</p>
      </div>
    </div>
  );
}