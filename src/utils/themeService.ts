import { useState, useEffect } from 'react';
import {
  getLocalRawSafe,
  getSupabaseClient,
  recordSelfSave,
  setLocalCollectionSafe,
  withAbortableTimeout,
} from './supabaseClient';
import {
  isEmergencyOfflineMode,
  markRecordPendingSync,
  removePendingSyncRecord,
} from './indexedDbOfflineStore';
import {
  getSellerIdForUser,
  getUserIdByName,
  isUserRevoked,
  normalizeAuthorizedName,
} from './auth';

export type FenixThemeId =
  | 'padrao'
  | 'natal'
  | 'novembro_black'
  | 'ano_novo'
  | 'carnaval'
  | 'pascoa'
  | 'dia_das_maes'
  | 'dia_dos_pais'
  | 'halloween'
  | 'personalizado';

export type FenixThemeScope = 'crm' | 'orcamentos' | 'ambos';

export type BudgetThemeVariant = 'classico' | 'decorado';

export type DecorativeMotifId =
  | 'nenhum'
  | 'padrao'
  | 'natal'
  | 'novembro_black'
  | 'ano_novo'
  | 'carnaval'
  | 'pascoa'
  | 'dia_das_maes'
  | 'dia_dos_pais'
  | 'halloween';

export interface CustomThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  headerBg: string;
  buttonBg: string;
  motif: DecorativeMotifId;
}

export interface FenixThemeState {
  activeThemeId: FenixThemeId;
  scope: FenixThemeScope;
  applyToSystem: boolean;
  applyToBudgets: boolean;
  applyToPdf: boolean;
  showDecorationsInSystem: boolean;
  showDecorationsInBudgets: boolean;
  showDecorationsInPdf: boolean;
  autoScheduleEnabled: boolean;
  scheduledThemeId: FenixThemeId;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  customTheme: CustomThemeConfig;
  updatedAt: string;
}

export interface FenixThemeDefinition {
  id: FenixThemeId;
  name: string;
  shortTag: string;
  description: string;
  motif: DecorativeMotifId;
  badgeText?: string;
  paletteSwatches: [string, string, string, string];
  crm: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    sidebarBg: string;
    sidebarFooterBg: string;
    sidebarBorder: string;
    sidebarText: string;
    sidebarMuted: string;
    sidebarHoverBg: string;
    logoLightBackdrop: boolean;
    headerOverlayFrom: string;
    headerOverlayVia: string;
    headerOverlayTo: string;
    headerAccent: string;
    pageBg: string;
    cardTintBg: string;
    cardTintBorder: string;
    tableHeaderBg: string;
    tableHeaderText: string;
    indicatorBg: string;
    indicatorText: string;
  };
  budget: {
    outerBorder: string;
    // Cabeçalho curvo PREMIUM
    headerLightBgStart: string;
    headerLightBgMid: string;
    headerLightBgEnd: string;
    headerWaveBackStart: string;
    headerWaveBackEnd: string;
    headerWaveFrontStart: string;
    headerWaveFrontMid: string;
    headerWaveFrontEnd: string;
    headerGlowStroke: string;
    headerBottomBarBg: string;
    dividerLine: string;
    companyTitleColor: string;
    companyAddressColor: string;
    bannerIconBorder: string;
    bannerIconBars: string;
    bannerDivider: string;
    bannerTitleColor: string;
    bannerSubtextColor: string;
    bannerDateColor: string;

    // Blocos Dados do Cliente & Informações do Orçamento
    blockBorder: string;
    sectionHeaderFrom: string;
    sectionHeaderTo: string;
    sectionHeaderBg: string;
    sectionHeaderText: string;
    rowDivider: string;
    labelColor: string;

    // Tabela de Produtos
    tableSectionFrom: string;
    tableSectionMid: string;
    tableSectionTo: string;
    tableSectionBg: string;
    tableSectionText: string;
    tableBarGlow: string;
    tableHeaderFrom: string;
    tableHeaderTo: string;
    tableHeaderBg: string;
    tableHeaderText: string;
    tableHeaderDivider: string;
    tableBorder: string;
    productDetailColor: string;
    totalColumnBg: string;
    itemTotalColor: string;

    // Desconto / Subtotal (somente quando há desconto)
    discountBg: string;
    discountBorder: string;
    discountTextColor: string;
    discountValueColor: string;
    discountIconColor: string;
    subtotalGradient: string;
    subtotalTextColor: string;
    subtotalValueColor: string;
    subtotalBorder: string;
    specialPriceHighlight: boolean;

    // Frete & Total em Destaque
    freightBorder: string;
    freightIconColor: string;
    freightTitleColor: string;
    freightDividerColor: string;
    freightValueColor: string;
    totalBoxBg: string;
    totalBoxBorder: string;
    totalBoxLeftStart: string;
    totalBoxLeftEnd: string;
    totalBoxWaveStart: string;
    totalBoxWaveMid: string;
    totalBoxWaveEnd: string;
    totalBoxGlow: string;
    totalIconBorder: string;
    totalLabelColor: string;
    totalDividerColor: string;
    totalValueColor: string;

    // Rodapé 3 colunas
    footerBorder: string;
    footerColumnDivider: string;
    footerAccent: string;
    footerObsTitleColor: string;
    footerScriptColor: string;
    footerUnderlineColor: string;
    whatsappBorder: string;
    whatsappText: string;

    // Ondas decorativas inferiores PREMIUM
    waveBackStart: string;
    waveBackEnd: string;
    waveMidStart: string;
    waveMidEnd: string;
    waveGlow: string;
    waveFrontStart: string;
    waveFrontEnd: string;

    // Alias de compatibilidade para miniaturas
    headerBg: string;
    headerBorder: string;
    slantedBannerBg: string;
    slantedBannerAccent: string;
  };
}

export const THEME_STORAGE_KEY = 'fenix_themes_config_v1';
export const THEME_USER_STORAGE_PREFIX = 'fenix_themes_config_user_';
export const THEME_UPDATED_EVENT = 'fenix_theme_updated';

export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  primary: '#00386e',
  secondary: '#0b66c3',
  accent: '#1482e0',
  headerBg: '#00224a',
  buttonBg: '#00529e',
  motif: 'nenhum',
};

export const DEFAULT_THEME_STATE: FenixThemeState = {
  activeThemeId: 'padrao',
  scope: 'ambos',
  applyToSystem: true,
  applyToBudgets: true,
  applyToPdf: true,
  showDecorationsInSystem: false,
  showDecorationsInBudgets: false,
  showDecorationsInPdf: false,
  autoScheduleEnabled: false,
  scheduledThemeId: 'natal',
  startDate: '',
  endDate: '',
  customTheme: { ...DEFAULT_CUSTOM_THEME },
  updatedAt: '',
};

let currentPreviewThemeId: FenixThemeId | null = null;
let currentPreviewCustomOverride: CustomThemeConfig | null = null;
let currentExportRenderTarget: 'pdf' | null = null;

