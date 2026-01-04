import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="text-center p-6 max-w-md bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-4">Página não encontrada</h2>
        <p className="text-zinc-400 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-medium rounded-lg"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}