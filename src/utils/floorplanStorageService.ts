import {
  enqueueCollectionWrite,
  formatSupabaseErrorMessage,
  getLocalRawSafe,
  getSupabaseClient,
  setLocalCollectionSafe,
  withAbortableTimeout,
} from './supabaseClient';
import {
  isEmergencyOfflineMode,
  markRecordPendingSync,
  removePendingSyncRecord,
} from './indexedDbOfflineStore';
import {
  DEFAULT_FLOORPLAN_MATERIALS,
  FloorplanCalculationSummary,
  FloorplanMaterialSelections,
  FloorplanRoom,
} from './floorplanCalculator';

export const FLOORPLAN_PROJECTS_STORAGE_KEY = 'fenix_calculadora_plantas_v1';
export const FLOORPLAN_ACTIVE_DRAFT_KEY = 'fenix_calculadora_plantas_active_draft_v1';

export interface SavedFloorplanProject {
  id: string;
  name: string;
  clientId?: string;
  clientName?: string;
  clientType?: string;
  fileName: string;
  fileType: string;
  previewDataUrl: string;
  rooms: FloorplanRoom[];
  pisoLossPercent: number;
  rodapeLossPercent: number;
  materials: FloorplanMaterialSelections;
  summary: FloorplanCalculationSummary;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FloorplanActiveDraft {
  projectId: string | null;
  projectName: string;
  clientId: string;
  clientName: string;
  clientType: string;
  fileName: string;
  fileType: string;
  previewDataUrl: string;
  rooms: FloorplanRoom[];
  pisoLossPercent: number;
  rodapeLossPercent: number;
  materials: FloorplanMaterialSelections;
  updatedAt: string;
}

function normalizeIrregularData(raw: any): FloorplanRoom['irregularData'] {
  if (!raw || typeof raw !== 'object') return undefined;
  const method = raw.method === 'diagonals' ? 'diagonals' : 'angles';
  const segments = Array.isArray(raw.segments)
    ? raw.segments.map((s: any, idx: number) => ({
        id: String(s?.id || `seg_norm_${idx}`),
        lengthMeters:
          typeof s?.lengthMeters === 'number' && Number.isFinite(s.lengthMeters)
            ? s.lengthMeters
            : null,
        turn:
          s?.turn === 'right_90' ||
          s?.turn === 'left_90' ||
          s?.turn === 'right_angle' ||
          s?.turn === 'left_angle'
            ? s.turn
            : 'pending',
        angleDegrees:
          typeof s?.angleDegrees === 'number' && Number.isFinite(s.angleDegrees)
            ? s.angleDegrees
            : null,
      }))
    : [];

  const diagonals = Array.isArray(raw.diagonals)
    ? raw.diagonals.map((d: any, idx: number) => ({
        id: String(d?.id || `diag_norm_${idx}`),
        fromVertex: Number(d?.fromVertex) || 1,
        toVertex: Number(d?.toVertex) || idx + 3,
        lengthMeters:
          typeof d?.lengthMeters === 'number' && Number.isFinite(d.lengthMeters)
            ? d.lengthMeters
            : null,
        reflex: Boolean(d?.reflex),
      }))
    : [];

  return { method, segments, diagonals };
}

function normalizeRoomRecord(raw: any, index: number): FloorplanRoom {
  const shapeType = raw?.shapeType === 'irregular' ? 'irregular' : raw?.shapeType === 'rectangular' ? 'rectangular' : undefined;
  const irregularData = shapeType === 'irregular' ? normalizeIrregularData(raw?.irregularData) : undefined;

  return {
    id: String(raw?.id || `room_legacy_${index}_${Date.now()}`),
    name: String(raw?.name || `Ambiente ${index + 1}`),
    widthMeters:
      typeof raw?.widthMeters === 'number' && Number.isFinite(raw.widthMeters)
        ? raw.widthMeters
        : null,
    lengthMeters:
      typeof raw?.lengthMeters === 'number' && Number.isFinite(raw.lengthMeters)
        ? raw.lengthMeters
        : null,
    manualAreaSqm:
      typeof raw?.manualAreaSqm === 'number' && Number.isFinite(raw.manualAreaSqm)
        ? raw.manualAreaSqm
        : null,
    manualPerimeterMeters:
      typeof raw?.manualPerimeterMeters === 'number' &&
      Number.isFinite(raw.manualPerimeterMeters)
        ? raw.manualPerimeterMeters
        : null,
    selected: raw?.selected !== false,
    ...(shapeType ? { shapeType } : {}),
    ...(irregularData ? { irregularData } : {}),
  };
}

function normalizeProjectRecord(item: any): SavedFloorplanProject {
  const legacyLoss =
    typeof item?.lossMarginPercent === 'number' && Number.isFinite(item.lossMarginPercent)
      ? item.lossMarginPercent
      : 10;

  const pisoLossPercent =
    typeof item?.pisoLossPercent === 'number' && Number.isFinite(item.pisoLossPercent)
      ? item.pisoLossPercent
      : legacyLoss;

  const rodapeLossPercent =
    typeof item?.rodapeLossPercent === 'number' && Number.isFinite(item.rodapeLossPercent)
      ? item.rodapeLossPercent
      : 0;

  const rawMats = item?.materials || {};
  const materials: FloorplanMaterialSelections = {
    piso: typeof rawMats.piso === 'boolean' ? rawMats.piso : DEFAULT_FLOORPLAN_MATERIALS.piso,
    rodape: typeof rawMats.rodape === 'boolean' ? rawMats.rodape : DEFAULT_FLOORPLAN_MATERIALS.rodape,
  };

  const rooms = Array.isArray(item?.rooms)
    ? item.rooms.map((r: any, idx: number) => normalizeRoomRecord(r, idx))
    : [];

  return {
    id: String(item.id).trim(),
    name: String(item.name || item.fileName || 'Planta sem título').trim(),
    clientId: item.clientId || undefined,
    clientName: item.clientName || undefined,
    clientType: item.clientType || undefined,
    fileName: String(item.fileName || ''),
    fileType: String(item.fileType || ''),
    previewDataUrl: String(item.previewDataUrl || ''),
    rooms,
    pisoLossPercent,
    rodapeLossPercent,
    materials,
    summary: item.summary || {
      selectedRoomsCount: rooms.filter((r) => r.selected).length,
      totalRoomsCount: rooms.length,
      totalSelectedAreaSqm: 0,
      totalSelectedPerimeterMeters: 0,
      pisoLossPercent,
      rodapeLossPercent,
      pisoSqmWithLoss: 0,
      rodapeMlWithLoss: 0,
      duplicateRoomNames: [],
      roomsWithoutDimensionsCount: 0,
    },
    createdAt: String(item.createdAt || item.updatedAt || new Date().toISOString()),
    updatedAt: String(item.updatedAt || new Date().toISOString()),
    updatedBy: String(item.updatedBy || 'Usuário Fênix'),
  };
}

let memoryProjectsCache: SavedFloorplanProject[] = (() => {
  try {
    const raw = getLocalRawSafe(FLOORPLAN_PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return deduplicateProjects(parsed);
    }
  } catch {
    // ignore
  }
  return [];
})();

function deduplicateProjects(list: any[]): SavedFloorplanProject[] {
  if (!Array.isArray(list)) return [];
  const map = new Map<string, SavedFloorplanProject>();
  for (const item of list) {
    if (!item || typeof item !== 'object' || !item.id) continue;
    const normalized = normalizeProjectRecord(item);
    const existing = map.get(normalized.id);
    if (!existing) {
      map.set(normalized.id, normalized);
    } else {
      const existingTs = Date.parse(existing.updatedAt || '') || 0;
      const candidateTs = Date.parse(normalized.updatedAt || '') || 0;
      if (candidateTs >= existingTs) {
        map.set(normalized.id, normalized);
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (Date.parse(b.updatedAt || '') || 0) - (Date.parse(a.updatedAt || '') || 0)
  );
}

/**
 * Compacta uma miniatura/preview da planta para persistência segura no Supabase.
 */
export async function compressPreviewForStorage(
  dataUrl: string,
  maxDimension = 960,
  quality = 0.72
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return '';
  }
  if (dataUrl.length <= 160_000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
        const targetW = Math.max(1, Math.round((img.width || maxDimension) * scale));
        const targetH = Math.max(1, Math.round((img.height || maxDimension) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length <= 320_000 ? compressed : '');
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

export function saveActiveFloorplanDraft(draft: FloorplanActiveDraft): void {
  try {
    setLocalCollectionSafe(FLOORPLAN_ACTIVE_DRAFT_KEY, draft);
  } catch (err) {
    console.warn('Não foi possível salvar rascunho ativo da planta:', err);
  }
}

export function loadActiveFloorplanDraft(): FloorplanActiveDraft | null {
  try {
    const raw = getLocalRawSafe(FLOORPLAN_ACTIVE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const legacyLoss =
      typeof parsed.lossMarginPercent === 'number' && Number.isFinite(parsed.lossMarginPercent)
        ? parsed.lossMarginPercent
        : 10;

    return {
      projectId: parsed.projectId || null,
      projectName: String(parsed.projectName || ''),
      clientId: String(parsed.clientId || ''),
      clientName: String(parsed.clientName || ''),
      clientType: String(parsed.clientType || 'Cliente Final'),
      fileName: String(parsed.fileName || ''),
      fileType: String(parsed.fileType || ''),
      previewDataUrl: String(parsed.previewDataUrl || ''),
      rooms: Array.isArray(parsed.rooms)
        ? parsed.rooms.map((r: any, idx: number) => normalizeRoomRecord(r, idx))
        : [],
      pisoLossPercent:
        typeof parsed.pisoLossPercent === 'number' && Number.isFinite(parsed.pisoLossPercent)
          ? parsed.pisoLossPercent
          : legacyLoss,
      rodapeLossPercent:
        typeof parsed.rodapeLossPercent === 'number' && Number.isFinite(parsed.rodapeLossPercent)
          ? parsed.rodapeLossPercent
          : 5,
      materials: {
        piso:
          typeof parsed.materials?.piso === 'boolean'
            ? parsed.materials.piso
            : DEFAULT_FLOORPLAN_MATERIALS.piso,
        rodape:
          typeof parsed.materials?.rodape === 'boolean'
            ? parsed.materials.rodape
            : DEFAULT_FLOORPLAN_MATERIALS.rodape,
      },
      updatedAt: String(parsed.updatedAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

export function clearActiveFloorplanDraft(): void {
  try {
    setLocalCollectionSafe(FLOORPLAN_ACTIVE_DRAFT_KEY, null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(FLOORPLAN_ACTIVE_DRAFT_KEY);
    }
  } catch {
    // ignore
  }
}

export function getStoredFloorplanProjects(): SavedFloorplanProject[] {
  if (memoryProjectsCache.length === 0) {
    try {
      const raw = getLocalRawSafe(FLOORPLAN_PROJECTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryProjectsCache = deduplicateProjects(parsed);
        }
      }
    } catch {
      // ignore
    }
  }
  return [...memoryProjectsCache];
}

export async function loadFloorplanProjectsFromSupabase(): Promise<SavedFloorplanProject[]> {
  if (isEmergencyOfflineMode()) {
    return getStoredFloorplanProjects();
  }

  const client = getSupabaseClient();
  if (!client) {
    return getStoredFloorplanProjects();
  }

  try {
    const { data: row, error } = await withAbortableTimeout<any>(
      (signal) =>
        client
          .from('fenix_kv_store')
          .select('data')
          .eq('key', FLOORPLAN_PROJECTS_STORAGE_KEY)
          .abortSignal(signal)
          .maybeSingle(),
      12000,
      'Tempo limite ao carregar histórico da Calculadora de Plantas.'
    );

    if (error) {
      console.warn('Erro ao consultar plantas no Supabase:', error);
      return getStoredFloorplanProjects();
    }

    let remoteList: SavedFloorplanProject[] = [];
    if (row && row.data !== undefined) {
      let rData = row.data;
      if (typeof rData === 'string') {
        try {
          rData = JSON.parse(rData);
        } catch {
          rData = [];
        }
      }
      if (Array.isArray(rData)) {
        remoteList = deduplicateProjects(rData);
      }
    }

    const localList = getStoredFloorplanProjects();

    if (remoteList.length > 0 || localList.length > 0) {
      const merged = deduplicateProjects([...localList, ...remoteList]);
      memoryProjectsCache = merged;
      setLocalCollectionSafe(FLOORPLAN_PROJECTS_STORAGE_KEY, merged);

      if (remoteList.length === 0 && localList.length > 0) {
        try {
          await withAbortableTimeout<any>(
            (signal) =>
              client
                .from('fenix_kv_store')
                .upsert(
                  {
                    key: FLOORPLAN_PROJECTS_STORAGE_KEY,
                    data: merged,
                    updated_at: new Date().toISOString(),
                    updated_by: 'Sistema Fênix',
                  },
                  { onConflict: 'key' }
                )
                .select('updated_at')
                .abortSignal(signal)
                .maybeSingle(),
            12000,
            'Tempo limite ao sincronizar plantas no Supabase.'
          );
        } catch {
          // ignore
        }
      }
      return [...merged];
    }

    return [];
  } catch (err) {
    console.warn('Falha ao consultar histórico de plantas no Supabase:', err);
    return getStoredFloorplanProjects();
  }
}

export async function saveFloorplanProject(
  projectInput: Omit<SavedFloorplanProject, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'> & {
    id?: string;
    createdAt?: string;
  }
): Promise<SavedFloorplanProject> {
  const offlineMode = isEmergencyOfflineMode();
  const client = getSupabaseClient();
  const now = new Date().toISOString();
  const user =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem('fenix_active_user_name') ||
        localStorage.getItem('fenix_saved_username'))) ||
    'Usuário Fênix';

  const compactPreview = await compressPreviewForStorage(projectInput.previewDataUrl);

  return enqueueCollectionWrite(FLOORPLAN_PROJECTS_STORAGE_KEY, async () => {
    let remoteList: SavedFloorplanProject[] = [];
    if (!offlineMode && client) {
      try {
        const { data: row } = await withAbortableTimeout<any>(
          (signal) =>
            client
              .from('fenix_kv_store')
              .select('data')
              .eq('key', FLOORPLAN_PROJECTS_STORAGE_KEY)
              .abortSignal(signal)
              .maybeSingle(),
          10000,
          'Tempo limite ao verificar plantas no Supabase.'
        );
        if (row?.data) {
          const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          if (Array.isArray(parsed)) remoteList = parsed;
        }
      } catch {
        // fallback para cache local
      }
    }

    const baseList = deduplicateProjects([...getStoredFloorplanProjects(), ...remoteList]);
    const targetId = projectInput.id?.trim();
    const existing = targetId ? baseList.find((p) => p.id === targetId) : undefined;

    const savedProject: SavedFloorplanProject = {
      id:
        existing?.id ||
        targetId ||
        `planta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name:
        String(projectInput.name || '').trim() ||
        projectInput.fileName ||
        'Cálculo de Planta',
      clientId: projectInput.clientId || undefined,
      clientName: projectInput.clientName || undefined,
      clientType: projectInput.clientType || undefined,
      fileName: projectInput.fileName,
      fileType: projectInput.fileType,
      previewDataUrl: compactPreview,
      rooms: projectInput.rooms,
      pisoLossPercent: projectInput.pisoLossPercent,
      rodapeLossPercent: projectInput.rodapeLossPercent,
      materials: projectInput.materials,
      summary: projectInput.summary,
      createdAt: existing?.createdAt || projectInput.createdAt || now,
      updatedAt: now,
      updatedBy: user,
    };

    const nextList = deduplicateProjects([
      savedProject,
      ...baseList.filter((p) => p.id !== savedProject.id),
    ]).slice(0, 60);

    memoryProjectsCache = nextList;
    setLocalCollectionSafe(FLOORPLAN_PROJECTS_STORAGE_KEY, nextList);

    if (offlineMode || !client) {
      markRecordPendingSync({
        collectionKey: FLOORPLAN_PROJECTS_STORAGE_KEY,
        itemId: savedProject.id,
        op: 'upsert',
        item: savedProject,
        idField: 'id',
        user,
        summaryLabel: savedProject.name,
      });
      return savedProject;
    }

    try {
      const { error } = await withAbortableTimeout<any>(
        (signal) =>
          client
            .from('fenix_kv_store')
            .upsert(
              {
                key: FLOORPLAN_PROJECTS_STORAGE_KEY,
                data: nextList,
                updated_at: now,
                updated_by: user,
              },
              { onConflict: 'key' }
            )
            .select('updated_at')
            .abortSignal(signal)
            .maybeSingle(),
        15000,
        'Tempo limite ao salvar planta no Supabase.'
      );
      if (error) throw error;
      removePendingSyncRecord(FLOORPLAN_PROJECTS_STORAGE_KEY, savedProject.id);
    } catch (err: any) {
      markRecordPendingSync({
        collectionKey: FLOORPLAN_PROJECTS_STORAGE_KEY,
        itemId: savedProject.id,
        op: 'upsert',
        item: savedProject,
        idField: 'id',
        user,
        summaryLabel: savedProject.name,
      });
      throw new Error(
        formatSupabaseErrorMessage(
          err,
          'O cálculo foi salvo localmente, mas houve falha na sincronização com o Supabase.'
        )
      );
    }

    return savedProject;
  });
}

export async function deleteFloorplanProject(id: string): Promise<boolean> {
  if (!id) return false;
  const cleanId = id.trim();
  const offlineMode = isEmergencyOfflineMode();
  const client = getSupabaseClient();
  const now = new Date().toISOString();
  const user =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem('fenix_active_user_name') ||
        localStorage.getItem('fenix_saved_username'))) ||
    'Usuário Fênix';

  return enqueueCollectionWrite(FLOORPLAN_PROJECTS_STORAGE_KEY, async () => {
    const filtered = getStoredFloorplanProjects().filter((p) => p.id !== cleanId);
    memoryProjectsCache = filtered;
    setLocalCollectionSafe(FLOORPLAN_PROJECTS_STORAGE_KEY, filtered);

    if (offlineMode || !client) {
      markRecordPendingSync({
        collectionKey: FLOORPLAN_PROJECTS_STORAGE_KEY,
        itemId: cleanId,
        op: 'delete',
        idField: 'id',
        user,
        summaryLabel: 'Planta removida',
      });
      return true;
    }

    const { error } = await withAbortableTimeout<any>(
      (signal) =>
        client
          .from('fenix_kv_store')
          .upsert(
            {
              key: FLOORPLAN_PROJECTS_STORAGE_KEY,
              data: filtered,
              updated_at: now,
              updated_by: user,
            },
            { onConflict: 'key' }
          )
          .select('updated_at')
          .abortSignal(signal)
          .maybeSingle(),
      15000,
      'Tempo limite ao remover planta no Supabase.'
    );

    if (error) {
      throw new Error(
        formatSupabaseErrorMessage(error, 'Não foi possível excluir a planta no Supabase.')
      );
    }

    removePendingSyncRecord(FLOORPLAN_PROJECTS_STORAGE_KEY, cleanId);
    return true;
  });
}
