import React, { useEffect, useMemo, useState } from 'react';
import {
  Palette,
  Eye,
  Check,
  RotateCcw,
  Calendar,
  Monitor,
  FileText,
  FileDown,
  Sliders,
  X,
  Clock,
} from 'lucide-react';
import {
  ALL_THEME_IDS,
  CustomThemeConfig,
  FenixThemeId,
  FenixThemeScope,
  FenixThemeState,
  activateTheme,
  deactivateTheme,
  getEffectiveActiveThemeId,
  getPreviewThemeId,
  getScheduleStatus,
  getThemeDefinition,
  getThemeState,
  saveThemeState,
  setPreviewTheme,
  THEME_UPDATED_EVENT,
} from '../utils/themeService';
import { EspelhoOrcamento, EspelhoItem } from './EspelhoOrcamento';
import { FenixOfficialLogo } from './FenixOfficialLogo';

interface TemasDecoracoesSectionProps {
  onShowToast?: (msg: string) => void;
}

const SAMPLE_BUDGET_ITEMS: EspelhoItem[] = [
  {
    id: 'sample_1',
    qtd: '22,80',
    descricao: 'Piso FLEXFLOOR PREMIUM 2mm (capa 0,20mm) [cx 5,70m²] - NOVA LINHA',
    subtitulo: '4 CAIXAS',
    unidade: 'm²',
    precoUnitario: 59.9,
    total: 1365.72,
  },
  {
    id: 'sample_2',
    qtd: '6',
    descricao: 'Autonivelante FLEXFLOOR Secagem 12h - 20Kg',
    unidade: 'saco(s)',
    precoUnitario: 79.9,
    total: 479.4,
  },
  {
    id: 'sample_3',
    qtd: '1',
    descricao: 'Primer para Autonivelante Flexfloor (3,6L) Base e Sobreposição',
    unidade: 'balde(s)',
    precoUnitario: 79.9,
    total: 79.9,
  },
  {
    id: 'sample_4',
    qtd: '2',
    descricao: 'Cola para Piso Vinílico FlexFloor Super Tack (4KG)',
    unidade: 'balde(s)',
    precoUnitario: 99.9,
    total: 199.8,
  },
];

