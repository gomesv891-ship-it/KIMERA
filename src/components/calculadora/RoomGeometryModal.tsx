import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CornerDownRight,
  Plus,
  Ruler,
  Shapes,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useFenixTheme } from '../../utils/themeService';
import {
  FloorplanRoom,
  formatPtBrNumber,
  formatQuickInputNumber,
  parsePtBrDimension,
} from '../../utils/floorplanCalculator';
import {
  FloorplanRoomShape,
  IrregularDiagonalSpec,
  IrregularGeometryMethod,
  IrregularRoomGeometryData,
  IrregularTurnDirection,
  IrregularWallSegment,
  buildRectangularPolygonPreview,
  createDefaultIrregularSegments,
  solveIrregularRoomGeometry,
  syncDiagonalsForSegmentCount,
} from '../../utils/irregularRoomGeometry';
import { IrregularRoomPreviewSvg } from './IrregularRoomPreviewSvg';

interface RoomGeometryModalProps {
  isOpen: boolean;
  editingRoom: FloorplanRoom | null;
  defaultRoomName: string;
  onClose: () => void;
  onSave: (savedRoom: FloorplanRoom) => void;
}

interface SegmentInputDraft {
  length: string;
  angle: string;
}

const TURN_OPTIONS: { value: IrregularTurnDirection; label: string }[] = [
  { value: 'pending', label: 'Selecione a curva...' },
  { value: 'right_90', label: '90° Direita (↪)' },
  { value: 'left_90', label: '90° Esquerda (↩)' },
  { value: 'right_angle', label: 'Outro ângulo — Direita (°)' },
  { value: 'left_angle', label: 'Outro ângulo — Esquerda (°)' },
];