function adjustHex(hex: string, amount: number): string {
  const cleaned = (hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return hex || '#0052cc';
  const num = parseInt(cleaned, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = (hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return `rgba(0, 82, 204, ${alpha})`;
  const num = parseInt(cleaned, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isLightColor(hex: string): boolean {
  const cleaned = (hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return false;
  const num = parseInt(cleaned, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export const STATIC_THEME_DEFINITIONS: Record<
  Exclude<FenixThemeId, 'personalizado'>,
  FenixThemeDefinition
> = {
  padrao: {
    id: 'padrao',
    name: 'PREMIUM',
    shortTag: 'Modelo Oficial',
    description:
      'Modelo oficial e referência visual da Fênix World: azul-marinho, azul corporativo, azul-claro, branco e cinza.',
    motif: 'padrao',
    paletteSwatches: ['#00244d', '#00529e', '#1482e0', '#ffffff'],
    crm: {
      primary: '#0052cc',
      primaryHover: '#0047b3',
      secondary: '#003865',
      accent: '#1482e0',
      sidebarBg: '#091122',
      sidebarFooterBg: '#070e1c',
      sidebarBorder: '#1e293b',
      sidebarText: '#cbd5e1',
      sidebarMuted: '#94a3b8',
      sidebarHoverBg: 'rgba(255, 255, 255, 0.06)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(0, 0, 0, 0.78)',
      headerOverlayVia: 'rgba(0, 0, 0, 0.58)',
      headerOverlayTo: 'rgba(0, 0, 0, 0.72)',
      headerAccent: '#1482e0',
      pageBg: '#f1f5f9',
      cardTintBg: '#eff6ff',
      cardTintBorder: '#bfdbfe',
      tableHeaderBg: '#f8fafc',
      tableHeaderText: '#334155',
      indicatorBg: '#dbeafe',
      indicatorText: '#1d4ed8',
    },
    budget: {
      outerBorder: '#b8d0e6',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#f2f7fc',
      headerLightBgEnd: '#dceaf7',
      headerWaveBackStart: '#8ec4f0',
      headerWaveBackEnd: '#1a75c7',
      headerWaveFrontStart: '#0d63b8',
      headerWaveFrontMid: '#003e7a',
      headerWaveFrontEnd: '#001e42',
      headerGlowStroke: '#38bdf8',
      headerBottomBarBg: '#004d94',
      dividerLine: '#1e4e79',
      companyTitleColor: '#003366',
      companyAddressColor: '#1e293b',
      bannerIconBorder: 'rgba(255, 255, 255, 0.85)',
      bannerIconBars: '#ffffff',
      bannerDivider: 'rgba(255, 255, 255, 0.75)',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#dbeafe',
      bannerDateColor: '#ffffff',

      blockBorder: '#b8d0e6',
      sectionHeaderFrom: '#0b5ca6',
      sectionHeaderTo: '#00386e',
      sectionHeaderBg: '#004785',
      sectionHeaderText: '#ffffff',
      rowDivider: '#dbe6f0',
      labelColor: '#003b73',

      tableSectionFrom: '#00366b',
      tableSectionMid: '#0b5ca6',
      tableSectionTo: '#00366b',
      tableSectionBg: '#004482',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #00386b 0%, #38bdf8 30%, #e0f2fe 50%, #38bdf8 70%, #00386b 100%)',
      tableHeaderFrom: '#074785',
      tableHeaderTo: '#002c57',
      tableHeaderBg: '#00386b',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.28)',
      tableBorder: '#d4e1ee',
      productDetailColor: '#004b8d',
      totalColumnBg: '#e8f2fc',
      itemTotalColor: '#002f5c',

      discountBg: '#dbebf8',
      discountBorder: '#b8d0e6',
      discountTextColor: '#00386e',
      discountValueColor: '#002f5c',
      discountIconColor: '#0d63b8',
      subtotalGradient:
        'linear-gradient(90deg, #dbebf8 0%, #dbebf8 25%, #2b7bc4 58%, #00386e 82%, #00244d 100%)',
      subtotalTextColor: '#00386e',
      subtotalValueColor: '#ffffff',
      subtotalBorder: '#b8d0e6',
      specialPriceHighlight: false,

      freightBorder: '#c5d7e8',
      freightIconColor: '#0d63b8',
      freightTitleColor: '#0d63b8',
      freightDividerColor: '#4d8cc9',
      freightValueColor: '#00386e',
      totalBoxBg: '#002a58',
      totalBoxBorder: '#003366',
      totalBoxLeftStart: '#001e42',
      totalBoxLeftEnd: '#003266',
      totalBoxWaveStart: '#1888e8',
      totalBoxWaveMid: '#0a61b8',
      totalBoxWaveEnd: '#003875',
      totalBoxGlow: '#60c3ff',
      totalIconBorder: '#ffffff',
      totalLabelColor: '#ffffff',
      totalDividerColor: 'rgba(255, 255, 255, 0.55)',
      totalValueColor: '#ffffff',

      footerBorder: '#d8e4ef',
      footerColumnDivider: '#c7d8e8',
      footerAccent: '#00529e',
      footerObsTitleColor: '#004488',
      footerScriptColor: '#003366',
      footerUnderlineColor: '#0d63b8',
      whatsappBorder: '#003b73',
      whatsappText: '#003366',

      waveBackStart: '#38bdf8',
      waveBackEnd: '#0b66c3',
      waveMidStart: '#0056a3',
      waveMidEnd: '#003266',
      waveGlow: '#7dd3fc',
      waveFrontStart: '#00244d',
      waveFrontEnd: '#001633',

      headerBg: '#f4f9fd',
      headerBorder: '#00529e',
      slantedBannerBg: '#003e7a',
      slantedBannerAccent: '#ffffff',
    },
  },

  natal: {
    id: 'natal',
    name: 'Natal',
    shortTag: 'Sazonal',
    description:
      'Paleta natalina sobre o modelo PREMIUM: vermelho natalino, vermelho escuro, dourado, branco e toque discreto de verde.',
    motif: 'natal',
    badgeText: 'Natal',
    paletteSwatches: ['#b91c1c', '#6b0f14', '#d4af37', '#166534'],
    crm: {
      primary: '#b91c1c',
      primaryHover: '#991b1b',
      secondary: '#6b0f14',
      accent: '#d4af37',
      sidebarBg: '#2b080a',
      sidebarFooterBg: '#1c0406',
      sidebarBorder: '#5c1418',
      sidebarText: '#fef2f2',
      sidebarMuted: '#fca5a5',
      sidebarHoverBg: 'rgba(212, 175, 55, 0.14)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(76, 7, 10, 0.90)',
      headerOverlayVia: 'rgba(136, 19, 19, 0.78)',
      headerOverlayTo: 'rgba(76, 7, 10, 0.90)',
      headerAccent: '#f5d061',
      pageBg: '#fcf9f7',
      cardTintBg: '#fef2f2',
      cardTintBorder: '#fecaca',
      tableHeaderBg: '#fef2f2',
      tableHeaderText: '#7f1d1d',
      indicatorBg: '#fef3c7',
      indicatorText: '#991b1b',
    },
    budget: {
      outerBorder: '#e2c4b4',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#fef6f6',
      headerLightBgEnd: '#fae5e5',
      headerWaveBackStart: '#f5d061',
      headerWaveBackEnd: '#d4af37',
      headerWaveFrontStart: '#dc2626',
      headerWaveFrontMid: '#991b1b',
      headerWaveFrontEnd: '#52090d',
      headerGlowStroke: '#f5d061',
      headerBottomBarBg: '#7f1d1d',
      dividerLine: '#b8860b',
      companyTitleColor: '#7f1d1d',
      companyAddressColor: '#1e293b',
      bannerIconBorder: '#f5d061',
      bannerIconBars: '#ffffff',
      bannerDivider: 'rgba(245, 208, 97, 0.75)',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#fef3c7',
      bannerDateColor: '#ffffff',

      blockBorder: '#e2c8ba',
      sectionHeaderFrom: '#b91c1c',
      sectionHeaderTo: '#6b0f14',
      sectionHeaderBg: '#991b1b',
      sectionHeaderText: '#ffffff',
      rowDivider: '#f0dede',
      labelColor: '#7f1d1d',

      tableSectionFrom: '#6b0f14',
      tableSectionMid: '#b91c1c',
      tableSectionTo: '#6b0f14',
      tableSectionBg: '#881313',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #6b0f14 0%, #d4af37 30%, #fef3c7 50%, #d4af37 70%, #6b0f14 100%)',
      tableHeaderFrom: '#881313',
      tableHeaderTo: '#52090d',
      tableHeaderBg: '#6b0f14',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.25)',
      tableBorder: '#edd8d8',
      productDetailColor: '#166534',
      totalColumnBg: '#fdf2f2',
      itemTotalColor: '#7f1d1d',

      discountBg: '#fef2f2',
      discountBorder: '#e2c4b4',
      discountTextColor: '#7f1d1d',
      discountValueColor: '#7f1d1d',
      discountIconColor: '#b91c1c',
      subtotalGradient:
        'linear-gradient(90deg, #fef2f2 0%, #fee2e2 28%, #b91c1c 62%, #6b0f14 85%, #52090d 100%)',
      subtotalTextColor: '#7f1d1d',
      subtotalValueColor: '#ffffff',
      subtotalBorder: '#e2c4b4',
      specialPriceHighlight: false,

      freightBorder: '#e2c8ba',
      freightIconColor: '#b91c1c',
      freightTitleColor: '#991b1b',
      freightDividerColor: '#d4af37',
      freightValueColor: '#7f1d1d',
      totalBoxBg: '#5c0a0e',
      totalBoxBorder: '#d4af37',
      totalBoxLeftStart: '#4c070a',
      totalBoxLeftEnd: '#7f1d1d',
      totalBoxWaveStart: '#dc2626',
      totalBoxWaveMid: '#991b1b',
      totalBoxWaveEnd: '#5c0a0e',
      totalBoxGlow: '#f5d061',
      totalIconBorder: '#f5d061',
      totalLabelColor: '#fef3c7',
      totalDividerColor: 'rgba(245, 208, 97, 0.55)',
      totalValueColor: '#ffffff',

      footerBorder: '#edd8d8',
      footerColumnDivider: '#e2c8ba',
      footerAccent: '#b91c1c',
      footerObsTitleColor: '#7f1d1d',
      footerScriptColor: '#7f1d1d',
      footerUnderlineColor: '#d4af37',
      whatsappBorder: '#166534',
      whatsappText: '#7f1d1d',

      waveBackStart: '#f5d061',
      waveBackEnd: '#d4af37',
      waveMidStart: '#dc2626',
      waveMidEnd: '#7f1d1d',
      waveGlow: '#fde68a',
      waveFrontStart: '#6b0f14',
      waveFrontEnd: '#3f0508',

      headerBg: '#fef6f6',
      headerBorder: '#b91c1c',
      slantedBannerBg: '#991b1b',
      slantedBannerAccent: '#f5d061',
    },
  },

  novembro_black: {
    id: 'novembro_black',
    name: 'Novembro Black',
    shortTag: 'Campanha',
    description:
      'Preto, dourado metálico, branco e cinza escuro aplicados exatamente sobre o modelo PREMIUM.',
    motif: 'novembro_black',
    badgeText: 'NOVEMBRO BLACK',
    paletteSwatches: ['#09090b', '#d4af37', '#27272a', '#ffffff'],
    crm: {
      primary: '#111113',
      primaryHover: '#27272a',
      secondary: '#b48a1e',
      accent: '#d4af37',
      sidebarBg: '#09090b',
      sidebarFooterBg: '#050507',
      sidebarBorder: '#2b2412',
      sidebarText: '#f4f4f5',
      sidebarMuted: '#d4af37',
      sidebarHoverBg: 'rgba(212, 175, 55, 0.12)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(7, 7, 9, 0.92)',
      headerOverlayVia: 'rgba(18, 15, 8, 0.85)',
      headerOverlayTo: 'rgba(7, 7, 9, 0.92)',
      headerAccent: '#e5bd53',
      pageBg: '#f4f3ef',
      cardTintBg: '#fdfaf0',
      cardTintBorder: '#e8d290',
      tableHeaderBg: '#141416',
      tableHeaderText: '#f5d061',
      indicatorBg: '#18181b',
      indicatorText: '#f5d061',
    },
    budget: {
      outerBorder: '#d6c184',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#fbfaf6',
      headerLightBgEnd: '#f3ecd8',
      headerWaveBackStart: '#f5d061',
      headerWaveBackEnd: '#b48a1e',
      headerWaveFrontStart: '#27272a',
      headerWaveFrontMid: '#141416',
      headerWaveFrontEnd: '#050507',
      headerGlowStroke: '#f5d061',
      headerBottomBarBg: '#18181b',
      dividerLine: '#b48a1e',
      companyTitleColor: '#111113',
      companyAddressColor: '#27272a',
      bannerIconBorder: '#f5d061',
      bannerIconBars: '#f5d061',
      bannerDivider: 'rgba(245, 208, 97, 0.7)',
      bannerTitleColor: '#f5d061',
      bannerSubtextColor: '#e4e4e7',
      bannerDateColor: '#ffffff',

      blockBorder: '#d8c89e',
      sectionHeaderFrom: '#27272a',
      sectionHeaderTo: '#09090b',
      sectionHeaderBg: '#141416',
      sectionHeaderText: '#f5d061',
      rowDivider: '#ebe4cf',
      labelColor: '#18181b',

      tableSectionFrom: '#09090b',
      tableSectionMid: '#27272a',
      tableSectionTo: '#09090b',
      tableSectionBg: '#111113',
      tableSectionText: '#f5d061',
      tableBarGlow:
        'linear-gradient(90deg, #09090b 0%, #d4af37 30%, #fef3c7 50%, #d4af37 70%, #09090b 100%)',
      tableHeaderFrom: '#1f1f23',
      tableHeaderTo: '#09090b',
      tableHeaderBg: '#141416',
      tableHeaderText: '#f5d061',
      tableHeaderDivider: 'rgba(212, 175, 55, 0.35)',
      tableBorder: '#e4decb',
      productDetailColor: '#8a6610',
      totalColumnBg: '#fbf6e6',
      itemTotalColor: '#7a5908',

      discountBg: '#faf4df',
      discountBorder: '#d4af37',
      discountTextColor: '#18181b',
      discountValueColor: '#111113',
      discountIconColor: '#8a6610',
      subtotalGradient:
        'linear-gradient(90deg, #faf4df 0%, #f3e6be 28%, #7d6218 62%, #111113 85%, #09090b 100%)',
      subtotalTextColor: '#18181b',
      subtotalValueColor: '#f5d061',
      subtotalBorder: '#d4af37',
      specialPriceHighlight: true,

      freightBorder: '#d8c89e',
      freightIconColor: '#926c0c',
      freightTitleColor: '#111113',
      freightDividerColor: '#d4af37',
      freightValueColor: '#7a5908',
      totalBoxBg: '#09090b',
      totalBoxBorder: '#d4af37',
      totalBoxLeftStart: '#050507',
      totalBoxLeftEnd: '#18181b',
      totalBoxWaveStart: '#d4af37',
      totalBoxWaveMid: '#8a6610',
      totalBoxWaveEnd: '#141416',
      totalBoxGlow: '#fde68a',
      totalIconBorder: '#f5d061',
      totalLabelColor: '#f5d061',
      totalDividerColor: 'rgba(245, 208, 97, 0.55)',
      totalValueColor: '#ffffff',

      footerBorder: '#e5dcb9',
      footerColumnDivider: '#d8c89e',
      footerAccent: '#926c0c',
      footerObsTitleColor: '#18181b',
      footerScriptColor: '#111113',
      footerUnderlineColor: '#d4af37',
      whatsappBorder: '#18181b',
      whatsappText: '#111113',

      waveBackStart: '#f5d061',
      waveBackEnd: '#b48a1e',
      waveMidStart: '#27272a',
      waveMidEnd: '#141416',
      waveGlow: '#fde68a',
      waveFrontStart: '#0e0e11',
      waveFrontEnd: '#050507',

      headerBg: '#faf8f2',
      headerBorder: '#d4af37',
      slantedBannerBg: '#09090b',
      slantedBannerAccent: '#f5d061',
    },
  },

  ano_novo: {
    id: 'ano_novo',
    name: 'Ano Novo',
    shortTag: 'Celebração',
    description:
      'Azul-marinho, dourado, prata e branco aplicados exclusivamente nas cores do modelo PREMIUM.',
    motif: 'ano_novo',
    badgeText: 'Ano Novo',
    paletteSwatches: ['#091e42', '#d4af37', '#cbd5e1', '#ffffff'],
    crm: {
      primary: '#0d2b5c',
      primaryHover: '#081d40',
      secondary: '#b89128',
      accent: '#d4af37',
      sidebarBg: '#071630',
      sidebarFooterBg: '#040e20',
      sidebarBorder: '#1e3a6b',
      sidebarText: '#e2e8f0',
      sidebarMuted: '#cbd5e1',
      sidebarHoverBg: 'rgba(212, 175, 55, 0.14)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(7, 22, 48, 0.90)',
      headerOverlayVia: 'rgba(13, 43, 92, 0.78)',
      headerOverlayTo: 'rgba(7, 22, 48, 0.90)',
      headerAccent: '#f5d061',
      pageBg: '#f3f5f9',
      cardTintBg: '#f8fafc',
      cardTintBorder: '#cbd5e1',
      tableHeaderBg: '#eef2f8',
      tableHeaderText: '#091e42',
      indicatorBg: '#fef3c7',
      indicatorText: '#926c0c',
    },
    budget: {
      outerBorder: '#d5c3a8',
      headerLightBgStart: '#fbf8f6',
      headerLightBgMid: '#f3f2f1',
      headerLightBgEnd: '#e6ebf2',
      headerWaveBackStart: '#f5d061',
      headerWaveBackEnd: '#d4af37',
      headerWaveFrontStart: '#0a2f66',
      headerWaveFrontMid: '#042452',
      headerWaveFrontEnd: '#011e46',
      headerGlowStroke: '#f5d061',
      headerBottomBarBg: '#c89b3c',
      dividerLine: '#b89128',
      companyTitleColor: '#042f5f',
      companyAddressColor: '#1e293b',
      bannerIconBorder: '#f5d061',
      bannerIconBars: '#ffffff',
      bannerDivider: '#f5d061',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#ffffff',
      bannerDateColor: '#f5d061',

      blockBorder: '#cbb897',
      sectionHeaderFrom: '#042f5f',
      sectionHeaderTo: '#011e46',
      sectionHeaderBg: '#032851',
      sectionHeaderText: '#ffffff',
      rowDivider: '#e5dfd3',
      labelColor: '#042958',

      tableSectionFrom: '#072143',
      tableSectionMid: '#003972',
      tableSectionTo: '#072143',
      tableSectionBg: '#032851',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #061c3d 0%, #d4af37 30%, #fef08a 50%, #d4af37 70%, #061c3d 100%)',
      tableHeaderFrom: '#072c55',
      tableHeaderTo: '#021836',
      tableHeaderBg: '#042552',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.25)',
      tableBorder: '#d8e0ea',
      productDetailColor: '#042958',
      totalColumnBg: '#edf4fb',
      itemTotalColor: '#042958',

      discountBg: '#f8f5ee',
      discountBorder: '#cbb897',
      discountTextColor: '#042958',
      discountValueColor: '#042958',
      discountIconColor: '#b89128',
      subtotalGradient:
        'linear-gradient(90deg, #f8f5ee 0%, #ede6d6 28%, #1e4278 62%, #042552 85%, #011e46 100%)',
      subtotalTextColor: '#042958',
      subtotalValueColor: '#f5d061',
      subtotalBorder: '#cbb897',
      specialPriceHighlight: false,

      freightBorder: '#cbb897',
      freightIconColor: '#042958',
      freightTitleColor: '#042958',
      freightDividerColor: '#c8a552',
      freightValueColor: '#042958',
      totalBoxBg: '#041e42',
      totalBoxBorder: '#b8860b',
      totalBoxLeftStart: '#031838',
      totalBoxLeftEnd: '#072b5e',
      totalBoxWaveStart: '#0b3873',
      totalBoxWaveMid: '#072959',
      totalBoxWaveEnd: '#021633',
      totalBoxGlow: '#f5d061',
      totalIconBorder: '#f5d061',
      totalLabelColor: '#f5d061',
      totalDividerColor: 'rgba(245, 208, 97, 0.72)',
      totalValueColor: '#ffffff',

      footerBorder: '#e5dfd3',
      footerColumnDivider: '#c8a552',
      footerAccent: '#042958',
      footerObsTitleColor: '#042958',
      footerScriptColor: '#042958',
      footerUnderlineColor: '#c5942d',
      whatsappBorder: '#166534',
      whatsappText: '#042958',

      waveBackStart: '#e2e8f0',
      waveBackEnd: '#94a3b8',
      waveMidStart: '#d4af37',
      waveMidEnd: '#0a2f66',
      waveGlow: '#fef08a',
      waveFrontStart: '#042452',
      waveFrontEnd: '#011e46',

      headerBg: '#fbf8f6',
      headerBorder: '#d4af37',
      slantedBannerBg: '#042452',
      slantedBannerAccent: '#f5d061',
    },
  },

  carnaval: {
    id: 'carnaval',
    name: 'Carnaval',
    shortTag: 'Campanha',
    description:
      'Roxo, magenta, amarelo, dourado e branco preservando integralmente o layout PREMIUM.',
    motif: 'carnaval',
    badgeText: 'Carnaval',
    paletteSwatches: ['#5b21b6', '#be185d', '#eab308', '#d4af37'],
    crm: {
      primary: '#6d28d9',
      primaryHover: '#5b21b6',
      secondary: '#be185d',
      accent: '#eab308',
      sidebarBg: '#2e1065',
      sidebarFooterBg: '#1e0a45',
      sidebarBorder: '#5b21b6',
      sidebarText: '#f5f3ff',
      sidebarMuted: '#ddd6fe',
      sidebarHoverBg: 'rgba(234, 179, 8, 0.16)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(46, 16, 101, 0.88)',
      headerOverlayVia: 'rgba(131, 24, 67, 0.78)',
      headerOverlayTo: 'rgba(46, 16, 101, 0.88)',
      headerAccent: '#facc15',
      pageBg: '#faf7fc',
      cardTintBg: '#fdf2f8',
      cardTintBorder: '#fbcfe8',
      tableHeaderBg: '#f5f3ff',
      tableHeaderText: '#5b21b6',
      indicatorBg: '#fef08a',
      indicatorText: '#6d28d9',
    },
    budget: {
      outerBorder: '#d8b4fe',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#faf5ff',
      headerLightBgEnd: '#f5e8ff',
      headerWaveBackStart: '#facc15',
      headerWaveBackEnd: '#be185d',
      headerWaveFrontStart: '#be185d',
      headerWaveFrontMid: '#6d28d9',
      headerWaveFrontEnd: '#3b0764',
      headerGlowStroke: '#fde047',
      headerBottomBarBg: '#5b21b6',
      dividerLine: '#be185d',
      companyTitleColor: '#4c1d95',
      companyAddressColor: '#1e293b',
      bannerIconBorder: '#fde047',
      bannerIconBars: '#ffffff',
      bannerDivider: 'rgba(253, 224, 71, 0.75)',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#fce7f3',
      bannerDateColor: '#fde047',

      blockBorder: '#e2ccfb',
      sectionHeaderFrom: '#be185d',
      sectionHeaderTo: '#6d28d9',
      sectionHeaderBg: '#7e22ce',
      sectionHeaderText: '#ffffff',
      rowDivider: '#efe3fc',
      labelColor: '#5b21b6',

      tableSectionFrom: '#4c1d95',
      tableSectionMid: '#be185d',
      tableSectionTo: '#4c1d95',
      tableSectionBg: '#5b21b6',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #4c1d95 0%, #facc15 30%, #fef9c3 50%, #facc15 70%, #4c1d95 100%)',
      tableHeaderFrom: '#5b21b6',
      tableHeaderTo: '#3b0764',
      tableHeaderBg: '#4c1d95',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.25)',
      tableBorder: '#e9d5ff',
      productDetailColor: '#be185d',
      totalColumnBg: '#f6effe',
      itemTotalColor: '#5b21b6',

      discountBg: '#faf5ff',
      discountBorder: '#d8b4fe',
      discountTextColor: '#4c1d95',
      discountValueColor: '#4c1d95',
      discountIconColor: '#be185d',
      subtotalGradient:
        'linear-gradient(90deg, #faf5ff 0%, #f3e8ff 28%, #be185d 64%, #5b21b6 88%, #4c1d95 100%)',
      subtotalTextColor: '#4c1d95',
      subtotalValueColor: '#fef08a',
      subtotalBorder: '#d8b4fe',
      specialPriceHighlight: false,

      freightBorder: '#e2ccfb',
      freightIconColor: '#be185d',
      freightTitleColor: '#5b21b6',
      freightDividerColor: '#eab308',
      freightValueColor: '#831843',
      totalBoxBg: '#3b0764',
      totalBoxBorder: '#d4af37',
      totalBoxLeftStart: '#2e1065',
      totalBoxLeftEnd: '#4c1d95',
      totalBoxWaveStart: '#eab308',
      totalBoxWaveMid: '#be185d',
      totalBoxWaveEnd: '#4c1d95',
      totalBoxGlow: '#fef08a',
      totalIconBorder: '#fde047',
      totalLabelColor: '#fde047',
      totalDividerColor: 'rgba(253, 224, 71, 0.5)',
      totalValueColor: '#ffffff',

      footerBorder: '#eadcf9',
      footerColumnDivider: '#d8b4fe',
      footerAccent: '#be185d',
      footerObsTitleColor: '#5b21b6',
      footerScriptColor: '#4c1d95',
      footerUnderlineColor: '#d4af37',
      whatsappBorder: '#5b21b6',
      whatsappText: '#4c1d95',

      waveBackStart: '#facc15',
      waveBackEnd: '#d4af37',
      waveMidStart: '#db2777',
      waveMidEnd: '#7e22ce',
      waveGlow: '#fef08a',
      waveFrontStart: '#4c1d95',
      waveFrontEnd: '#2e1065',

      headerBg: '#faf5ff',
      headerBorder: '#be185d',
      slantedBannerBg: '#5b21b6',
      slantedBannerAccent: '#fde047',
    },
  },

  pascoa: {
    id: 'pascoa',
    name: 'Páscoa',
    shortTag: 'Sazonal',
    description:
      'Lilás, rosa suave, amarelo claro, verde suave e branco aplicados somente como paleta no modelo PREMIUM.',
    motif: 'pascoa',
    badgeText: 'Páscoa',
    paletteSwatches: ['#9333ea', '#f472b6', '#fef08a', '#4ade80'],
    crm: {
      primary: '#7e22ce',
      primaryHover: '#6b21a8',
      secondary: '#15803d',
      accent: '#ec4899',
      sidebarBg: '#3b1d54',
      sidebarFooterBg: '#2a133d',
      sidebarBorder: '#6b21a8',
      sidebarText: '#faf5ff',
      sidebarMuted: '#e9d5ff',
      sidebarHoverBg: 'rgba(244, 114, 182, 0.16)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(59, 29, 84, 0.88)',
      headerOverlayVia: 'rgba(131, 41, 112, 0.72)',
      headerOverlayTo: 'rgba(38, 87, 63, 0.80)',
      headerAccent: '#f9a8d4',
      pageBg: '#fcf9fe',
      cardTintBg: '#faf5ff',
      cardTintBorder: '#e9d5ff',
      tableHeaderBg: '#f5f3ff',
      tableHeaderText: '#6b21a8',
      indicatorBg: '#dcfce7',
      indicatorText: '#15803d',
    },
    budget: {
      outerBorder: '#dcc2fa',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#fcf8ff',
      headerLightBgEnd: '#f4eafa',
      headerWaveBackStart: '#f9a8d4',
      headerWaveBackEnd: '#86efac',
      headerWaveFrontStart: '#a855f7',
      headerWaveFrontMid: '#7e22ce',
      headerWaveFrontEnd: '#581c87',
      headerGlowStroke: '#fef08a',
      headerBottomBarBg: '#7e22ce',
      dividerLine: '#a855f7',
      companyTitleColor: '#6b21a8',
      companyAddressColor: '#1e293b',
      bannerIconBorder: '#fef08a',
      bannerIconBars: '#ffffff',
      bannerDivider: 'rgba(254, 240, 138, 0.75)',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#fce7f3',
      bannerDateColor: '#fef08a',

      blockBorder: '#e5d1fc',
      sectionHeaderFrom: '#a855f7',
      sectionHeaderTo: '#6b21a8',
      sectionHeaderBg: '#7e22ce',
      sectionHeaderText: '#ffffff',
      rowDivider: '#f1e5fd',
      labelColor: '#6b21a8',

      tableSectionFrom: '#6b21a8',
      tableSectionMid: '#9333ea',
      tableSectionTo: '#6b21a8',
      tableSectionBg: '#7e22ce',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #6b21a8 0%, #f9a8d4 30%, #fef08a 50%, #86efac 70%, #6b21a8 100%)',
      tableHeaderFrom: '#7e22ce',
      tableHeaderTo: '#581c87',
      tableHeaderBg: '#6b21a8',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.28)',
      tableBorder: '#eadcf9',
      productDetailColor: '#15803d',
      totalColumnBg: '#f9f4ff',
      itemTotalColor: '#6b21a8',

      discountBg: '#faf5ff',
      discountBorder: '#d8b4fe',
      discountTextColor: '#6b21a8',
      discountValueColor: '#581c87',
      discountIconColor: '#db2777',
      subtotalGradient:
        'linear-gradient(90deg, #faf5ff 0%, #fce7f3 30%, #a855f7 65%, #6b21a8 88%, #581c87 100%)',
      subtotalTextColor: '#6b21a8',
      subtotalValueColor: '#ffffff',
      subtotalBorder: '#d8b4fe',
      specialPriceHighlight: false,

      freightBorder: '#e5d1fc',
      freightIconColor: '#16a34a',
      freightTitleColor: '#7e22ce',
      freightDividerColor: '#f472b6',
      freightValueColor: '#6b21a8',
      totalBoxBg: '#581c87',
      totalBoxBorder: '#f472b6',
      totalBoxLeftStart: '#4c1d95',
      totalBoxLeftEnd: '#6b21a8',
      totalBoxWaveStart: '#f472b6',
      totalBoxWaveMid: '#9333ea',
      totalBoxWaveEnd: '#581c87',
      totalBoxGlow: '#fef08a',
      totalIconBorder: '#fef08a',
      totalLabelColor: '#fef9c3',
      totalDividerColor: 'rgba(254, 240, 138, 0.5)',
      totalValueColor: '#ffffff',

      footerBorder: '#eddffb',
      footerColumnDivider: '#e5d1fc',
      footerAccent: '#db2777',
      footerObsTitleColor: '#6b21a8',
      footerScriptColor: '#6b21a8',
      footerUnderlineColor: '#4ade80',
      whatsappBorder: '#15803d',
      whatsappText: '#6b21a8',

      waveBackStart: '#fef08a',
      waveBackEnd: '#86efac',
      waveMidStart: '#f472b6',
      waveMidEnd: '#9333ea',
      waveGlow: '#fbcfe8',
      waveFrontStart: '#7e22ce',
      waveFrontEnd: '#581c87',

      headerBg: '#fcf8ff',
      headerBorder: '#9333ea',
      slantedBannerBg: '#7e22ce',
      slantedBannerAccent: '#fef08a',
    },
  },

  dia_das_maes: {
    id: 'dia_das_maes',
    name: 'Dia das Mães',
    shortTag: 'Homenagem',
    description:
      'Rosa, rosé, dourado e branco adaptados exclusivamente em cores sobre o modelo PREMIUM.',
    motif: 'dia_das_maes',
    badgeText: 'Dia das Mães',
    paletteSwatches: ['#be185d', '#fb7185', '#d4af37', '#ffffff'],
    crm: {
      primary: '#be185d',
      primaryHover: '#9d174d',
      secondary: '#b48a1e',
      accent: '#fb7185',
      sidebarBg: '#4c0f2b',
      sidebarFooterBg: '#36091e',
      sidebarBorder: '#831843',
      sidebarText: '#fff1f2',
      sidebarMuted: '#fecdd3',
      sidebarHoverBg: 'rgba(251, 113, 133, 0.16)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(76, 15, 43, 0.88)',
      headerOverlayVia: 'rgba(131, 24, 67, 0.72)',
      headerOverlayTo: 'rgba(76, 15, 43, 0.88)',
      headerAccent: '#fda4af',
      pageBg: '#fdf8fa',
      cardTintBg: '#fff1f2',
      cardTintBorder: '#fecdd3',
      tableHeaderBg: '#fff1f2',
      tableHeaderText: '#9d174d',
      indicatorBg: '#ffe4e6',
      indicatorText: '#be185d',
    },
    budget: {
      outerBorder: '#efc5ce',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#fff9fa',
      headerLightBgEnd: '#fdf1f4',
      headerWaveBackStart: '#f5b8c8',
      headerWaveBackEnd: '#d4af37',
      headerWaveFrontStart: '#c91d57',
      headerWaveFrontMid: '#a50f37',
      headerWaveFrontEnd: '#7a0624',
      headerGlowStroke: '#f5d061',
      headerBottomBarBg: '#c89b3c',
      dividerLine: '#dfb046',
      companyTitleColor: '#7d0620',
      companyAddressColor: '#0f172a',
      bannerIconBorder: '#f5d061',
      bannerIconBars: '#ffffff',
      bannerDivider: '#f5d061',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#ffffff',
      bannerDateColor: '#fde047',

      blockBorder: '#f3ced6',
      sectionHeaderFrom: '#cf194e',
      sectionHeaderTo: '#8a0b29',
      sectionHeaderBg: '#a50f37',
      sectionHeaderText: '#ffffff',
      rowDivider: '#f6e5e8',
      labelColor: '#8c0829',

      tableSectionFrom: '#940d2f',
      tableSectionMid: '#d22159',
      tableSectionTo: '#940d2f',
      tableSectionBg: '#a50f37',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #7e0726 0%, #e5b84b 30%, #fef3c7 50%, #e5b84b 70%, #7e0726 100%)',
      tableHeaderFrom: '#8a082b',
      tableHeaderTo: '#5e041c',
      tableHeaderBg: '#7a0624',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.28)',
      tableBorder: '#f3d8de',
      productDetailColor: '#9e1035',
      totalColumnBg: '#fef0f3',
      itemTotalColor: '#8e0a2b',

      discountBg: '#fff5f7',
      discountBorder: '#f3ced6',
      discountTextColor: '#8c0829',
      discountValueColor: '#8c0829',
      discountIconColor: '#b91c4a',
      subtotalGradient:
        'linear-gradient(90deg, #fff5f7 0%, #fce7ec 28%, #c91d57 62%, #8a0b29 85%, #6d0720 100%)',
      subtotalTextColor: '#8c0829',
      subtotalValueColor: '#ffffff',
      subtotalBorder: '#f3ced6',
      specialPriceHighlight: false,

      freightBorder: '#f3ced6',
      freightIconColor: '#8c0829',
      freightTitleColor: '#8c0829',
      freightDividerColor: '#e2aa3b',
      freightValueColor: '#8c0829',
      totalBoxBg: '#780924',
      totalBoxBorder: '#c8962e',
      totalBoxLeftStart: '#6d0720',
      totalBoxLeftEnd: '#940f32',
      totalBoxWaveStart: '#c41b4b',
      totalBoxWaveMid: '#a9153e',
      totalBoxWaveEnd: '#7e0a29',
      totalBoxGlow: '#fde68a',
      totalIconBorder: '#facc15',
      totalLabelColor: '#ffffff',
      totalDividerColor: 'rgba(255, 255, 255, 0.35)',
      totalValueColor: '#ffffff',

      footerBorder: '#f3dce2',
      footerColumnDivider: '#d9a536',
      footerAccent: '#8c0829',
      footerObsTitleColor: '#8c0829',
      footerScriptColor: '#8a0724',
      footerUnderlineColor: '#dfa32c',
      whatsappBorder: '#15803d',
      whatsappText: '#7a061c',

      waveBackStart: '#f9a8d4',
      waveBackEnd: '#f5d061',
      waveMidStart: '#d22159',
      waveMidEnd: '#940d2f',
      waveGlow: '#fef08a',
      waveFrontStart: '#940d2f',
      waveFrontEnd: '#6d0720',

      headerBg: '#fff9fa',
      headerBorder: '#be185d',
      slantedBannerBg: '#940d2f',
      slantedBannerAccent: '#fde047',
    },
  },

  dia_dos_pais: {
    id: 'dia_dos_pais',
    name: 'Dia dos Pais',
    shortTag: 'Homenagem',
    description:
      'Azul-marinho, grafite, prata e branco aplicados exatamente sobre a estrutura PREMIUM.',
    motif: 'dia_dos_pais',
    badgeText: 'Dia dos Pais',
    paletteSwatches: ['#0f294a', '#334155', '#cbd5e1', '#ffffff'],
    crm: {
      primary: '#1e3a5f',
      primaryHover: '#0f294a',
      secondary: '#475569',
      accent: '#94a3b8',
      sidebarBg: '#0f172a',
      sidebarFooterBg: '#090d16',
      sidebarBorder: '#334155',
      sidebarText: '#e2e8f0',
      sidebarMuted: '#94a3b8',
      sidebarHoverBg: 'rgba(148, 163, 184, 0.14)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(15, 23, 42, 0.90)',
      headerOverlayVia: 'rgba(30, 41, 59, 0.78)',
      headerOverlayTo: 'rgba(15, 23, 42, 0.90)',
      headerAccent: '#cbd5e1',
      pageBg: '#f1f5f9',
      cardTintBg: '#f8fafc',
      cardTintBorder: '#cbd5e1',
      tableHeaderBg: '#f1f5f9',
      tableHeaderText: '#1e293b',
      indicatorBg: '#e2e8f0',
      indicatorText: '#0f294a',
    },
    budget: {
      outerBorder: '#dce1ea',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#f8fafc',
      headerLightBgEnd: '#eef2f6',
      headerWaveBackStart: '#60a5fa',
      headerWaveBackEnd: '#d4af37',
      headerWaveFrontStart: '#005bb5',
      headerWaveFrontMid: '#003570',
      headerWaveFrontEnd: '#001942',
      headerGlowStroke: '#f5d061',
      headerBottomBarBg: '#c89b3c',
      dividerLine: '#e0aa2b',
      companyTitleColor: '#061a44',
      companyAddressColor: '#0f172a',
      bannerIconBorder: '#facc15',
      bannerIconBars: '#ffffff',
      bannerDivider: '#facc15',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#ffffff',
      bannerDateColor: '#fde047',

      blockBorder: '#e2d7cc',
      sectionHeaderFrom: '#005bb5',
      sectionHeaderTo: '#012250',
      sectionHeaderBg: '#023873',
      sectionHeaderText: '#ffffff',
      rowDivider: '#ede7df',
      labelColor: '#002a7a',

      tableSectionFrom: '#002e63',
      tableSectionMid: '#005bb5',
      tableSectionTo: '#002e63',
      tableSectionBg: '#023873',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #00234d 0%, #60a5fa 30%, #e0f2fe 50%, #60a5fa 70%, #00234d 100%)',
      tableHeaderFrom: '#002149',
      tableHeaderTo: '#000d2c',
      tableHeaderBg: '#001b3d',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.25)',
      tableBorder: '#e2e6ed',
      productDetailColor: '#003680',
      totalColumnBg: '#f3f5f8',
      itemTotalColor: '#002a7a',

      discountBg: '#f4f6fa',
      discountBorder: '#d7dee8',
      discountTextColor: '#061a44',
      discountValueColor: '#061a44',
      discountIconColor: '#003680',
      subtotalGradient:
        'linear-gradient(90deg, #f4f6fa 0%, #e2e8f0 28%, #004691 62%, #002149 85%, #000d2c 100%)',
      subtotalTextColor: '#061a44',
      subtotalValueColor: '#ffffff',
      subtotalBorder: '#d7dee8',
      specialPriceHighlight: false,

      freightBorder: '#e2d7cc',
      freightIconColor: '#002a7a',
      freightTitleColor: '#002a7a',
      freightDividerColor: '#e2aa3b',
      freightValueColor: '#002a7a',
      totalBoxBg: '#00173a',
      totalBoxBorder: '#0b3878',
      totalBoxLeftStart: '#001433',
      totalBoxLeftEnd: '#002c6a',
      totalBoxWaveStart: '#004294',
      totalBoxWaveMid: '#002d6b',
      totalBoxWaveEnd: '#00173c',
      totalBoxGlow: '#fde68a',
      totalIconBorder: '#facc15',
      totalLabelColor: '#ffffff',
      totalDividerColor: 'rgba(255, 255, 255, 0.35)',
      totalValueColor: '#ffffff',

      footerBorder: '#e8e2d9',
      footerColumnDivider: '#e0aa2b',
      footerAccent: '#061d4f',
      footerObsTitleColor: '#061d4f',
      footerScriptColor: '#061d4f',
      footerUnderlineColor: '#d49b1a',
      whatsappBorder: '#15803d',
      whatsappText: '#061d4f',

      waveBackStart: '#f5d061',
      waveBackEnd: '#d4af37',
      waveMidStart: '#004691',
      waveMidEnd: '#002149',
      waveGlow: '#fef08a',
      waveFrontStart: '#002659',
      waveFrontEnd: '#001333',

      headerBg: '#f8fafc',
      headerBorder: '#003680',
      slantedBannerBg: '#002659',
      slantedBannerAccent: '#fde047',
    },
  },

  halloween: {
    id: 'halloween',
    name: 'Halloween',
    shortTag: 'Temático',
    description:
      'Preto, roxo, laranja e branco aplicados exclusivamente como cores sobre o modelo PREMIUM.',
    motif: 'halloween',
    badgeText: 'Halloween',
    paletteSwatches: ['#111827', '#581c87', '#ea580c', '#ffffff'],
    crm: {
      primary: '#ea580c',
      primaryHover: '#c2410c',
      secondary: '#581c87',
      accent: '#f97316',
      sidebarBg: '#120d1d',
      sidebarFooterBg: '#090610',
      sidebarBorder: '#3b1c63',
      sidebarText: '#f3e8ff',
      sidebarMuted: '#fdba74',
      sidebarHoverBg: 'rgba(234, 88, 12, 0.14)',
      logoLightBackdrop: false,
      headerOverlayFrom: 'rgba(17, 12, 29, 0.92)',
      headerOverlayVia: 'rgba(88, 28, 135, 0.78)',
      headerOverlayTo: 'rgba(17, 12, 29, 0.92)',
      headerAccent: '#fb923c',
      pageBg: '#faf7f5',
      cardTintBg: '#fff7ed',
      cardTintBorder: '#fed7aa',
      tableHeaderBg: '#f3e8ff',
      tableHeaderText: '#581c87',
      indicatorBg: '#ffedd5',
      indicatorText: '#c2410c',
    },
    budget: {
      outerBorder: '#d8c5eb',
      headerLightBgStart: '#ffffff',
      headerLightBgMid: '#faf6fd',
      headerLightBgEnd: '#efe4fa',
      headerWaveBackStart: '#fb923c',
      headerWaveBackEnd: '#ea580c',
      headerWaveFrontStart: '#6b21a8',
      headerWaveFrontMid: '#3b0764',
      headerWaveFrontEnd: '#110a1c',
      headerGlowStroke: '#fb923c',
      headerBottomBarBg: '#581c87',
      dividerLine: '#ea580c',
      companyTitleColor: '#3b0764',
      companyAddressColor: '#1e293b',
      bannerIconBorder: '#fb923c',
      bannerIconBars: '#ffffff',
      bannerDivider: 'rgba(251, 146, 60, 0.75)',
      bannerTitleColor: '#ffffff',
      bannerSubtextColor: '#ffedd5',
      bannerDateColor: '#fb923c',

      blockBorder: '#dfd0ee',
      sectionHeaderFrom: '#6b21a8',
      sectionHeaderTo: '#3b0764',
      sectionHeaderBg: '#581c87',
      sectionHeaderText: '#ffffff',
      rowDivider: '#efe6f7',
      labelColor: '#581c87',

      tableSectionFrom: '#1f1630',
      tableSectionMid: '#581c87',
      tableSectionTo: '#1f1630',
      tableSectionBg: '#3b0764',
      tableSectionText: '#ffffff',
      tableBarGlow:
        'linear-gradient(90deg, #1f1630 0%, #ea580c 30%, #fed7aa 50%, #ea580c 70%, #1f1630 100%)',
      tableHeaderFrom: '#2e1065',
      tableHeaderTo: '#110a1c',
      tableHeaderBg: '#1f1630',
      tableHeaderText: '#ffffff',
      tableHeaderDivider: 'rgba(251, 146, 60, 0.35)',
      tableBorder: '#e6daf2',
      productDetailColor: '#c2410c',
      totalColumnBg: '#fff7ed',
      itemTotalColor: '#9a3412',

      discountBg: '#fff7ed',
      discountBorder: '#fed7aa',
      discountTextColor: '#581c87',
      discountValueColor: '#3b0764',
      discountIconColor: '#c2410c',
      subtotalGradient:
        'linear-gradient(90deg, #fff7ed 0%, #ffedd5 28%, #9a3412 62%, #181026 86%, #181026 100%)',
      subtotalTextColor: '#581c87',
      subtotalValueColor: '#fdba74',
      subtotalBorder: '#fed7aa',
      specialPriceHighlight: false,

      freightBorder: '#dfd0ee',
      freightIconColor: '#ea580c',
      freightTitleColor: '#581c87',
      freightDividerColor: '#ea580c',
      freightValueColor: '#9a3412',
      totalBoxBg: '#110a1c',
      totalBoxBorder: '#ea580c',
      totalBoxLeftStart: '#0b0612',
      totalBoxLeftEnd: '#2e1065',
      totalBoxWaveStart: '#ea580c',
      totalBoxWaveMid: '#581c87',
      totalBoxWaveEnd: '#181026',
      totalBoxGlow: '#fdba74',
      totalIconBorder: '#fb923c',
      totalLabelColor: '#fdba74',
      totalDividerColor: 'rgba(251, 146, 60, 0.5)',
      totalValueColor: '#ffffff',

      footerBorder: '#e7dbf3',
      footerColumnDivider: '#dfd0ee',
      footerAccent: '#ea580c',
      footerObsTitleColor: '#581c87',
      footerScriptColor: '#3b0764',
      footerUnderlineColor: '#ea580c',
      whatsappBorder: '#581c87',
      whatsappText: '#3b0764',

      waveBackStart: '#fb923c',
      waveBackEnd: '#ea580c',
      waveMidStart: '#6b21a8',
      waveMidEnd: '#3b0764',
      waveGlow: '#fdba74',
      waveFrontStart: '#181026',
      waveFrontEnd: '#090510',

      headerBg: '#faf6fd',
      headerBorder: '#ea580c',
      slantedBannerBg: '#181026',
      slantedBannerAccent: '#fb923c',
    },
  },
};

export function buildCustomThemeDefinition(custom: CustomThemeConfig): FenixThemeDefinition {
  const c = { ...DEFAULT_CUSTOM_THEME, ...custom };
  const primary = c.primary || '#00386e';
  const secondary = c.secondary || '#0b66c3';
  const accent = c.accent || '#1482e0';
  const headerBg = c.headerBg || '#00224a';
  const buttonBg = c.buttonBg || secondary;

  const primaryHover = adjustHex(buttonBg, -18);
  const softTint = hexToRgba(primary, 0.08);
  const softBorder = hexToRgba(primary, 0.28);
  const lightAccentTint = hexToRgba(accent, 0.14);
  const sidebarLightBg = isLightColor(headerBg);
  const bannerLightBg = isLightColor(headerBg);
  const sectionLightBg = isLightColor(secondary);
  const headerDarkEnd = adjustHex(headerBg, -28);
  const sectionDark = adjustHex(primary, -20);

  return {
    id: 'personalizado',
    name: 'Personalizado',
    shortTag: 'Customizável',
    description:
      'Cores escolhidas manualmente mantendo exatamente a estrutura oficial do modelo PREMIUM.',
    motif: 'nenhum',
    badgeText: 'Personalizado',
    paletteSwatches: [primary, secondary, accent, headerBg],
    crm: {
      primary: buttonBg,
      primaryHover,
      secondary,
      accent,
      sidebarBg: headerBg,
      sidebarFooterBg: adjustHex(headerBg, -12),
      sidebarBorder: adjustHex(headerBg, 18),
      sidebarText: sidebarLightBg ? '#0f172a' : '#f1f5f9',
      sidebarMuted: sidebarLightBg ? '#475569' : '#cbd5e1',
      sidebarHoverBg: sidebarLightBg ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.1)',
      logoLightBackdrop: false,
      headerOverlayFrom: hexToRgba(headerBg, 0.9),
      headerOverlayVia: hexToRgba(primary, 0.72),
      headerOverlayTo: hexToRgba(headerBg, 0.88),
      headerAccent: accent,
      pageBg: '#f4f6fa',
      cardTintBg: softTint,
      cardTintBorder: softBorder,
      tableHeaderBg: softTint,
      tableHeaderText: primary,
      indicatorBg: lightAccentTint,
      indicatorText: primary,
    },
    budget: {
      outerBorder: softBorder,
      headerLightBgStart: '#ffffff',
      headerLightBgMid: hexToRgba(accent, 0.04),
      headerLightBgEnd: hexToRgba(secondary, 0.14),
      headerWaveBackStart: accent,
      headerWaveBackEnd: secondary,
      headerWaveFrontStart: secondary,
      headerWaveFrontMid: headerBg,
      headerWaveFrontEnd: headerDarkEnd,
      headerGlowStroke: adjustHex(accent, 35),
      headerBottomBarBg: primary,
      dividerLine: primary,
      companyTitleColor: isLightColor(primary) ? '#0f172a' : primary,
      companyAddressColor: '#1e293b',
      bannerIconBorder: bannerLightBg ? '#0f172a' : 'rgba(255,255,255,0.85)',
      bannerIconBars: bannerLightBg ? '#0f172a' : '#ffffff',
      bannerDivider: bannerLightBg ? 'rgba(15,23,42,0.45)' : 'rgba(255,255,255,0.75)',
      bannerTitleColor: bannerLightBg ? '#0f172a' : '#ffffff',
      bannerSubtextColor: bannerLightBg ? '#334155' : '#f1f5f9',
      bannerDateColor: bannerLightBg ? '#0f172a' : '#ffffff',

      blockBorder: softBorder,
      sectionHeaderFrom: secondary,
      sectionHeaderTo: primary,
      sectionHeaderBg: primary,
      sectionHeaderText: sectionLightBg && isLightColor(primary) ? '#0f172a' : '#ffffff',
      rowDivider: hexToRgba(primary, 0.16),
      labelColor: isLightColor(primary) ? '#0f172a' : primary,

      tableSectionFrom: sectionDark,
      tableSectionMid: secondary,
      tableSectionTo: sectionDark,
      tableSectionBg: primary,
      tableSectionText: isLightColor(primary) ? '#0f172a' : '#ffffff',
      tableBarGlow: `linear-gradient(90deg, ${primary} 0%, ${accent} 35%, #ffffff 50%, ${accent} 65%, ${primary} 100%)`,
      tableHeaderFrom: primary,
      tableHeaderTo: headerBg,
      tableHeaderBg: primary,
      tableHeaderText: isLightColor(primary) && isLightColor(headerBg) ? '#0f172a' : '#ffffff',
      tableHeaderDivider: 'rgba(255, 255, 255, 0.28)',
      tableBorder: hexToRgba(primary, 0.2),
      productDetailColor: isLightColor(secondary) ? primary : secondary,
      totalColumnBg: hexToRgba(accent, 0.1),
      itemTotalColor: isLightColor(primary) ? '#0f172a' : primary,

      discountBg: hexToRgba(primary, 0.1),
      discountBorder: softBorder,
      discountTextColor: isLightColor(primary) ? '#0f172a' : primary,
      discountValueColor: isLightColor(primary) ? '#0f172a' : primary,
      discountIconColor: isLightColor(secondary)
        ? isLightColor(primary)
          ? '#0f172a'
          : primary
        : secondary,
      subtotalGradient: `linear-gradient(90deg, ${hexToRgba(primary, 0.1)} 0%, ${hexToRgba(secondary, 0.16)} 28%, ${secondary} 62%, ${primary} 85%, ${headerBg} 100%)`,
      subtotalTextColor: primary,
      subtotalValueColor: '#ffffff',
      subtotalBorder: softBorder,
      specialPriceHighlight: false,

      freightBorder: softBorder,
      freightIconColor: secondary,
      freightTitleColor: isLightColor(primary) ? '#0f172a' : primary,
      freightDividerColor: accent,
      freightValueColor: isLightColor(primary) ? '#0f172a' : primary,
      totalBoxBg: headerBg,
      totalBoxBorder: primary,
      totalBoxLeftStart: headerDarkEnd,
      totalBoxLeftEnd: headerBg,
      totalBoxWaveStart: accent,
      totalBoxWaveMid: secondary,
      totalBoxWaveEnd: primary,
      totalBoxGlow: adjustHex(accent, 45),
      totalIconBorder: '#ffffff',
      totalLabelColor: '#ffffff',
      totalDividerColor: 'rgba(255,255,255,0.55)',
      totalValueColor: '#ffffff',

      footerBorder: hexToRgba(primary, 0.18),
      footerColumnDivider: hexToRgba(primary, 0.22),
      footerAccent: secondary,
      footerObsTitleColor: isLightColor(primary) ? '#0f172a' : primary,
      footerScriptColor: isLightColor(primary) ? '#0f172a' : primary,
      footerUnderlineColor: accent,
      whatsappBorder: primary,
      whatsappText: isLightColor(primary) ? '#0f172a' : primary,

      waveBackStart: adjustHex(accent, 20),
      waveBackEnd: accent,
      waveMidStart: secondary,
      waveMidEnd: primary,
      waveGlow: adjustHex(accent, 50),
      waveFrontStart: headerBg,
      waveFrontEnd: headerDarkEnd,

      headerBg: '#fafbfd',
      headerBorder: accent,
      slantedBannerBg: headerBg,
      slantedBannerAccent: accent,
    },
  };
}

