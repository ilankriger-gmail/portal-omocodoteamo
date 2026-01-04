'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="text-center p-6 max-w-md bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Erro</h1>
        <h2 className="text-xl font-semibold mb-4">Algo deu errado</h2>
        <p className="text-zinc-400 mb-6">
          Ocorreu um erro inesperado. Tente novamente mais tarde.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-medium rounded-lg"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-block w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-medium rounded-lg"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}