export const TemasDecoracoesSection: React.FC<TemasDecoracoesSectionProps> = ({
  onShowToast,
}) => {
  const [themeState, setThemeState] = useState<FenixThemeState>(() => getThemeState());
  const [previewId, setPreviewIdState] = useState<FenixThemeId | null>(() =>
    getPreviewThemeId()
  );
  const [customDraft, setCustomDraft] = useState<CustomThemeConfig>(
    () => getThemeState().customTheme
  );
  const [showBudgetPreview, setShowBudgetPreview] = useState<boolean>(true);
  const [inspectedBudgetTheme, setInspectedBudgetTheme] = useState<FenixThemeId | null>(null);

  useEffect(() => {
    const sync = () => {
      const latest = getThemeState();
      setThemeState(latest);
      setCustomDraft(latest.customTheme);
      setPreviewIdState(getPreviewThemeId());
    };
    window.addEventListener(THEME_UPDATED_EVENT, sync);
    window.addEventListener('fenix_offline_hydrated', sync);
    window.addEventListener('fenix_auth_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(THEME_UPDATED_EVENT, sync);
      window.removeEventListener('fenix_offline_hydrated', sync);
      window.removeEventListener('fenix_auth_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const effectiveId = useMemo(
    () => getEffectiveActiveThemeId(themeState),
    [themeState, previewId]
  );
  const scheduleStatus = useMemo(() => getScheduleStatus(themeState), [themeState]);
  const effectiveDef = useMemo(
    () => getThemeDefinition(effectiveId, customDraft),
    [effectiveId, customDraft]
  );

  const budgetInspectionId: FenixThemeId =
    inspectedBudgetTheme || previewId || effectiveId;

  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const handleActivate = (id: FenixThemeId) => {
    if (id === 'personalizado') {
      saveThemeState({ customTheme: customDraft });
    }
    const updated = activateTheme(id);
    setThemeState(updated);
    setPreviewIdState(null);
    setInspectedBudgetTheme(id);
    const def = getThemeDefinition(id, customDraft);
    notify(`Tema "${def.name}" ativado com sucesso!`);
  };

  const handlePreview = (id: FenixThemeId) => {
    if (previewId === id) {
      setPreviewTheme(null);
      setPreviewIdState(null);
      setInspectedBudgetTheme(null);
      notify('Pré-visualização encerrada.');
      return;
    }
    setPreviewTheme(id, id === 'personalizado' ? customDraft : undefined);
    setPreviewIdState(id);
    setInspectedBudgetTheme(id);
    const def = getThemeDefinition(id, customDraft);
    notify(`Pré-visualizando "${def.name}". Clique em "Ativar tema" para aplicar.`);
  };

  const handleDeactivate = () => {
    const updated = deactivateTheme();
    setThemeState(updated);
    setPreviewIdState(null);
    setInspectedBudgetTheme('padrao');
    notify('Tema sazonal desativado. Modelo PREMIUM restaurado.');
  };

  const handleUpdateOption = (patch: Partial<FenixThemeState>) => {
    const updated = saveThemeState(patch);
    setThemeState(updated);
  };

  const handleScopeChange = (scope: FenixThemeScope) => {
    const updated = saveThemeState({
      scope,
      applyToSystem: scope === 'crm' || scope === 'ambos',
      applyToBudgets: scope === 'orcamentos' || scope === 'ambos',
    });
    setThemeState(updated);
    notify(
      scope === 'crm'
        ? 'Aplicação definida somente para o CRM.'
        : scope === 'orcamentos'
          ? 'Aplicação definida somente para os orçamentos.'
          : 'Aplicação definida para o CRM e os orçamentos.'
    );
  };

  const handleSaveCustomColors = (andActivate = false) => {
    const updated = saveThemeState({ customTheme: { ...customDraft, motif: 'nenhum' } });
    setThemeState(updated);
    if (andActivate) {
      handleActivate('personalizado');
    } else {
      setPreviewTheme('personalizado', { ...customDraft, motif: 'nenhum' });
      setPreviewIdState('personalizado');
      setInspectedBudgetTheme('personalizado');
      notify('Cores personalizadas aplicadas na pré-visualização.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* CABEÇALHO E STATUS DO TEMA ATUAL                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Temas e Decorações
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
                Todos os temas mantêm exatamente a estrutura oficial do modelo <strong>PREMIUM</strong>, substituindo exclusivamente as cores no CRM, orçamentos, impressão e PDFs, preservando integralmente a logo oficial da Fênix World.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {previewId && (
              <button
                type="button"
                onClick={() => {
                  setPreviewTheme(null);
                  setPreviewIdState(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>Sair da Pré-visualização</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={themeState.activeThemeId === 'padrao' && !themeState.autoScheduleEnabled && !previewId}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Tema PREMIUM</span>
            </button>
          </div>
        </div>

        {/* Barra de Estado Atual */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center -space-x-1 flex-shrink-0">
              {effectiveDef.paletteSwatches.map((hex, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-2xs"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>
                  {previewId ? 'Pré-visualizando:' : 'Tema em vigor:'}{' '}
                  <strong>{effectiveDef.name}</strong>
                </span>
                {previewId && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                    Prévia temporária
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {scheduleStatus.statusLabel} • Estrutura PREMIUM fixa com adaptação exclusiva de cores e logo original protegida
              </p>
            </div>
          </div>

          {/* Destino de Aplicação */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            {(
              [
                { id: 'crm', label: 'Somente no CRM' },
                { id: 'orcamentos', label: 'Somente nos Orçamentos' },
                { id: 'ambos', label: 'CRM e Orçamentos' },
              ] as { id: FenixThemeScope; label: string }[]
            ).map((opt) => {
              const selected = themeState.scope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleScopeChange(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selected
                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CONTROLES DE APLICAÇÃO E AGENDAMENTO AUTOMÁTICO          */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Bloco Esquerdo: Controles de Aplicação */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Sliders className="w-4 h-4 text-[#1D4ED8]" />
              <span>Controles de Aplicação e PDFs</span>
            </div>

            <div className="divide-y divide-slate-100">
              <label className="py-2.5 flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Aplicar paleta no sistema (CRM)</div>
                    <div className="text-[11px] text-slate-500">Cabeçalho, menu lateral, botões, abas, cards e tabelas</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={themeState.applyToSystem}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const nextScope: FenixThemeScope =
                      checked && themeState.applyToBudgets
                        ? 'ambos'
                        : checked
                          ? 'crm'
                          : 'orcamentos';
                    handleUpdateOption({ applyToSystem: checked, scope: nextScope });
                  }}
                  className="w-4 h-4 rounded text-[#1D4ED8] cursor-pointer"
                />
              </label>

              <label className="py-2.5 flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Aplicar paleta nos orçamentos</div>
                    <div className="text-[11px] text-slate-500">Substitui exclusivamente as cores mantendo o layout PREMIUM exato</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={themeState.applyToBudgets}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const nextScope: FenixThemeScope =
                      themeState.applyToSystem && checked
                        ? 'ambos'
                        : checked
                          ? 'orcamentos'
                          : 'crm';
                    handleUpdateOption({ applyToBudgets: checked, scope: nextScope });
                  }}
                  className="w-4 h-4 rounded text-[#1D4ED8] cursor-pointer"
                />
              </label>

              <label className="py-2.5 flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <FileDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Aplicar paleta nos PDFs e Impressão</div>
                    <div className="text-[11px] text-slate-500">Garante fidelidade cromática exata entre tela, imagem, impressão e PDF</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={themeState.applyToPdf}
                  onChange={(e) => handleUpdateOption({ applyToPdf: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1D4ED8] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Bloco Direito: Agendamento Automático */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                <span>Agendamento Automático por Período</span>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={themeState.autoScheduleEnabled}
                  onChange={(e) => {
                    handleUpdateOption({ autoScheduleEnabled: e.target.checked });
                    notify(
                      e.target.checked
                        ? 'Ativação automática por período habilitada.'
                        : 'Agendamento automático desativado.'
                    );
                  }}
                  className="w-4 h-4 rounded text-[#1D4ED8] cursor-pointer"
                />
                <span>Ativar automaticamente</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tema programado
                </label>
                <select
                  value={themeState.scheduledThemeId}
                  onChange={(e) =>
                    handleUpdateOption({ scheduledThemeId: e.target.value as FenixThemeId })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1D4ED8] cursor-pointer"
                >
                  {ALL_THEME_IDS.filter((id) => id !== 'padrao').map((id) => (
                    <option key={id} value={id}>
                      {getThemeDefinition(id, customDraft).name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Data de início
                </label>
                <input
                  type="date"
                  value={themeState.startDate}
                  onChange={(e) => handleUpdateOption({ startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 tabular-nums focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Data de término
                </label>
                <input
                  type="date"
                  value={themeState.endDate}
                  onChange={(e) => handleUpdateOption({ endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 tabular-nums focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{scheduleStatus.statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRADE DOS 10 CARTÕES DE TEMAS OFICIAIS                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ALL_THEME_IDS.map((themeId) => {
          const def = getThemeDefinition(themeId, customDraft);
          const isSavedActive = themeState.activeThemeId === themeId && !scheduleStatus.isWithinWindow;
          const isEffectiveActive = effectiveId === themeId && !previewId;
          const isPreviewingThis = previewId === themeId;
          const isActiveCard = isEffectiveActive || isSavedActive;

          return (
            <div
              key={themeId}
              className={`no-theme-override bg-white rounded-2xl border p-4 flex flex-col justify-between gap-4 transition-all ${
                isPreviewingThis
                  ? 'border-amber-400 ring-2 ring-amber-400/25 shadow-sm'
                  : isActiveCard
                    ? 'border-slate-900 ring-1 ring-slate-900/15 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Miniatura Ilustrativa fiel ao Modelo PREMIUM */}
                <div
                  className="rounded-xl border overflow-hidden h-36 flex bg-white"
                  style={{
                    borderColor: def.budget.outerBorder,
                    backgroundColor: def.crm.pageBg,
                  }}
                >
                  {/* Mini Sidebar */}
                  <div
                    className="w-12 p-1.5 flex flex-col justify-between flex-shrink-0"
                    style={{ backgroundColor: def.crm.sidebarBg }}
                  >
                    <div className="space-y-1">
                      <div
                        className="h-2 w-full rounded-sm"
                        style={{ backgroundColor: def.crm.primary }}
                      />
                      <div className="h-1.5 w-4/5 rounded-sm bg-white/25" />
                      <div className="h-1.5 w-3/4 rounded-sm bg-white/20" />
                    </div>
                    <div
                      className="h-1.5 w-full rounded-sm"
                      style={{ backgroundColor: def.crm.accent }}
                    />
                  </div>

                  {/* Mini Folha de Orçamento PREMIUM */}
                  <div className="flex-1 p-2 flex flex-col min-w-0">
                    <div
                      className="rounded-lg border bg-white overflow-hidden flex-1 flex flex-col justify-between shadow-2xs"
                      style={{ borderColor: def.budget.outerBorder }}
                    >
                      {/* Mini Cabeçalho Curvo PREMIUM */}
                      <div
                        className="relative h-7 flex items-center justify-between px-2 overflow-hidden"
                        style={{
                          background: `linear-gradient(90deg, ${def.budget.headerLightBgStart} 0%, ${def.budget.headerLightBgEnd} 100%)`,
                          borderBottom: `2px solid ${def.budget.headerBottomBarBg}`,
                        }}
                      >
                        <FenixOfficialLogo height={14} />
                        <div
                          className="px-2 py-0.5 rounded-l-full text-[7.5px] font-black tracking-wider uppercase whitespace-nowrap"
                          style={{
                            background: `linear-gradient(90deg, ${def.budget.headerWaveFrontStart} 0%, ${def.budget.headerWaveFrontEnd} 100%)`,
                            color: def.budget.bannerTitleColor,
                          }}
                        >
                          ORÇAMENTO
                        </div>
                      </div>

                      {/* Mini Blocos + Tabela + Total */}
                      <div className="px-2 py-1 space-y-1 flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-1">
                          <div
                            className="h-2 rounded-xs"
                            style={{ backgroundColor: def.budget.sectionHeaderBg }}
                          />
                          <div
                            className="h-2 rounded-xs"
                            style={{ backgroundColor: def.budget.sectionHeaderBg }}
                          />
                        </div>
                        <div
                          className="h-2.5 w-full rounded-xs"
                          style={{
                            background: `linear-gradient(90deg, ${def.budget.tableHeaderFrom} 0%, ${def.budget.tableHeaderTo} 100%)`,
                          }}
                        />
                        <div className="flex items-center justify-between gap-1.5">
                          <div
                            className="h-3 flex-1 rounded border bg-white"
                            style={{ borderColor: def.budget.freightBorder }}
                          />
                          <div
                            className="px-2 py-0.5 rounded text-[7.5px] font-black border whitespace-nowrap"
                            style={{
                              background: `linear-gradient(90deg, ${def.budget.totalBoxLeftStart} 0%, ${def.budget.totalBoxWaveStart} 100%)`,
                              borderColor: def.budget.totalBoxBorder,
                              color: def.budget.totalValueColor,
                            }}
                          >
                            TOTAL R$ 2.124
                          </div>
                        </div>
                      </div>

                      {/* Mini Ondas Inferiores PREMIUM */}
                      <svg
                        className="w-full h-3 block flex-shrink-0"
                        preserveAspectRatio="none"
                        viewBox="0 0 200 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M0 5 C 45 13, 100 14, 155 6 C 175 3, 190 2, 200 4 L 200 16 L 0 16 Z"
                          fill={def.budget.waveBackStart}
                          opacity="0.7"
                        />
                        <path
                          d="M0 3 C 50 12, 110 15, 165 8 C 182 5, 192 5, 200 7 L 200 16 L 0 16 Z"
                          fill={def.budget.waveMidStart}
                        />
                        <path
                          d="M0 8 C 55 15, 125 16, 180 9 C 190 8, 195 8, 200 10 L 200 16 L 0 16 Z"
                          fill={def.budget.waveFrontStart}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Título + Status + Descrição */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {def.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                      {isPreviewingThis
                        ? 'Em pré-visualização'
                        : isActiveCard
                          ? 'Ativo'
                          : def.shortTag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[32px]">
                    {def.description}
                  </p>
                </div>

                {/* Paleta de Cores */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Paleta do tema:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {def.paletteSwatches.map((hex, i) => (
                      <span
                        key={i}
                        title={hex}
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações: Pré-visualizar & Ativar tema */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handlePreview(themeId)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isPreviewingThis
                      ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isPreviewingThis ? 'Fechar Prévia' : 'Pré-visualizar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActivate(themeId)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap text-white shadow-2xs"
                  style={{
                    backgroundColor: isActiveCard ? '#16a34a' : def.crm.primary,
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isActiveCard ? 'Tema Ativo' : 'Ativar tema'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* EDITOR DO TEMA PERSONALIZADO (SOMENTE CORES / LAYOUT PREMIUM) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Editor do Tema Personalizado
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione manualmente as cores mantendo exatamente a mesma estrutura oficial PREMIUM.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveCustomColors(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pré-visualizar Personalizado</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveCustomColors(true)}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar e Ativar Personalizado</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(
            [
              { key: 'primary', label: 'Cor principal' },
              { key: 'secondary', label: 'Cor secundária' },
              { key: 'accent', label: 'Cor de destaque' },
              { key: 'headerBg', label: 'Cor dos cabeçalhos' },
              { key: 'buttonBg', label: 'Cor dos botões' },
            ] as { key: keyof Omit<CustomThemeConfig, 'motif'>; label: string }[]
          ).map((field) => (
            <div
              key={field.key}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs font-bold text-slate-800">{field.label}</div>
                <div className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">
                  {customDraft[field.key]}
                </div>
              </div>
              <input
                type="color"
                value={customDraft[field.key]}
                onChange={(e) =>
                  setCustomDraft((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5 flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* PRÉ-VISUALIZAÇÃO AO VIVO DO MODELO OFICIAL PREMIUM       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pré-visualização do Orçamento — Tema {getThemeDefinition(budgetInspectionId, customDraft).name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              O modelo PREMIUM mantém estrutura, dimensões, logo original e ondas idênticas em todos os temas, alterando somente as cores.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={budgetInspectionId}
              onChange={(e) => setInspectedBudgetTheme(e.target.value as FenixThemeId)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {ALL_THEME_IDS.map((id) => (
                <option key={id} value={id}>
                  {getThemeDefinition(id, customDraft).name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowBudgetPreview((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
            >
              {showBudgetPreview ? 'Ocultar Prévia' : 'Mostrar Prévia'}
            </button>
          </div>
        </div>

        {showBudgetPreview && (
          <div className="overflow-x-auto pb-2 pt-1">
            <EspelhoOrcamento
              id="espelho-preview-temas"
              clientName="Testando"
              clientType="Cliente Final"
              clientContact="(12) 34544-4444"
              consultoraName="Vanessa Gomes"
              dataOrcamento="18/11/2026"
              observacoes=""
              items={SAMPLE_BUDGET_ITEMS}
              freteValor={0}
              freteEndereco=""
              totalFinal={2124.82}
              previewThemeId={budgetInspectionId}
              previewCustomTheme={customDraft}
            />
          </div>
        )}
      </div>
    </div>
  );
};