export const ALL_THEME_IDS: FenixThemeId[] = [
  'padrao',
  'natal',
  'novembro_black',
  'ano_novo',
  'carnaval',
  'pascoa',
  'dia_das_maes',
  'dia_dos_pais',
  'halloween',
  'personalizado',
];

export const DECORATABLE_THEME_IDS: FenixThemeId[] = [];

export function supportsDecoratedVariant(themeId: FenixThemeId): boolean {
  return DECORATABLE_THEME_IDS.includes(themeId);
}

export function getThemeDefinition(
  id: FenixThemeId,
  customConfig?: CustomThemeConfig
): FenixThemeDefinition {
  if (id === 'personalizado') {
    return buildCustomThemeDefinition(customConfig || DEFAULT_CUSTOM_THEME);
  }
  return STATIC_THEME_DEFINITIONS[id] || STATIC_THEME_DEFINITIONS.padrao;
}

export function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getScheduleStatus(state: FenixThemeState): {
  isScheduled: boolean;
  isWithinWindow: boolean;
  statusLabel: string;
} {
  if (!state.autoScheduleEnabled) {
    return {
      isScheduled: false,
      isWithinWindow: false,
      statusLabel: 'Ativação manual',
    };
  }
  const today = getLocalTodayIso();
  const hasStart = Boolean(state.startDate);
  const hasEnd = Boolean(state.endDate);

  if (!hasStart && !hasEnd) {
    return {
      isScheduled: true,
      isWithinWindow: false,
      statusLabel: 'Defina as datas de início e término para ativar o agendamento',
    };
  }

  const afterStart = !hasStart || today >= state.startDate;
  const beforeEnd = !hasEnd || today <= state.endDate;

  if (afterStart && beforeEnd) {
    return {
      isScheduled: true,
      isWithinWindow: true,
      statusLabel: `Período programado ativo (${getThemeDefinition(state.scheduledThemeId, state.customTheme).name})`,
    };
  }

  if (hasStart && today < state.startDate) {
    return {
      isScheduled: true,
      isWithinWindow: false,
      statusLabel: `Programado para iniciar em ${state.startDate.split('-').reverse().join('/')}`,
    };
  }

  return {
    isScheduled: true,
    isWithinWindow: false,
    statusLabel: 'Período programado encerrado — tema PREMIUM restaurado',
  };
}

