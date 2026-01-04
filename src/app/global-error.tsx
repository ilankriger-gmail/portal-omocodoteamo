'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="pt-BR">
      <body className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl shadow-xl">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Erro Fatal</h1>
          <h2 className="text-xl font-semibold mb-4">Erro na aplicação</h2>
          <p className="text-zinc-400 mb-6">
            A aplicação encontrou um erro crítico. Tente recarregar a página.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-medium rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}