export const RoomGeometryModal: React.FC<RoomGeometryModalProps> = ({
  isOpen,
  editingRoom,
  defaultRoomName,
  onClose,
  onSave,
}) => {
  const { theme } = useFenixTheme('crm');
  const crm = theme.crm;

  const [shapeType, setShapeType] = useState<FloorplanRoomShape>('rectangular');
  const [roomName, setRoomName] = useState<string>('');

  // Rectangular fields
  const [rectWidth, setRectWidth] = useState<string>('');
  const [rectLength, setRectLength] = useState<string>('');

  // Irregular fields
  const [irregularMethod, setIrregularMethod] = useState<IrregularGeometryMethod>('angles');
  const [segments, setSegments] = useState<IrregularWallSegment[]>(() =>
    createDefaultIrregularSegments(4)
  );
  const [segmentDrafts, setSegmentDrafts] = useState<Record<string, SegmentInputDraft>>({});
  const [diagonals, setDiagonals] = useState<IrregularDiagonalSpec[]>([]);
  const [diagonalDrafts, setDiagonalDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (editingRoom) {
      setRoomName(editingRoom.name || defaultRoomName);

      if (editingRoom.shapeType === 'irregular' && editingRoom.irregularData) {
        setShapeType('irregular');
        const loadedMethod = editingRoom.irregularData.method || 'angles';
        const loadedSegments =
          editingRoom.irregularData.segments.length >= 3
            ? editingRoom.irregularData.segments.map((s) => ({ ...s }))
            : createDefaultIrregularSegments(4);
        const loadedDiags = syncDiagonalsForSegmentCount(
          loadedSegments.length,
          editingRoom.irregularData.diagonals || []
        );

        const nextSegDrafts: Record<string, SegmentInputDraft> = {};
        for (const s of loadedSegments) {
          nextSegDrafts[s.id] = {
            length: s.lengthMeters !== null ? formatQuickInputNumber(s.lengthMeters) : '',
            angle:
              typeof s.angleDegrees === 'number' && s.angleDegrees > 0
                ? String(s.angleDegrees).replace('.', ',')
                : '',
          };
        }

        const nextDiagDrafts: Record<string, string> = {};
        for (const d of loadedDiags) {
          nextDiagDrafts[d.id] =
            d.lengthMeters !== null ? formatQuickInputNumber(d.lengthMeters) : '';
        }

        setIrregularMethod(loadedMethod);
        setSegments(loadedSegments);
        setSegmentDrafts(nextSegDrafts);
        setDiagonals(loadedDiags);
        setDiagonalDrafts(nextDiagDrafts);
        setRectWidth('');
        setRectLength('');
      } else {
        setShapeType('rectangular');
        setRectWidth(
          editingRoom.widthMeters !== null ? formatQuickInputNumber(editingRoom.widthMeters) : ''
        );
        setRectLength(
          editingRoom.lengthMeters !== null ? formatQuickInputNumber(editingRoom.lengthMeters) : ''
        );
        const defaults = createDefaultIrregularSegments(4);
        setIrregularMethod('angles');
        setSegments(defaults);
        setSegmentDrafts({});
        setDiagonals(syncDiagonalsForSegmentCount(defaults.length, []));
        setDiagonalDrafts({});
      }
    } else {
      setShapeType('rectangular');
      setRoomName(defaultRoomName);
      setRectWidth('');
      setRectLength('');
      const defaults = createDefaultIrregularSegments(4);
      setIrregularMethod('angles');
      setSegments(defaults);
      setSegmentDrafts({});
      setDiagonals(syncDiagonalsForSegmentCount(defaults.length, []));
      setDiagonalDrafts({});
    }
  }, [isOpen, editingRoom, defaultRoomName]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const parsedRectW = useMemo(() => parsePtBrDimension(rectWidth), [rectWidth]);
  const parsedRectL = useMemo(() => parsePtBrDimension(rectLength), [rectLength]);

  const irregularData: IrregularRoomGeometryData = useMemo(
    () => ({
      method: irregularMethod,
      segments,
      diagonals,
    }),
    [irregularMethod, segments, diagonals]
  );

  const solvedGeometry = useMemo(() => {
    if (shapeType === 'rectangular') {
      return buildRectangularPolygonPreview(parsedRectW, parsedRectL);
    }
    return solveIrregularRoomGeometry(irregularData);
  }, [shapeType, parsedRectW, parsedRectL, irregularData]);

  if (!isOpen) return null;

  const updateSegmentsAndDiagonals = (nextSegs: IrregularWallSegment[]) => {
    setSegments(nextSegs);
    const syncedDiags = syncDiagonalsForSegmentCount(nextSegs.length, diagonals);
    setDiagonals(syncedDiags);
  };

  const handleAddSegment = () => {
    const newSeg: IrregularWallSegment = {
      id: `seg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      lengthMeters: null,
      turn: 'pending',
      angleDegrees: null,
    };
    updateSegmentsAndDiagonals([...segments, newSeg]);
  };

  const handleRemoveSegment = (id: string) => {
    if (segments.length <= 3) return;
    updateSegmentsAndDiagonals(segments.filter((s) => s.id !== id));
    setSegmentDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleMoveSegment = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= segments.length) return;
    const copy = [...segments];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    // Se o trecho movido virou o Trecho 1 (índice 0), zera curva dele pois passa a ser a base inicial
    if (copy[0].turn !== 'pending') {
      copy[0] = { ...copy[0], turn: 'pending', angleDegrees: null };
    }
    updateSegmentsAndDiagonals(copy);
  };

  const handleSegmentLengthChange = (id: string, raw: string) => {
    const parsed = raw.trim() === '' ? null : parsePtBrDimension(raw);
    setSegmentDrafts((prev) => ({
      ...prev,
      [id]: {
        length: raw,
        angle: prev[id]?.angle ?? '',
      },
    }));
    setSegments((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, lengthMeters: parsed !== null && parsed > 0 ? parsed : null }
          : s
      )
    );
  };

  const handleSegmentTurnChange = (id: string, turn: IrregularTurnDirection) => {
    setSegments((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              turn,
              angleDegrees:
                turn === 'right_angle' || turn === 'left_angle' ? s.angleDegrees ?? null : null,
            }
          : s
      )
    );
  };

  const handleSegmentAngleChange = (id: string, raw: string) => {
    const parsed = raw.trim() === '' ? null : parsePtBrDimension(raw);
    setSegmentDrafts((prev) => ({
      ...prev,
      [id]: {
        length: prev[id]?.length ?? '',
        angle: raw,
      },
    }));
    setSegments((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              angleDegrees: parsed !== null && parsed > 0 && parsed < 180 ? parsed : null,
            }
          : s
      )
    );
  };

  const handleApplyRight90ToPending = () => {
    setSegments((prev) =>
      prev.map((s, idx) =>
        idx > 0 && s.turn === 'pending' ? { ...s, turn: 'right_90', angleDegrees: null } : s
      )
    );
  };

  const handleDiagonalLengthChange = (diagId: string, raw: string) => {
    const parsed = raw.trim() === '' ? null : parsePtBrDimension(raw);
    setDiagonalDrafts((prev) => ({
      ...prev,
      [diagId]: raw,
    }));
    setDiagonals((prev) =>
      prev.map((d) =>
        d.id === diagId
          ? { ...d, lengthMeters: parsed !== null && parsed > 0 ? parsed : null }
          : d
      )
    );
  };

  const handleToggleDiagonalReflex = (diagId: string) => {
    setDiagonals((prev) =>
      prev.map((d) => (d.id === diagId ? { ...d, reflex: !d.reflex } : d))
    );
  };

  const canSave =
    roomName.trim().length > 0 &&
    solvedGeometry.isComplete &&
    solvedGeometry.areaSqm !== null &&
    solvedGeometry.areaSqm > 0 &&
    solvedGeometry.perimeterMeters > 0;

  const handleConfirmSave = () => {
    if (!canSave) return;
    const cleanName = roomName.trim();
    const baseId =
      editingRoom?.id || `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (shapeType === 'rectangular') {
      onSave({
        id: baseId,
        name: cleanName,
        widthMeters: parsedRectW,
        lengthMeters: parsedRectL,
        manualAreaSqm: null,
        manualPerimeterMeters: null,
        selected: editingRoom ? editingRoom.selected : true,
        shapeType: 'rectangular',
      });
      return;
    }

    onSave({
      id: baseId,
      name: cleanName,
      widthMeters: null,
      lengthMeters: null,
      manualAreaSqm: solvedGeometry.areaSqm,
      manualPerimeterMeters: solvedGeometry.perimeterMeters,
      selected: editingRoom ? editingRoom.selected : true,
      shapeType: 'irregular',
      irregularData: {
        method: irregularMethod,
        segments: segments.map((s) => ({ ...s })),
        diagonals: irregularMethod === 'diagonals' ? diagonals.map((d) => ({ ...d })) : [],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center">
      <div
        className="w-full max-w-5xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: crm.cardBg,
          borderColor: crm.cardBorder,
        }}
      >
        {/* Cabeçalho */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
          style={{
            backgroundColor: crm.cardTintBg,
            borderColor: crm.dividerColor,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: crm.indicatorBg,
                color: crm.indicatorText,
              }}
            >
              <Ruler className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3
                className="text-base sm:text-lg font-extrabold tracking-tight truncate"
                style={{ color: crm.highlightText }}
              >
                {editingRoom ? 'Editar Ambiente' : 'Adicionar Ambiente'}
              </h3>
              <p className="text-xs text-slate-500">
                Escolha entre ambiente retangular ou formato diferente (irregular) com pré-visualização em escala.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
            style={{
              backgroundColor: crm.cardBg,
              borderColor: crm.cardBorder,
            }}
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          {/* Seletor de Tipo: RETANGULAR vs FORMATO DIFERENTE (IRREGULAR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShapeType('rectangular')}
              className="rounded-2xl border p-3.5 text-left flex items-center gap-3 transition-all cursor-pointer"
              style={{
                backgroundColor: shapeType === 'rectangular' ? crm.cardTintBg : crm.panelSubtleBg,
                borderColor: shapeType === 'rectangular' ? crm.primary : crm.cardBorder,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: shapeType === 'rectangular' ? crm.primary : crm.cardBg,
                  color: shapeType === 'rectangular' ? '#ffffff' : '#64748b',
                  border: shapeType === 'rectangular' ? 'none' : `1px solid ${crm.cardBorder}`,
                }}
              >
                <Square className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-extrabold uppercase tracking-wide"
                  style={{
                    color: shapeType === 'rectangular' ? crm.primary : crm.highlightText,
                  }}
                >
                  Retangular
                </p>
                <p className="text-[11px] text-slate-500">
                  Informe Largura × Comprimento com cálculo imediato.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShapeType('irregular')}
              className="rounded-2xl border p-3.5 text-left flex items-center gap-3 transition-all cursor-pointer"
              style={{
                backgroundColor: shapeType === 'irregular' ? crm.cardTintBg : crm.panelSubtleBg,
                borderColor: shapeType === 'irregular' ? crm.primary : crm.cardBorder,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: shapeType === 'irregular' ? crm.primary : crm.cardBg,
                  color: shapeType === 'irregular' ? '#ffffff' : '#64748b',
                  border: shapeType === 'irregular' ? 'none' : `1px solid ${crm.cardBorder}`,
                }}
              >
                <Shapes className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-extrabold uppercase tracking-wide"
                  style={{
                    color: shapeType === 'irregular' ? crm.primary : crm.highlightText,
                  }}
                >
                  Formato Diferente (Irregular)
                </p>
                <p className="text-[11px] text-slate-500">
                  Informe os trechos das paredes na sequência do contorno + ângulos ou diagonais.
                </p>
              </div>
            </button>
          </div>

          {/* Grid Lado a Lado: Medidas (Esquerda) + Pré-visualização e Resultado (Direita) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* COLUNA ESQUERDA — ENTRADA DE MEDIDAS */}
            <div className="lg:col-span-7 space-y-4">
              {/* Nome do Ambiente */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: crm.highlightText }}
                >
                  Nome do Ambiente
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Ex.: Sala em L, Quarto Master, Varanda..."
                  className="w-full h-11 rounded-xl border px-3.5 text-sm font-bold outline-none"
                  style={{
                    backgroundColor: crm.inputBg,
                    borderColor: crm.inputBorder,
                    color: crm.highlightText,
                  }}
                />
              </div>

              {shapeType === 'rectangular' ? (
                <div
                  className="rounded-2xl border p-4 space-y-4"
                  style={{
                    backgroundColor: crm.panelSubtleBg,
                    borderColor: crm.cardBorder,
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Dimensões Retangulares
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">
                        Largura (metros)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rectWidth}
                        onChange={(e) => setRectWidth(e.target.value)}
                        placeholder="Ex.: 3,50"
                        className="w-full h-11 rounded-xl border px-3.5 text-sm font-bold text-center outline-none tabular-nums"
                        style={{
                          backgroundColor: crm.inputBg,
                          borderColor: crm.inputBorder,
                          color: crm.highlightText,
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">
                        Comprimento (metros)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rectLength}
                        onChange={(e) => setRectLength(e.target.value)}
                        placeholder="Ex.: 4,20"
                        className="w-full h-11 rounded-xl border px-3.5 text-sm font-bold text-center outline-none tabular-nums"
                        style={{
                          backgroundColor: crm.inputBg,
                          borderColor: crm.inputBorder,
                          color: crm.highlightText,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Seletor de método geométrico quando há 4+ lados */}
                  {segments.length >= 4 && (
                    <div
                      className="rounded-2xl border p-3 flex flex-wrap items-center justify-between gap-2"
                      style={{
                        backgroundColor: crm.panelSubtleBg,
                        borderColor: crm.cardBorder,
                      }}
                    >
                      <span className="text-xs font-bold text-slate-600">
                        Como definir a geometria:
                      </span>
                      <div className="flex items-center gap-1.5 p-1 rounded-xl border" style={{ backgroundColor: crm.cardBg, borderColor: crm.cardBorder }}>
                        <button
                          type="button"
                          onClick={() => setIrregularMethod('angles')}
                          className="h-8 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                          style={{
                            backgroundColor:
                              irregularMethod === 'angles' ? crm.primary : 'transparent',
                            color: irregularMethod === 'angles' ? '#ffffff' : '#475569',
                          }}
                        >
                          Curvas / Ângulos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIrregularMethod('diagonals');
                            setDiagonals((prev) =>
                              syncDiagonalsForSegmentCount(segments.length, prev)
                            );
                          }}
                          className="h-8 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                          style={{
                            backgroundColor:
                              irregularMethod === 'diagonals' ? crm.primary : 'transparent',
                            color: irregularMethod === 'diagonals' ? '#ffffff' : '#475569',
                          }}
                        >
                          Diagonais (Triangulação)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista sequencial de trechos das paredes */}
                  <div
                    className="rounded-2xl border p-4 space-y-3"
                    style={{
                      backgroundColor: crm.panelSubtleBg,
                      borderColor: crm.cardBorder,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4
                          className="text-xs font-extrabold uppercase tracking-wider"
                          style={{ color: crm.highlightText }}
                        >
                          Trechos das Paredes ({segments.length})
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Preencha cada parede em ordem contínua ao redor do ambiente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSegment}
                        className="h-8 px-3 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0"
                        style={{ backgroundColor: crm.primary }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Trecho</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                      {segments.map((seg, idx) => {
                        const draft = segmentDrafts[seg.id] || {
                          length:
                            seg.lengthMeters !== null
                              ? formatQuickInputNumber(seg.lengthMeters)
                              : '',
                          angle:
                            typeof seg.angleDegrees === 'number'
                              ? String(seg.angleDegrees).replace('.', ',')
                              : '',
                        };
                        const isCustomAngle =
                          seg.turn === 'right_angle' || seg.turn === 'left_angle';

                        return (
                          <div
                            key={seg.id}
                            className="rounded-xl border p-2.5 flex flex-wrap items-center gap-2"
                            style={{
                              backgroundColor: crm.cardBg,
                              borderColor: crm.cardBorder,
                            }}
                          >
                            {/* Ordem */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className="w-7 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold tabular-nums"
                                style={{
                                  backgroundColor: crm.indicatorBg,
                                  color: crm.indicatorText,
                                }}
                              >
                                {idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSegment(idx, -1)}
                                  disabled={idx === 0}
                                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                                  title="Mover trecho para cima"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSegment(idx, 1)}
                                  disabled={idx === segments.length - 1}
                                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                                  title="Mover trecho para baixo"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Comprimento em metros */}
                            <div className="w-28 shrink-0">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={draft.length}
                                onChange={(e) =>
                                  handleSegmentLengthChange(seg.id, e.target.value)
                                }
                                placeholder="Comp. (m)"
                                aria-label={`Comprimento do trecho ${idx + 1} em metros`}
                                className="w-full h-9 rounded-lg border px-2 text-xs font-bold text-center outline-none tabular-nums"
                                style={{
                                  backgroundColor: crm.inputBg,
                                  borderColor: crm.inputBorder,
                                  color: crm.highlightText,
                                }}
                              />
                            </div>

                            {/* Direção / Ângulo (modo Ângulos) */}
                            {irregularMethod === 'angles' && (
                              <div className="flex-1 min-w-[165px] flex items-center gap-1.5">
                                {idx === 0 ? (
                                  <span className="text-[11px] font-semibold text-slate-500 px-2">
                                    Parede inicial (base)
                                  </span>
                                ) : segments.length === 3 &&
                                  segments.slice(1).every((s) => s.turn === 'pending') ? (
                                  <span className="text-[11px] font-semibold text-slate-500 px-2">
                                    Fechamento triangular automático (3 lados)
                                  </span>
                                ) : (
                                  <>
                                    <select
                                      value={seg.turn}
                                      onChange={(e) =>
                                        handleSegmentTurnChange(
                                          seg.id,
                                          e.target.value as IrregularTurnDirection
                                        )
                                      }
                                      className="flex-1 h-9 rounded-lg border px-2 text-xs font-semibold outline-none cursor-pointer"
                                      style={{
                                        backgroundColor: crm.inputBg,
                                        borderColor:
                                          seg.turn === 'pending'
                                            ? '#f59e0b'
                                            : crm.inputBorder,
                                        color: crm.highlightText,
                                      }}
                                    >
                                      {TURN_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>

                                    {isCustomAngle && (
                                      <div className="relative w-20 shrink-0">
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={draft.angle}
                                          onChange={(e) =>
                                            handleSegmentAngleChange(seg.id, e.target.value)
                                          }
                                          placeholder="Graus"
                                          className="w-full h-9 rounded-lg border pl-2 pr-5 text-xs font-bold text-center outline-none tabular-nums"
                                          style={{
                                            backgroundColor: crm.inputBg,
                                            borderColor: crm.inputBorder,
                                            color: crm.highlightText,
                                          }}
                                        />
                                        <span className="text-[11px] font-bold text-slate-400 absolute right-1.5 top-2 pointer-events-none">
                                          °
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            {irregularMethod === 'diagonals' && (
                              <span className="flex-1 text-[11px] font-medium text-slate-500 px-1">
                                Parede V{idx + 1} → V{idx + 1 === segments.length ? 1 : idx + 2}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveSegment(seg.id)}
                              disabled={segments.length <= 3}
                              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-25 cursor-pointer shrink-0"
                              title={
                                segments.length <= 3
                                  ? 'Mínimo de 3 trechos para formar um ambiente'
                                  : 'Remover trecho'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Atalho explícito quando 4+ trechos estão sem ângulo */}
                    {irregularMethod === 'angles' &&
                      segments.length >= 4 &&
                      segments.slice(1).some((s) => s.turn === 'pending') && (
                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={handleApplyRight90ToPending}
                            className="h-8 px-3 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                            style={{
                              backgroundColor: crm.cardBg,
                              borderColor: crm.cardTintBorder,
                              color: crm.primary,
                            }}
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Aplicar 90° Direita nos pendentes</span>
                          </button>

                          <span className="text-[11px] text-slate-500">
                            Ou altere para <strong>Diagonais (Triangulação)</strong> acima.
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Diagonais de Referência (quando método = diagonals e 4+ lados) */}
                  {irregularMethod === 'diagonals' && diagonals.length > 0 && (
                    <div
                      className="rounded-2xl border p-4 space-y-3"
                      style={{
                        backgroundColor: crm.panelSubtleBg,
                        borderColor: crm.cardBorder,
                      }}
                    >
                      <div>
                        <h4
                          className="text-xs font-extrabold uppercase tracking-wider"
                          style={{ color: crm.highlightText }}
                        >
                          Diagonais / Medidas de Referência
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Meça do canto V1 até os vértices opostos indicados para fixar a geometria real.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {diagonals.map((diag, dIdx) => (
                          <div
                            key={diag.id}
                            className="rounded-xl border p-2.5 flex items-center justify-between gap-2"
                            style={{
                              backgroundColor: crm.cardBg,
                              borderColor: crm.cardBorder,
                            }}
                          >
                            <div className="min-w-0">
                              <p
                                className="text-xs font-bold"
                                style={{ color: crm.highlightText }}
                              >
                                Diagonal D{dIdx + 1} (V{diag.fromVertex} ↔ V{diag.toVertex})
                              </p>
                              <button
                                type="button"
                                onClick={() => handleToggleDiagonalReflex(diag.id)}
                                className="text-[10px] font-semibold hover:underline cursor-pointer"
                                style={{ color: crm.primary }}
                              >
                                {diag.reflex ? 'Sentido: interno (concavo)' : 'Sentido: padrão (convexo)'}
                              </button>
                            </div>

                            <input
                              type="text"
                              inputMode="decimal"
                              value={diagonalDrafts[diag.id] ?? ''}
                              onChange={(e) =>
                                handleDiagonalLengthChange(diag.id, e.target.value)
                              }
                              placeholder="Metros"
                              className="w-24 h-9 rounded-lg border px-2 text-xs font-bold text-center outline-none tabular-nums shrink-0"
                              style={{
                                backgroundColor: crm.inputBg,
                                borderColor: crm.inputBorder,
                                color: crm.highlightText,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUNA DIREITA — PRÉ-VISUALIZAÇÃO + RESULTADO DO CÁLCULO */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: crm.highlightText }}
                  >
                    Pré-visualização do Formato
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Escala proporcional
                  </span>
                </div>

                <IrregularRoomPreviewSvg
                  solved={solvedGeometry}
                  showVertexLabels={
                    shapeType === 'irregular' &&
                    irregularMethod === 'diagonals' &&
                    segments.length >= 4
                  }
                  emptyHint={
                    shapeType === 'rectangular'
                      ? 'Informe largura e comprimento para visualizar o ambiente em escala.'
                      : 'Informe os trechos das paredes e suas curvas ou diagonais para visualizar o formato.'
                  }
                />
              </div>

              {/* Painel de Resultado do Cálculo */}
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{
                  backgroundColor: solvedGeometry.isComplete
                    ? crm.cardTintBg
                    : crm.panelSubtleBg,
                  borderColor: solvedGeometry.isComplete
                    ? crm.cardTintBorder
                    : crm.cardBorder,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider"
                    style={{ color: crm.highlightText }}
                  >
                    Resultado do Cálculo
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      solvedGeometry.isComplete ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {solvedGeometry.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{solvedGeometry.statusLabel}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-xl border p-3"
                    style={{
                      backgroundColor: crm.cardBg,
                      borderColor: crm.cardBorder,
                    }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Área Calculada
                    </p>
                    <p
                      className="text-lg font-black tabular-nums mt-0.5"
                      style={{
                        color:
                          solvedGeometry.areaSqm !== null ? crm.primary : '#94a3b8',
                      }}
                    >
                      {solvedGeometry.areaSqm !== null
                        ? `${formatPtBrNumber(solvedGeometry.areaSqm)} m²`
                        : '—'}
                    </p>
                  </div>

                  <div
                    className="rounded-xl border p-3"
                    style={{
                      backgroundColor: crm.cardBg,
                      borderColor: crm.cardBorder,
                    }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Perímetro Calculado
                    </p>
                    <p
                      className="text-lg font-black tabular-nums mt-0.5"
                      style={{ color: crm.highlightText }}
                    >
                      {solvedGeometry.perimeterMeters > 0
                        ? `${formatPtBrNumber(solvedGeometry.perimeterMeters)} ml`
                        : '—'}
                    </p>
                  </div>
                </div>

                {solvedGeometry.missingReasons.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 space-y-1">
                    {solvedGeometry.missingReasons.map((reason, rIdx) => (
                      <p key={rIdx} className="leading-relaxed">
                        {reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com CANCELAR e SALVAR AMBIENTE */}
        <div
          className="px-5 py-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0"
          style={{
            backgroundColor: crm.cardBg,
            borderColor: crm.dividerColor,
          }}
        >
          <p className="text-xs text-slate-500">
            {canSave
              ? 'Área e perímetro prontos para alimentar Piso Vinílico e Rodapés.'
              : 'Complete todas as medidas e validações do contorno para salvar.'}
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border text-xs font-extrabold uppercase tracking-wide cursor-pointer"
              style={{
                backgroundColor: crm.cardBg,
                borderColor: crm.cardBorder,
                color: crm.highlightText,
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={!canSave}
              className="h-10 px-5 rounded-xl text-xs font-extrabold uppercase tracking-wide text-white flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-45 disabled:cursor-not-allowed"
              style={{ backgroundColor: crm.primary }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Ambiente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