export function getActiveThemeUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionActive = sessionStorage.getItem('fenix_session_active') === 'true';
    const sessionUser = sessionStorage.getItem('fenix_session_user');
    let rawUser: string | null = null;
    if (sessionActive && sessionUser) {
      rawUser = sessionUser;
    } else {
      const lsAuthActive = localStorage.getItem('fenix_auth_active') === 'true';
      const lsUser = localStorage.getItem('fenix_active_user_name');
      if (lsAuthActive && lsUser) {
        rawUser = lsUser;
      }
    }
    if (!rawUser || isUserRevoked(rawUser)) return null;
    const canonical = normalizeAuthorizedName(rawUser) || rawUser.trim();
    if (!canonical || isUserRevoked(canonical)) return null;
    const resolvedId = getUserIdByName(canonical) || getSellerIdForUser(canonical);
    if (resolvedId) return resolvedId;
    return canonical
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_');
  } catch {
    return null;
  }
}

export function getUserThemeStorageKey(userId?: string | null): string | null {
  const id = userId !== undefined ? userId : getActiveThemeUserId();
  if (!id) return null;
  return `${THEME_USER_STORAGE_PREFIX}${id}`;
}

export function getThemeState(): FenixThemeState {
  try {
    const userKey = getUserThemeStorageKey();
    if (!userKey) {
      return {
        ...DEFAULT_THEME_STATE,
        customTheme: { ...DEFAULT_CUSTOM_THEME },
      };
    }
    const raw = getLocalRawSafe(userKey);
    if (!raw) {
      return {
        ...DEFAULT_THEME_STATE,
        customTheme: { ...DEFAULT_CUSTOM_THEME },
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {
        ...DEFAULT_THEME_STATE,
        customTheme: { ...DEFAULT_CUSTOM_THEME },
      };
    }
    return {
      ...DEFAULT_THEME_STATE,
      ...parsed,
      customTheme: {
        ...DEFAULT_CUSTOM_THEME,
        ...(parsed.customTheme || {}),
      },
    };
  } catch {
    return {
      ...DEFAULT_THEME_STATE,
      customTheme: { ...DEFAULT_CUSTOM_THEME },
    };
  }
}

export function getEffectiveActiveThemeId(state: FenixThemeState): FenixThemeId {
  if (currentPreviewThemeId) {
    return currentPreviewThemeId;
  }
  if (state.autoScheduleEnabled) {
    const sched = getScheduleStatus(state);
    if (sched.isWithinWindow) {
      return state.scheduledThemeId || 'padrao';
    }
    if (state.endDate && getLocalTodayIso() > state.endDate && state.activeThemeId === state.scheduledThemeId) {
      return 'padrao';
    }
  }
  return state.activeThemeId || 'padrao';
}

export function shouldApplyToTarget(
  state: FenixThemeState,
  target: 'crm' | 'orcamento' | 'pdf'
): boolean {
  const effectiveId = getEffectiveActiveThemeId(state);
  if (effectiveId === 'padrao') return false;

  if (target === 'crm') {
    return (
      state.applyToSystem &&
      (state.scope === 'crm' || state.scope === 'ambos')
    );
  }
  if (target === 'orcamento') {
    return (
      state.applyToBudgets &&
      (state.scope === 'orcamentos' || state.scope === 'ambos')
    );
  }
  return (
    state.applyToPdf &&
    state.applyToBudgets &&
    (state.scope === 'orcamentos' || state.scope === 'ambos')
  );
}

export function resolveThemeForTarget(target: 'crm' | 'orcamento' | 'pdf'): {
  theme: FenixThemeDefinition;
  isThemed: boolean;
  showDecorations: boolean;
  isPreview: boolean;
  state: FenixThemeState;
} {
  const state = getThemeState();
  const effectiveId = getEffectiveActiveThemeId(state);
  const customCfg =
    effectiveId === 'personalizado' && currentPreviewCustomOverride
      ? currentPreviewCustomOverride
      : state.customTheme;

  const isPreview = Boolean(currentPreviewThemeId);
  const applies =
    effectiveId !== 'padrao' &&
    (isPreview
      ? target === 'crm'
        ? state.scope === 'crm' || state.scope === 'ambos'
        : target === 'orcamento'
          ? state.scope === 'orcamentos' || state.scope === 'ambos'
          : state.applyToPdf && (state.scope === 'orcamentos' || state.scope === 'ambos')
      : shouldApplyToTarget(state, target));

  const resolvedTheme = applies
    ? getThemeDefinition(effectiveId, customCfg)
    : STATIC_THEME_DEFINITIONS.padrao;

  // Orçamentos e PDFs seguem rigorosamente o modelo PREMIUM com substituição exclusiva de cores
  const showDecorations = false;

  return {
    theme: resolvedTheme,
    isThemed: applies,
    showDecorations,
    isPreview,
    state,
  };
}

export function applyThemeToDocument(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const { theme, isThemed } = resolveThemeForTarget('crm');

  if (!isThemed) {
    root.removeAttribute('data-fenix-crm-theme');
    root.setAttribute('data-fenix-theme-id', 'padrao');
    root.style.removeProperty('--fenix-primary');
    root.style.removeProperty('--fenix-primary-hover');
    root.style.removeProperty('--fenix-secondary');
    root.style.removeProperty('--fenix-accent');
    root.style.removeProperty('--fenix-sidebar-bg');
    root.style.removeProperty('--fenix-sidebar-footer');
    root.style.removeProperty('--fenix-page-bg');
    root.style.removeProperty('--fenix-card-tint-bg');
    root.style.removeProperty('--fenix-card-tint-border');
    root.style.removeProperty('--fenix-table-header-bg');
    root.style.removeProperty('--fenix-table-header-text');
    root.style.removeProperty('--fenix-indicator-bg');
    root.style.removeProperty('--fenix-indicator-text');
    return;
  }

  root.setAttribute('data-fenix-crm-theme', 'active');
  root.setAttribute('data-fenix-theme-id', theme.id);
  root.style.setProperty('--fenix-primary', theme.crm.primary);
  root.style.setProperty('--fenix-primary-hover', theme.crm.primaryHover);
  root.style.setProperty('--fenix-secondary', theme.crm.secondary);
  root.style.setProperty('--fenix-accent', theme.crm.accent);
  root.style.setProperty('--fenix-sidebar-bg', theme.crm.sidebarBg);
  root.style.setProperty('--fenix-sidebar-footer', theme.crm.sidebarFooterBg);
  root.style.setProperty('--fenix-page-bg', theme.crm.pageBg);
  root.style.setProperty('--fenix-card-tint-bg', theme.crm.cardTintBg);
  root.style.setProperty('--fenix-card-tint-border', theme.crm.cardTintBorder);
  root.style.setProperty('--fenix-table-header-bg', theme.crm.tableHeaderBg);
  root.style.setProperty('--fenix-table-header-text', theme.crm.tableHeaderText);
  root.style.setProperty('--fenix-indicator-bg', theme.crm.indicatorBg);
  root.style.setProperty('--fenix-indicator-text', theme.crm.indicatorText);
}

function notifyThemeChanged(): void {
  applyThemeToDocument();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
  }
}

