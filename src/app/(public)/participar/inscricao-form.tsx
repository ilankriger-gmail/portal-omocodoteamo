"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Loader2,
  Send,
  User,
  MapPin,
  HelpCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckIcon
} from "lucide-react";
import { ESTADOS_BRASIL, getCidadesByEstado } from "@/lib/ibge";
import type { Cidade } from "@/types/brasil";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const tiposNecessidade = [
  { id: "dinheiro", label: "Dinheiro", emoji: "💰" },
  { id: "presenca", label: "Presença do Ilan", emoji: "🤝" },
  { id: "conhecimento", label: "Conhecimento", emoji: "📚" },
  { id: "apoio", label: "Apoio", emoji: "❤️" },
];

const faixasValor = [
  { id: "ate_1000", label: "Até R$ 1.000" },
  { id: "ate_5000", label: "Até R$ 5.000" },
  { id: "ate_10000", label: "Até R$ 10.000" },
  { id: "ate_50000", label: "Até R$ 50.000" },
  { id: "ate_100000", label: "Até R$ 100.000" },
  { id: "mais_100000", label: "Mais de R$ 100.000" },
];

export function InscricaoForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    estado: "",
    cidade: "",
    dataNascimento: "",
    dataRealizacao: "",
    necessidade: "",
    historia: "",
    situacao: "",
    paraQuem: "proprio",
    nomeBeneficiado: "",
    linkMidiaSocial: "",
    faixaValor: "",
  });

  // Buscar cidades quando o estado muda
  useEffect(() => {
    if (form.estado) {
      setLoadingCidades(true);
      setCidades([]);
      setForm((prev) => ({ ...prev, cidade: "" })); // Limpar cidade selecionada

      getCidadesByEstado(form.estado)
        .then((data) => setCidades(data))
        .catch(console.error)
        .finally(() => setLoadingCidades(false));
    } else {
      setCidades([]);
    }
  }, [form.estado]);

  const nextStep = () => {
    // Simple validation for each step
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const validateCurrentStep = (): boolean => {
    setError(null);

    if (currentStep === 1) {
      // Step 1: Dados Pessoais
      if (!form.nome.trim()) {
        setError("Por favor, informe seu nome completo");
        return false;
      }
      if (!form.email.trim()) {
        setError("Por favor, informe seu email");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Por favor, informe um email válido");
        return false;
      }
      return true;
    }
    else if (currentStep === 2) {
      // Step 2: Localização
      if (!form.estado) {
        setError("Por favor, selecione seu estado");
        return false;
      }
      if (!form.cidade) {
        setError("Por favor, selecione sua cidade");
        return false;
      }
      return true;
    }
    else if (currentStep === 3) {
      // Step 3: Tipo de Necessidade
      if (!form.necessidade) {
        setError("Por favor, selecione o tipo de ajuda que você precisa");
        return false;
      }
      if (form.necessidade === "dinheiro" && !form.faixaValor) {
        setError("Por favor, selecione a faixa de valor necessária");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao enviar inscrição. Tente novamente.");
      }
    } catch {
      setError("Erro ao enviar inscrição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Inscrição enviada!</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Sua história foi recebida. Entraremos em contato caso você seja selecionado.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setError(null);
            setForm({
              nome: "",
              email: "",
              telefone: "",
              estado: "",
              cidade: "",
              dataNascimento: "",
              dataRealizacao: "",
              necessidade: "",
              historia: "",
              situacao: "",
              paraQuem: "proprio",
              nomeBeneficiado: "",
              linkMidiaSocial: "",
              faixaValor: "",
            });
            setCidades([]);
          }}
          className="text-blue-400 text-sm hover:underline"
        >
          Enviar outra história
        </button>
      </div>
    );
  }

  // Step Indicator component
  const StepIndicator = () => {
    const icons = [
      <User key="user" size={16} />,
      <MapPin key="map" size={16} />,
      <HelpCircle key="help" size={16} />,
      <FileText key="file" size={16} />
    ];

    const labels = ["Dados", "Local", "Necessidade", "História"];

    return (
      <div className="mb-6">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-4">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  i + 1 === currentStep
                    ? 'bg-green-500 text-white'
                    : i + 1 < currentStep
                    ? 'bg-green-900 text-green-200'
                    : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {i + 1 < currentStep ? <CheckIcon size={14} /> : icons[i]}
              </div>
              <span className="text-xs text-zinc-400 mt-1">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {/* Nome e Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Nome completo *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Para quem é o sonho */}
            <div>
              <label className="block text-zinc-400 text-xs mb-2">Esse sonho é para você ou para outra pessoa? *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paraQuem: "proprio", nomeBeneficiado: "" })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    form.paraQuem === "proprio"
                      ? "bg-purple-500/30 border-2 border-purple-500 text-white"
                      : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50"
                  }`}
                >
                  Para mim
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paraQuem: "outra_pessoa" })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    form.paraQuem === "outra_pessoa"
                      ? "bg-purple-500/30 border-2 border-purple-500 text-white"
                      : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50"
                  }`}
                >
                  Para outra pessoa
                </button>
              </div>
            </div>

            {/* Nome do beneficiado (se for para outra pessoa) */}
            {form.paraQuem === "outra_pessoa" && (
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Nome da pessoa a ser beneficiada *</label>
                <input
                  type="text"
                  value={form.nomeBeneficiado}
                  onChange={(e) => setForm({ ...form, nomeBeneficiado: e.target.value })}
                  placeholder="Nome completo da pessoa"
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>
            )}

            {/* Telefone e Data de Nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Telefone</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Data de Nascimento</label>
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Estado e Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Estado *</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-zinc-900">
                    Selecione o estado
                  </option>
                  {ESTADOS_BRASIL.map((estado) => (
                    <option key={estado.sigla} value={estado.sigla} className="bg-zinc-900">
                      {estado.nome} ({estado.sigla})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">Cidade *</label>
                <select
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  disabled={!form.estado || loadingCidades}
                  className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-zinc-900">
                    {loadingCidades
                      ? "Carregando cidades..."
                      : !form.estado
                      ? "Selecione o estado primeiro"
                      : "Selecione a cidade"}
                  </option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome} className="bg-zinc-900">
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Data para realização do sonho */}
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">
                Data desejada para realização do sonho
              </label>
              <input
                type="date"
                value={form.dataRealizacao}
                onChange={(e) => setForm({ ...form, dataRealizacao: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
              <p className="text-zinc-500 text-[10px] mt-1">
                Se houver uma data especial (aniversário, formatura, etc.)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {/* O que você precisa */}
            <div>
              <label className="block text-zinc-400 text-xs mb-2">O que você precisa? *</label>
              <div className="grid grid-cols-2 gap-2">
                {tiposNecessidade.map((tipo) => {
                  const isSelected = form.necessidade === tipo.id;
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, necessidade: tipo.id, faixaValor: tipo.id !== "dinheiro" ? "" : form.faixaValor });
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-purple-500/30 border-2 border-purple-500 text-white"
                          : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50"
                      }`}
                    >
                      <span>{tipo.emoji}</span>
                      <span>{tipo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faixa de valor (se precisar de dinheiro) */}
            {form.necessidade === "dinheiro" && (
              <div>
                <label className="block text-zinc-400 text-xs mb-2">De quanto você precisa? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {faixasValor.map((faixa) => {
                    const isSelected = form.faixaValor === faixa.id;
                    return (
                      <button
                        key={faixa.id}
                        type="button"
                        onClick={() => setForm({ ...form, faixaValor: faixa.id })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-green-500/30 border-2 border-green-500 text-white"
                            : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50"
                        }`}
                      >
                        {faixa.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Link de mídia social ou vaquinha */}
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">
                Link de mídia social ou vaquinha existente
              </label>
              <input
                type="url"
                value={form.linkMidiaSocial}
                onChange={(e) => setForm({ ...form, linkMidiaSocial: e.target.value })}
                placeholder="https://instagram.com/... ou https://vakinha.com.br/..."
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
              <p className="text-zinc-500 text-[10px] mt-1">
                Opcional - Se você já tem uma vaquinha ou quer compartilhar seu perfil
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            {/* História */}
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Conte sua história *</label>
              <textarea
                value={form.historia}
                onChange={(e) => setForm({ ...form, historia: e.target.value })}
                placeholder="Fale um pouco sobre você, sua família, seu trabalho..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Situação */}
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">Por que você precisa de ajuda? *</label>
              <textarea
                value={form.situacao}
                onChange={(e) => setForm({ ...form, situacao: e.target.value })}
                placeholder="Descreva sua situação atual e como uma doação poderia te ajudar..."
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/50 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator />

      {/* Dynamic Step Content */}
      {renderStepContent()}

      {/* Erro */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Avançar
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 hover:from-yellow-400 hover:via-red-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Enviar meu Sonho
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