const USER_THEMES_REMOTE_KEY = 'fenix_user_themes_v1';

function readLocalUserThemesMap(): Record<string, FenixThemeState> {
  try {
    const raw = getLocalRawSafe(USER_THEMES_REMOTE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}
  return {};
}

async function syncUserThemeToSupabase(userId: string, state: FenixThemeState): Promise<void> {
  if (!userId) return;
  const localMap = readLocalUserThemesMap();
  localMap[userId] = state;
  setLocalCollectionSafe(USER_THEMES_REMOTE_KEY, localMap);

  if (isEmergencyOfflineMode()) {
    markRecordPendingSync({
      collectionKey: USER_THEMES_REMOTE_KEY,
      itemId: '__meta__',
      op: 'collection',
      item: localMap,
      user: userId,
    });
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    markRecordPendingSync({
      collectionKey: USER_THEMES_REMOTE_KEY,
      itemId: '__meta__',
      op: 'collection',
      item: localMap,
      user: userId,
    });
    return;
  }

  try {
    const { data: remoteRow } = await withAbortableTimeout<any>(
      (signal) =>
        client
          .from('fenix_kv_store')
          .select('data')
          .eq('key', USER_THEMES_REMOTE_KEY)
          .abortSignal(signal)
          .maybeSingle(),
      10000,
      'Tempo limite ao consultar temas por usuário.'
    );

    let mergedMap: Record<string, FenixThemeState> = { ...localMap };
    if (remoteRow?.data && typeof remoteRow.data === 'object' && !Array.isArray(remoteRow.data)) {
      mergedMap = { ...(remoteRow.data as Record<string, FenixThemeState>), ...localMap, [userId]: state };
    }

    const nowIso = new Date().toISOString();
    recordSelfSave(USER_THEMES_REMOTE_KEY, nowIso);
    const { data: upsertRow, error } = await withAbortableTimeout<any>(
      (signal) =>
        client
          .from('fenix_kv_store')
          .upsert(
            {
              key: USER_THEMES_REMOTE_KEY,
              data: mergedMap,
              updated_at: nowIso,
              updated_by: userId,
            },
            { onConflict: 'key' }
          )
          .select('updated_at')
          .abortSignal(signal)
          .maybeSingle(),
      10000,
      'Tempo limite ao salvar tema por usuário.'
    );
    if (error) throw error;
    if (upsertRow?.updated_at) {
      recordSelfSave(USER_THEMES_REMOTE_KEY, String(upsertRow.updated_at));
    }
    setLocalCollectionSafe(USER_THEMES_REMOTE_KEY, mergedMap);
    removePendingSyncRecord(USER_THEMES_REMOTE_KEY, '__meta__');
  } catch {
    markRecordPendingSync({
      collectionKey: USER_THEMES_REMOTE_KEY,
      itemId: '__meta__',
      op: 'collection',
      item: readLocalUserThemesMap(),
      user: userId,
    });
  }
}

export function applyRemoteUserThemesMap(remoteMap: Record<string, FenixThemeState> | null | undefined): void {
  if (!remoteMap || typeof remoteMap !== 'object') return;
  const activeUserId = getActiveThemeUserId();
  if (!activeUserId) return;
  const remoteState = remoteMap[activeUserId];
  if (!remoteState || typeof remoteState !== 'object') return;

  const userKey = getUserThemeStorageKey(activeUserId);
  if (!userKey) return;

  const localState = getThemeState();
  const remTs = Date.parse(remoteState.updatedAt || '') || 0;
  const locTs = Date.parse(localState.updatedAt || '') || 0;
  const hasLocalSaved = Boolean(getLocalRawSafe(userKey));

  if (!hasLocalSaved || remTs > locTs) {
    const normalized: FenixThemeState = {
      ...DEFAULT_THEME_STATE,
      ...remoteState,
      customTheme: {
        ...DEFAULT_CUSTOM_THEME,
        ...(remoteState.customTheme || {}),
      },
    };
    setLocalCollectionSafe(userKey, normalized);
    notifyThemeChanged();
  }
}

export function saveThemeState(next: Partial<FenixThemeState>): FenixThemeState {
  const current = getThemeState();
  const merged: FenixThemeState = {
    ...current,
    ...next,
    customTheme: {
      ...current.customTheme,
      ...(next.customTheme || {}),
    },
    updatedAt: new Date().toISOString(),
  };
  const activeUserId = getActiveThemeUserId();
  const userKey = getUserThemeStorageKey(activeUserId);
  if (userKey) {
    setLocalCollectionSafe(userKey, merged);
  }
  if (activeUserId) {
    syncUserThemeToSupabase(activeUserId, merged).catch(() => {});
  }
  notifyThemeChanged();
  return merged;
}

export function activateTheme(themeId: FenixThemeId): FenixThemeState {
  currentPreviewThemeId = null;
  currentPreviewCustomOverride = null;
  const current = getThemeState();
  const next: Partial<FenixThemeState> = {
    activeThemeId: themeId,
  };
  if (current.autoScheduleEnabled && themeId !== current.scheduledThemeId) {
    const sched = getScheduleStatus(current);
    if (sched.isWithinWindow) {
      next.autoScheduleEnabled = false;
    }
  }
  return saveThemeState(next);
}

export function deactivateTheme(): FenixThemeState {
  currentPreviewThemeId = null;
  currentPreviewCustomOverride = null;
  return saveThemeState({
    activeThemeId: 'padrao',
    autoScheduleEnabled: false,
  });
}

export function setPreviewTheme(
  themeId: FenixThemeId | null,
  customOverride?: CustomThemeConfig | null
): void {
  currentPreviewThemeId = themeId;
  currentPreviewCustomOverride = customOverride || null;
  notifyThemeChanged();
}

export function getPreviewThemeId(): FenixThemeId | null {
  return currentPreviewThemeId;
}

export async function runWithPdfThemeExport<T>(fn: () => Promise<T>): Promise<T> {
  currentExportRenderTarget = 'pdf';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-fenix-pdf-export', 'true');
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
  }
  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 48)))
  );
  try {
    return await fn();
  } finally {
    currentExportRenderTarget = null;
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-fenix-pdf-export');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
    }
  }
}

let lastTrackedThemeUserId: string | null = null;

export function initThemeSystem(): () => void {
  lastTrackedThemeUserId = getActiveThemeUserId();
  applyRemoteUserThemesMap(readLocalUserThemesMap());
  applyThemeToDocument();
  if (typeof window === 'undefined') return () => {};

  const handleAuthOrStorageChange = () => {
    const currentUid = getActiveThemeUserId();
    if (currentUid !== lastTrackedThemeUserId) {
      lastTrackedThemeUserId = currentUid;
      currentPreviewThemeId = null;
      currentPreviewCustomOverride = null;
      applyRemoteUserThemesMap(readLocalUserThemesMap());
    }
    applyThemeToDocument();
    window.dispatchEvent(new Event(THEME_UPDATED_EVENT));
  };

  const handleRemoteUserThemes = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail && typeof detail === 'object') {
      applyRemoteUserThemesMap(detail as Record<string, FenixThemeState>);
    } else {
      applyRemoteUserThemesMap(readLocalUserThemesMap());
    }
  };

  window.addEventListener('fenix_offline_hydrated', handleAuthOrStorageChange);
  window.addEventListener('fenix_auth_updated', handleAuthOrStorageChange);
  window.addEventListener('fenix_remote_user_themes_updated', handleRemoteUserThemes);
  window.addEventListener('storage', handleAuthOrStorageChange);

  const interval = window.setInterval(() => {
    applyThemeToDocument();
  }, 60_000);

  return () => {
    window.removeEventListener('fenix_offline_hydrated', handleAuthOrStorageChange);
    window.removeEventListener('fenix_auth_updated', handleAuthOrStorageChange);
    window.removeEventListener('fenix_remote_user_themes_updated', handleRemoteUserThemes);
    window.removeEventListener('storage', handleAuthOrStorageChange);
    window.clearInterval(interval);
  };
}

export function useFenixTheme(target: 'crm' | 'orcamento' | 'pdf' = 'crm') {
  const effectiveTarget =
    target === 'orcamento' && currentExportRenderTarget === 'pdf' ? 'pdf' : target;
  const [snapshot, setSnapshot] = useState(() => resolveThemeForTarget(effectiveTarget));

  useEffect(() => {
    const sync = () => {
      const nextTarget =
        target === 'orcamento' && currentExportRenderTarget === 'pdf' ? 'pdf' : target;
      setSnapshot(resolveThemeForTarget(nextTarget));
    };
    sync();
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
  }, [target]);

  return snapshot;
}
