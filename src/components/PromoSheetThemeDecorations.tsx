import React from 'react';
import { PromoSheetThemeId } from '../utils/promocoesService';

export interface PromoSheetVisualTheme {
  id: PromoSheetThemeId;
  outerBorder: string;
  outerInnerRing: string;
  primary: string;
  primaryDark: string;
  primaryBorder: string;
  dividerColor: string;
  tagColor: string;
  badgeTopBg: string;
  badgeTopText: string;
  badgeTopBorder: string;
  badgeBottomBg: string;
  badgeBottomText: string;
  badgeBottomBorder: string;
  waveBack: string;
  waveBackHighlight: string;
  waveFrontStart: string;
  waveFrontMid: string;
  waveFrontEnd: string;
  waveAccentStroke: string;
  sectionHeaderBg: string;
  sectionHeaderBorderBottom: string;
  sectionHeaderShadow: string;
  subHeaderBg: string;
  subHeaderBorder: string;
  subcategoryRowBg: string;
  subcategoryRowText: string;
  cellBorder: string;
  conditionBarBg: string;
  conditionBarBorder: string;
  conditionIconColor: string;
  conditionIconBoxBg: string;
  conditionIconBoxBorder: string;
  conditionTextColor: string;
  commercialBoxBg: string;
  commercialBoxBorder: string;
  text: string;
  mutedText: string;
}

export function getPromoSheetThemeVisual(
  themeId: PromoSheetThemeId,
  isMono: boolean
): PromoSheetVisualTheme {
  if (isMono) {
    return {
      id: themeId,
      outerBorder: '#9ca3af',
      outerInnerRing: 'none',
      primary: '#111827',
      primaryDark: '#030712',
      primaryBorder: '#1f2937',
      dividerColor: '#1f2937',
      tagColor: '#111827',
      badgeTopBg: '#1f2937',
      badgeTopText: '#ffffff',
      badgeTopBorder: 'none',
      badgeBottomBg: '#111827',
      badgeBottomText: '#ffffff',
      badgeBottomBorder: 'none',
      waveBack: '#d1d5db',
      waveBackHighlight: '#e5e7eb',
      waveFrontStart: '#374151',
      waveFrontMid: '#1f2937',
      waveFrontEnd: '#111827',
      waveAccentStroke: '#9ca3af',
      sectionHeaderBg: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
      sectionHeaderBorderBottom: 'none',
      sectionHeaderShadow: 'none',
      subHeaderBg: '#ffffff',
      subHeaderBorder: '#6b7280',
      subcategoryRowBg: '#e5e7eb',
      subcategoryRowText: '#111827',
      cellBorder: '#9ca3af',
      conditionBarBg: '#111827',
      conditionBarBorder: 'none',
      conditionIconColor: '#ffffff',
      conditionIconBoxBg: 'rgba(255,255,255,0.1)',
      conditionIconBoxBorder: '1px solid rgba(255,255,255,0.35)',
      conditionTextColor: '#ffffff',
      commercialBoxBg: '#f9fafb',
      commercialBoxBorder: '#9ca3af',
      text: '#030712',
      mutedText: '#374151',
    };
  }

  switch (themeId) {
    case 'natal':
      return {
        id: 'natal',
        outerBorder: '#991B1B',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(212, 175, 55, 0.55)',
        primary: '#991B1B',
        primaryDark: '#6B0F14',
        primaryBorder: '#991B1B',
        dividerColor: '#111827',
        tagColor: '#111827',
        badgeTopBg: 'linear-gradient(180deg, #E11D24 0%, #B91C1C 55%, #880E14 100%)',
        badgeTopText: '#ffffff',
        badgeTopBorder: '1px solid rgba(245, 208, 97, 0.5)',
        badgeBottomBg: 'linear-gradient(180deg, #C81920 0%, #991B1B 55%, #6B0F14 100%)',
        badgeBottomText: '#ffffff',
        badgeBottomBorder: '1px solid rgba(245, 208, 97, 0.6)',
        waveBack: '#E5B94C',
        waveBackHighlight: '#FEF08A',
        waveFrontStart: '#DC2626',
        waveFrontMid: '#991B1B',
        waveFrontEnd: '#5F0C10',
        waveAccentStroke: '#FCE588',
        sectionHeaderBg: 'linear-gradient(180deg, #D92027 0%, #A61016 55%, #6E0A0E 100%)',
        sectionHeaderBorderBottom: '2px solid #D4AF37',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#D4A5A5',
        subcategoryRowBg: '#FCE7E7',
        subcategoryRowText: '#881318',
        cellBorder: '#E5C7C7',
        conditionBarBg: 'linear-gradient(180deg, #B91C1C 0%, #8E1115 55%, #660A0D 100%)',
        conditionBarBorder: '1.5px solid #D4AF37',
        conditionIconColor: '#FCE588',
        conditionIconBoxBg: 'rgba(255, 255, 255, 0.12)',
        conditionIconBoxBorder: '1px solid rgba(252, 229, 136, 0.6)',
        conditionTextColor: '#ffffff',
        commercialBoxBg: '#FFFDF9',
        commercialBoxBorder: '#DFC5A0',
        text: '#1F1212',
        mutedText: '#6E3B3B',
      };

    case 'novembro_black':
      return {
        id: 'novembro_black',
        outerBorder: '#18181B',
        outerInnerRing: 'inset 0 0 0 2px #E5C158',
        primary: '#18181B',
        primaryDark: '#09090B',
        primaryBorder: '#18181B',
        dividerColor: '#09090B',
        tagColor: '#09090B',
        badgeTopBg: 'linear-gradient(180deg, #FEF08A 0%, #E5B94C 52%, #B48216 100%)',
        badgeTopText: '#09090B',
        badgeTopBorder: '1px solid #9A7116',
        badgeBottomBg: 'linear-gradient(180deg, #3F3F46 0%, #18181B 48%, #09090B 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1.5px solid #E5C158',
        waveBack: '#E5C158',
        waveBackHighlight: '#FEF08A',
        waveFrontStart: '#27272A',
        waveFrontMid: '#18181B',
        waveFrontEnd: '#050507',
        waveAccentStroke: '#FDE047',
        sectionHeaderBg: 'linear-gradient(180deg, #3F3F46 0%, #18181B 48%, #09090B 100%)',
        sectionHeaderBorderBottom: '2px solid #D4AF37',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#A1A1AA',
        subcategoryRowBg: '#FEF3C7',
        subcategoryRowText: '#18181B',
        cellBorder: '#D4D4D8',
        conditionBarBg: 'linear-gradient(180deg, #27272A 0%, #111114 55%, #050507 100%)',
        conditionBarBorder: '1.5px solid #D4AF37',
        conditionIconColor: '#FDE047',
        conditionIconBoxBg: 'rgba(229, 193, 88, 0.14)',
        conditionIconBoxBorder: '1px solid rgba(229, 193, 88, 0.7)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#FFFDF5',
        commercialBoxBorder: '#D8C89E',
        text: '#09090B',
        mutedText: '#3F3F46',
      };

    case 'ano_novo':
      return {
        id: 'ano_novo',
        outerBorder: '#0E2854',
        outerInnerRing: 'inset 0 0 0 2px #E5C158',
        primary: '#0F2B5B',
        primaryDark: '#071733',
        primaryBorder: '#0F2B5B',
        dividerColor: '#0F2B5B',
        tagColor: '#0F2B5B',
        badgeTopBg: 'linear-gradient(180deg, #1E4D99 0%, #102F66 55%, #081C40 100%)',
        badgeTopText: '#FFFFFF',
        badgeTopBorder: '1px solid rgba(253, 224, 71, 0.55)',
        badgeBottomBg: 'linear-gradient(180deg, #153B7A 0%, #0A2147 55%, #051126 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1px solid rgba(253, 224, 71, 0.65)',
        waveBack: '#F5D061',
        waveBackHighlight: '#FEF08A',
        waveFrontStart: '#1D4ED8',
        waveFrontMid: '#0F2B5B',
        waveFrontEnd: '#061329',
        waveAccentStroke: '#FDE047',
        sectionHeaderBg: 'linear-gradient(180deg, #1D4B94 0%, #0F2B5B 55%, #061530 100%)',
        sectionHeaderBorderBottom: '2px solid #E5C158',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#94A3B8',
        subcategoryRowBg: '#E2EBF8',
        subcategoryRowText: '#0A2147',
        cellBorder: '#CBD5E1',
        conditionBarBg: 'linear-gradient(180deg, #153B7A 0%, #0A2147 55%, #051126 100%)',
        conditionBarBorder: '1.5px solid #E5C158',
        conditionIconColor: '#FDE047',
        conditionIconBoxBg: 'rgba(253, 224, 71, 0.14)',
        conditionIconBoxBorder: '1px solid rgba(253, 224, 71, 0.65)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#F8FAFD',
        commercialBoxBorder: '#C7D6EA',
        text: '#0B172A',
        mutedText: '#334155',
      };

    case 'carnaval':
      return {
        id: 'carnaval',
        outerBorder: '#7E22CE',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(250, 204, 21, 0.45)',
        primary: '#7E22CE',
        primaryDark: '#581C87',
        primaryBorder: '#7E22CE',
        dividerColor: '#111827',
        tagColor: '#111827',
        badgeTopBg: 'linear-gradient(180deg, #D946EF 0%, #9333EA 55%, #6B21A8 100%)',
        badgeTopText: '#FFFFFF',
        badgeTopBorder: '1px solid rgba(250, 204, 21, 0.55)',
        badgeBottomBg: 'linear-gradient(180deg, #9333EA 0%, #6B21A8 55%, #4C1D95 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1px solid rgba(250, 204, 21, 0.6)',
        waveBack: '#FACC15',
        waveBackHighlight: '#EC4899',
        waveFrontStart: '#C026D3',
        waveFrontMid: '#7E22CE',
        waveFrontEnd: '#581C87',
        waveAccentStroke: '#FDE047',
        sectionHeaderBg: 'linear-gradient(180deg, #C026D3 0%, #7E22CE 55%, #581C87 100%)',
        sectionHeaderBorderBottom: '2px solid #FACC15',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#C084FC',
        subcategoryRowBg: '#F3E0FF',
        subcategoryRowText: '#6B21A8',
        cellBorder: '#E9D5FF',
        conditionBarBg: 'linear-gradient(180deg, #9333EA 0%, #6B21A8 55%, #4C1D95 100%)',
        conditionBarBorder: '1.5px solid #FACC15',
        conditionIconColor: '#FDE047',
        conditionIconBoxBg: 'rgba(255,255,255,0.14)',
        conditionIconBoxBorder: '1px solid rgba(253, 224, 71, 0.6)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#FDF9FF',
        commercialBoxBorder: '#DFC4FA',
        text: '#230D3A',
        mutedText: '#5B3A7D',
      };

    case 'pascoa':
      return {
        id: 'pascoa',
        outerBorder: '#6B21A8',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(233, 213, 255, 0.65)',
        primary: '#6B21A8',
        primaryDark: '#4C1D95',
        primaryBorder: '#6B21A8',
        dividerColor: '#111827',
        tagColor: '#111827',
        badgeTopBg: 'linear-gradient(180deg, #9333EA 0%, #7E22CE 55%, #581C87 100%)',
        badgeTopText: '#FFFFFF',
        badgeTopBorder: '1px solid rgba(245, 208, 254, 0.6)',
        badgeBottomBg: 'linear-gradient(180deg, #7E22CE 0%, #581C87 55%, #3B0764 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1px solid rgba(245, 208, 254, 0.5)',
        waveBack: '#F5D0FE',
        waveBackHighlight: '#FBCFE8',
        waveFrontStart: '#A855F7',
        waveFrontMid: '#7E22CE',
        waveFrontEnd: '#581C87',
        waveAccentStroke: '#E9D5FF',
        sectionHeaderBg: 'linear-gradient(180deg, #9333EA 0%, #6B21A8 55%, #4C1D95 100%)',
        sectionHeaderBorderBottom: '2px solid #E9D5FF',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.26)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#C4B5FD',
        subcategoryRowBg: '#EFE6FD',
        subcategoryRowText: '#581C87',
        cellBorder: '#E5DCF9',
        conditionBarBg: 'linear-gradient(180deg, #7E22CE 0%, #581C87 55%, #3B0764 100%)',
        conditionBarBorder: '1.5px solid #D8B4FE',
        conditionIconColor: '#F5D0FE',
        conditionIconBoxBg: 'rgba(255,255,255,0.14)',
        conditionIconBoxBorder: '1px solid rgba(245, 208, 254, 0.6)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#FCFAFF',
        commercialBoxBorder: '#DDD6FE',
        text: '#24123D',
        mutedText: '#5A417D',
      };

    case 'dia_das_maes':
      return {
        id: 'dia_das_maes',
        outerBorder: '#9D174D',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(249, 168, 212, 0.55)',
        primary: '#9D174D',
        primaryDark: '#831843',
        primaryBorder: '#9D174D',
        dividerColor: '#111827',
        tagColor: '#111827',
        badgeTopBg: 'linear-gradient(180deg, #EC4899 0%, #BE185D 55%, #831843 100%)',
        badgeTopText: '#FFFFFF',
        badgeTopBorder: '1px solid rgba(251, 207, 232, 0.65)',
        badgeBottomBg: 'linear-gradient(180deg, #BE185D 0%, #9D174D 55%, #6D0F35 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1px solid rgba(251, 207, 232, 0.55)',
        waveBack: '#F9A8D4',
        waveBackHighlight: '#FDE2EE',
        waveFrontStart: '#EC4899',
        waveFrontMid: '#BE185D',
        waveFrontEnd: '#831843',
        waveAccentStroke: '#FBCFE8',
        sectionHeaderBg: 'linear-gradient(180deg, #EC4899 0%, #BE185D 52%, #831843 100%)',
        sectionHeaderBorderBottom: '2px solid #F9A8D4',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#F472B6',
        subcategoryRowBg: '#FCE4F0',
        subcategoryRowText: '#9D174D',
        cellBorder: '#FBCFE8',
        conditionBarBg: 'linear-gradient(180deg, #DB2777 0%, #9D174D 55%, #700F38 100%)',
        conditionBarBorder: '1.5px solid #F9A8D4',
        conditionIconColor: '#FDE2EE',
        conditionIconBoxBg: 'rgba(255,255,255,0.14)',
        conditionIconBoxBorder: '1px solid rgba(253, 226, 238, 0.6)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#FFF9FC',
        commercialBoxBorder: '#F7C6DF',
        text: '#380C1E',
        mutedText: '#7D3B55',
      };

    case 'dia_dos_pais':
      return {
        id: 'dia_dos_pais',
        outerBorder: '#0F294A',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(148, 163, 184, 0.5)',
        primary: '#0F294A',
        primaryDark: '#091830',
        primaryBorder: '#0F294A',
        dividerColor: '#0F294A',
        tagColor: '#0F294A',
        badgeTopBg: 'linear-gradient(180deg, #255799 0%, #133563 55%, #0A203E 100%)',
        badgeTopText: '#FFFFFF',
        badgeTopBorder: '1px solid rgba(203, 213, 225, 0.5)',
        badgeBottomBg: 'linear-gradient(180deg, #163C6E 0%, #0C2342 55%, #061326 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1px solid rgba(203, 213, 225, 0.45)',
        waveBack: '#BFDBFE',
        waveBackHighlight: '#E2E8F0',
        waveFrontStart: '#3B82F6',
        waveFrontMid: '#163B6B',
        waveFrontEnd: '#091830',
        waveAccentStroke: '#CBD5E1',
        sectionHeaderBg: 'linear-gradient(180deg, #1E4474 0%, #0F294A 55%, #071428 100%)',
        sectionHeaderBorderBottom: '2px solid #94A3B8',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.24)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#94A3B8',
        subcategoryRowBg: '#E2ECF7',
        subcategoryRowText: '#0F294A',
        cellBorder: '#CBD5E1',
        conditionBarBg: 'linear-gradient(180deg, #163A66 0%, #0D2340 55%, #071428 100%)',
        conditionBarBorder: '1.5px solid #94A3B8',
        conditionIconColor: '#E2E8F0',
        conditionIconBoxBg: 'rgba(255,255,255,0.12)',
        conditionIconBoxBorder: '1px solid rgba(226, 232, 240, 0.55)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#F8FAFC',
        commercialBoxBorder: '#CBD5E1',
        text: '#0F172A',
        mutedText: '#334155',
      };

    case 'halloween':
      return {
        id: 'halloween',
        outerBorder: '#9A3412',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(245, 158, 11, 0.55)',
        primary: '#9A3412',
        primaryDark: '#431407',
        primaryBorder: '#9A3412',
        dividerColor: '#111827',
        tagColor: '#111827',
        badgeTopBg: 'linear-gradient(180deg, #FB923C 0%, #EA580C 55%, #9A3412 100%)',
        badgeTopText: '#FFFFFF',
        badgeTopBorder: '1px solid rgba(253, 224, 71, 0.5)',
        badgeBottomBg: 'linear-gradient(180deg, #C2410C 0%, #7C2D12 55%, #431407 100%)',
        badgeBottomText: '#FFFFFF',
        badgeBottomBorder: '1px solid rgba(251, 191, 36, 0.55)',
        waveBack: '#FBBF24',
        waveBackHighlight: '#FDE68A',
        waveFrontStart: '#EA580C',
        waveFrontMid: '#9A3412',
        waveFrontEnd: '#431407',
        waveAccentStroke: '#FCD34D',
        sectionHeaderBg: 'linear-gradient(180deg, #EA580C 0%, #9A3412 55%, #431407 100%)',
        sectionHeaderBorderBottom: '2px solid #F59E0B',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.26)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#FB923C',
        subcategoryRowBg: '#FFEDD5',
        subcategoryRowText: '#7C2D12',
        cellBorder: '#FED7AA',
        conditionBarBg: 'linear-gradient(180deg, #EA580C 0%, #9A3412 55%, #5C1D09 100%)',
        conditionBarBorder: '1.5px solid #F59E0B',
        conditionIconColor: '#FDE68A',
        conditionIconBoxBg: 'rgba(255,255,255,0.14)',
        conditionIconBoxBorder: '1px solid rgba(253, 230, 138, 0.6)',
        conditionTextColor: '#FFFFFF',
        commercialBoxBg: '#FFFAF4',
        commercialBoxBorder: '#FCD5A8',
        text: '#291206',
        mutedText: '#7C3E1D',
      };

    case 'padrao':
    default:
      return {
        id: 'padrao',
        outerBorder: '#0B56A8',
        outerInnerRing: 'inset 0 0 0 1.5px rgba(147, 197, 253, 0.5)',
        primary: '#0B3F7D',
        primaryDark: '#072B54',
        primaryBorder: '#0B4F9E',
        dividerColor: '#0B3F7D',
        tagColor: '#0B3F7D',
        badgeTopBg: 'linear-gradient(180deg, #1273D4 0%, #0B55A6 55%, #073873 100%)',
        badgeTopText: '#ffffff',
        badgeTopBorder: '1px solid rgba(186, 230, 253, 0.4)',
        badgeBottomBg: 'linear-gradient(180deg, #0D5CB3 0%, #093F7D 55%, #062752 100%)',
        badgeBottomText: '#ffffff',
        badgeBottomBorder: '1px solid rgba(186, 230, 253, 0.35)',
        waveBack: '#93C5FD',
        waveBackHighlight: '#E0F2FE',
        waveFrontStart: '#38BDF8',
        waveFrontMid: '#0C63B8',
        waveFrontEnd: '#072B54',
        waveAccentStroke: '#BAE6FD',
        sectionHeaderBg: 'linear-gradient(180deg, #1474D4 0%, #0B4D96 55%, #062D5E 100%)',
        sectionHeaderBorderBottom: '2px solid #38BDF8',
        sectionHeaderShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
        subHeaderBg: '#ffffff',
        subHeaderBorder: '#94a3b8',
        subcategoryRowBg: '#DCEBFA',
        subcategoryRowText: '#0B3F7D',
        cellBorder: '#cbd5e1',
        conditionBarBg: 'linear-gradient(180deg, #0D67C2 0%, #09478C 55%, #062D5E 100%)',
        conditionBarBorder: '1.5px solid #38BDF8',
        conditionIconColor: '#E0F2FE',
        conditionIconBoxBg: 'rgba(255,255,255,0.14)',
        conditionIconBoxBorder: '1px solid rgba(224, 242, 254, 0.6)',
        conditionTextColor: '#ffffff',
        commercialBoxBg: '#f8fafc',
        commercialBoxBorder: '#cbd5e1',
        text: '#0f172a',
        mutedText: '#334155',
      };
  }
}

interface PromoSheetArtworkProps {
  themeId: PromoSheetThemeId;
  uid: string;
  isMono?: boolean;
}

/**
 * Cabeçalho contínuo + onda superior integrada exatamente como no modelo visual oficial.
 * Sem costuras horizontais entre a curva lateral direita e a onda sob o cabeçalho.
 */
export const PromoSheetUnifiedHeaderBackdrop: React.FC<PromoSheetArtworkProps> = ({
  themeId,
  uid,
  isMono,
}) => {
  const visual = getPromoSheetThemeVisual(themeId, Boolean(isMono));
  const gid = (name: string) => `psuh-${themeId}-${name}-${uid}`;

  return (
    <svg
      viewBox="0 0 794 128"
      width="794"
      height="128"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <defs>
        <linearGradient id={gid('wave-back')} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={visual.waveBackHighlight} />
          <stop offset="50%" stopColor={visual.waveBack} />
          <stop offset="100%" stopColor={visual.waveBackHighlight} />
        </linearGradient>
        <linearGradient id={gid('wave-front')} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={visual.waveFrontStart} />
          <stop offset="55%" stopColor={visual.waveFrontMid} />
          <stop offset="100%" stopColor={visual.waveFrontEnd} />
        </linearGradient>
        <linearGradient id={gid('right-panel')} x1="0%" y1="0%" x2="100%" y2="100%">
          {themeId === 'padrao' && (
            <>
              <stop offset="0%" stopColor="#DBEAFE" />
              <stop offset="45%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#073168" />
            </>
          )}
          {themeId === 'natal' && (
            <>
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="52%" stopColor="#991B1B" />
              <stop offset="100%" stopColor="#58080D" />
            </>
          )}
          {themeId === 'novembro_black' && (
            <>
              <stop offset="0%" stopColor="#27272A" />
              <stop offset="45%" stopColor="#121215" />
              <stop offset="100%" stopColor="#040405" />
            </>
          )}
          {themeId === 'ano_novo' && (
            <>
              <stop offset="0%" stopColor="#153B7A" />
              <stop offset="50%" stopColor="#0B2047" />
              <stop offset="100%" stopColor="#040E21" />
            </>
          )}
          {themeId === 'carnaval' && (
            <>
              <stop offset="0%" stopColor="#E879F9" />
              <stop offset="48%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#4C1D95" />
            </>
          )}
          {themeId === 'pascoa' && (
            <>
              <stop offset="0%" stopColor="#F5D0FE" />
              <stop offset="55%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#6B21A8" />
            </>
          )}
          {themeId === 'dia_das_maes' && (
            <>
              <stop offset="0%" stopColor="#FCE7F3" />
              <stop offset="52%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#9D174D" />
            </>
          )}
          {themeId === 'dia_dos_pais' && (
            <>
              <stop offset="0%" stopColor="#1E4474" />
              <stop offset="50%" stopColor="#0F294A" />
              <stop offset="100%" stopColor="#071326" />
            </>
          )}
          {themeId === 'halloween' && (
            <>
              <stop offset="0%" stopColor="#7C2D12" />
              <stop offset="55%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#230C33" />
            </>
          )}
        </linearGradient>
        <linearGradient id={gid('gold')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="35%" stopColor="#FACC15" />
          <stop offset="72%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#85580A" />
        </linearGradient>
      </defs>

      {/* Onda suave secundária no fundo esquerdo-centro */}
      {!isMono && (
        <path
          d="M0,118 C185,96 420,118 610,64 C665,48 705,18 725,0 L794,0 L794,128 L0,128 Z"
          fill={visual.waveBackHighlight}
          opacity="0.45"
        />
      )}

      {/* Faixa curva contínua da lateral direita descendo para a onda superior */}
      {!isMono && (
        <path
          d="M0,122 C210,104 480,102 620,66 C660,55 680,26 692,0 L794,0 L794,128 L0,128 Z"
          fill={`url(#${gid('right-panel')})`}
        />
      )}

      {/* Crista luminosa / fita secundária da onda superior */}
      <path
        d="M0,120 C215,96 465,112 622,74 C672,62 698,28 712,0 L724,0 C708,34 680,70 624,84 C465,122 215,108 0,126 Z"
        fill={`url(#${gid('wave-back')})`}
      />

      {/* Onda principal frontal contínua sobre a borda inferior do cabeçalho */}
      <path
        d="M0,123 C230,102 475,118 660,88 C716,78 756,64 794,48 L794,128 L0,128 Z"
        fill={`url(#${gid('wave-front')})`}
      />

      {/* Filete de brilho ao longo da onda principal */}
      <path
        d="M0,123 C230,102 475,118 660,88 C716,78 756,64 794,48"
        fill="none"
        stroke={visual.waveAccentStroke}
        strokeWidth="1.6"
        opacity="0.88"
      />

      {/* Recorte inferior limpo branco para a área das tabelas logo abaixo da onda */}
      <path
        d="M0,128 C255,112 515,126 794,104 L794,128 Z"
        fill="#ffffff"
      />

      {/* =================================================================== */}
      {/* ILUSTRAÇÕES TEMÁTICAS EXCLUSIVAS NO CANTO SUPERIOR DIREITO          */}
      {/* =================================================================== */}
      {!isMono && themeId === 'padrao' && (
        <g>
          <path
            d="M540,102 C618,86 675,46 708,0 L748,0 C715,52 650,92 548,108 Z"
            fill="#E0F2FE"
            opacity="0.35"
          />
          <path
            d="M620,96 C688,78 738,44 770,0 L794,0 L794,64 C746,84 688,96 620,96 Z"
            fill="#0284C7"
            opacity="0.45"
          />
          <circle cx="718" cy="24" r="2.2" fill="#E0F2FE" opacity="0.9" />
          <circle cx="764" cy="42" r="1.8" fill="#BAE6FD" opacity="0.85" />
          <circle cx="672" cy="76" r="1.6" fill="#FFFFFF" opacity="0.7" />
        </g>
      )}

      {!isMono && themeId === 'natal' && (
        <g>
          <defs>
            <radialGradient id={gid('bauble')} cx="35%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="28%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#713F12" />
            </radialGradient>
            <linearGradient id={gid('bow-red')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="42%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
          {/* Ramos densos de pinheiro verde escuro e médio */}
          <g stroke="#052E16" strokeWidth="2.8" strokeLinecap="round">
            <path d="M622,0 L656,22 M636,0 L666,28 M650,0 L678,34 M666,0 L692,38 M684,0 L708,42 M704,0 L726,42 M726,0 L746,42 M748,0 L768,38 M772,0 L792,28" />
            <path d="M794,16 L750,48 M794,30 L746,60 M794,44 L750,72 M794,58 L748,86 M794,74 L742,98 M794,88 L754,106" />
          </g>
          <g stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" opacity="0.82">
            <path d="M638,2 L664,22 M664,2 L688,30 M692,2 L714,34 M724,2 L742,32 M756,2 L772,28 M788,24 L752,52 M790,50 L752,74 M788,78 L748,96" />
          </g>
          {/* Cordão de luzinhas quentes natalinas */}
          <path d="M618,4 C664,26 724,26 788,8" fill="none" stroke="#CA8A04" strokeWidth="1.1" />
          {[
            { cx: 642, cy: 14, r: 6 },
            { cx: 682, cy: 22, r: 6.5 },
            { cx: 766, cy: 14, r: 6 },
          ].map((l, idx) => (
            <g key={idx}>
              <circle cx={l.cx} cy={l.cy} r={l.r} fill="#FDE047" opacity="0.35" />
              <circle cx={l.cx} cy={l.cy} r={l.r * 0.45} fill="#FFFBEB" />
            </g>
          ))}
          {/* Grande laço de cetim vermelho com frisos dourados */}
          <g transform="translate(724, 38)">
            <path d="M-4,4 L-22,42 L-8,35 L1,8 Z" fill={`url(#${gid('bow-red')})`} stroke="#FDE047" strokeWidth="0.7" />
            <path d="M4,4 L24,44 L11,36 L2,8 Z" fill={`url(#${gid('bow-red')})`} stroke="#FDE047" strokeWidth="0.7" />
            <path d="M-2,0 C-22,-24 -42,-12 -32,8 C-25,18 -9,11 0,3 Z" fill={`url(#${gid('bow-red')})`} stroke="#FCA5A5" strokeWidth="0.8" />
            <path d="M2,0 C22,-24 42,-12 32,8 C25,18 9,11 0,3 Z" fill={`url(#${gid('bow-red')})`} stroke="#FCA5A5" strokeWidth="0.8" />
            <ellipse cx="0" cy="2" rx="7.5" ry="6" fill="#991B1B" stroke="#FDE047" strokeWidth="1" />
          </g>
          {/* Bola dourada natalina 3D pendurada */}
          <line x1="724" y1="45" x2="724" y2="57" stroke="#FDE047" strokeWidth="1.3" />
          <rect x="719" y="55" width="10" height="5" rx="1.4" fill={`url(#${gid('gold')})`} />
          <circle cx="724" cy="79" r="20" fill={`url(#${gid('bauble')})`} stroke="#FEF08A" strokeWidth="0.9" />
          <ellipse cx="716" cy="70" rx="5.5" ry="3.5" transform="rotate(-26 716 70)" fill="#FFFFFF" opacity="0.7" />
          {/* Bolinha vermelha lateral */}
          <circle cx="690" cy="86" r="10" fill="#DC2626" stroke="#F5D061" strokeWidth="0.8" />
          <circle cx="687" cy="82" r="2.8" fill="#FCA5A5" opacity="0.8" />
        </g>
      )}

      {!isMono && themeId === 'novembro_black' && (
        <g>
          <path
            d="M545,98 C625,84 678,44 714,0 L738,0 C702,48 648,90 558,104 Z"
            fill={`url(#${gid('gold')})`}
            opacity="0.72"
          />
          <path
            d="M622,94 C692,76 742,40 774,0 L794,0 L794,58 C744,82 686,94 622,94 Z"
            fill="#18181B"
            opacity="0.88"
          />
          <path
            d="M608,96 C682,76 730,38 764,0"
            fill="none"
            stroke="#FDE047"
            strokeWidth="1.5"
            opacity="0.9"
          />
          {/* Brilhos diamante dourados */}
          <path d="M744,24 L746,32 L754,34 L746,36 L744,44 L742,36 L734,34 L742,32 Z" fill="#FEF08A" />
          <path d="M684,54 L685.5,59 L690.5,60.5 L685.5,62 L684,67 L682.5,62 L677.5,60.5 L682.5,59 Z" fill="#FDE047" />
          <circle cx="768" cy="70" r="2" fill="#FEF08A" opacity="0.9" />
          <circle cx="712" cy="18" r="1.8" fill="#FDE047" opacity="0.8" />
        </g>
      )}

      {!isMono && themeId === 'ano_novo' && (
        <g>
          <defs>
            <linearGradient id={gid('champagne')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="42%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          {/* Fogo de artifício radial dourado no canto superior direito */}
          <g transform="translate(744, 30)" stroke="#FDE047" strokeLinecap="round">
            {Array.from({ length: 16 }).map((_, idx) => {
              const angle = (idx * Math.PI * 2) / 16;
              const len = idx % 2 === 0 ? 38 : 26;
              return (
                <g key={idx}>
                  <line
                    x1={Math.cos(angle) * 6}
                    y1={Math.sin(angle) * 6}
                    x2={Math.cos(angle) * len}
                    y2={Math.sin(angle) * len}
                    strokeWidth={idx % 2 === 0 ? 1.6 : 1.1}
                    opacity={0.92}
                  />
                  <circle
                    cx={Math.cos(angle) * (len + 2)}
                    cy={Math.sin(angle) * (len + 2)}
                    r="1.3"
                    fill="#FFFBEB"
                    stroke="none"
                  />
                </g>
              );
            })}
            <circle cx="0" cy="0" r="3.5" fill="#FFFBEB" stroke="none" />
          </g>
          {/* Segundo foco de brilho menor */}
          <g transform="translate(658, 28)" stroke="#FACC15" strokeLinecap="round" opacity="0.88">
            {Array.from({ length: 10 }).map((_, idx) => {
              const angle = (idx * Math.PI * 2) / 10;
              return (
                <line
                  key={idx}
                  x1={Math.cos(angle) * 4}
                  y1={Math.sin(angle) * 4}
                  x2={Math.cos(angle) * 19}
                  y2={Math.sin(angle) * 19}
                  strokeWidth="1.2"
                />
              );
            })}
          </g>
          {/* Duas taças de champanhe inclinadas brindando */}
          <g transform="translate(700, 68) rotate(-14)">
            <path d="M-9,-30 L9,-30 L7,-2 C5,7 2,12 0,12 C-2,12 -5,7 -7,-2 Z" fill={`url(#${gid('champagne')})`} stroke="#FEF9C3" strokeWidth="1.2" />
            <line x1="-4" y1="-26" x2="-3" y2="-4" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
            <line x1="0" y1="12" x2="0" y2="36" stroke="#FDE047" strokeWidth="2" />
            <ellipse cx="0" cy="37" rx="10" ry="2.5" fill="#FDE047" />
          </g>
          <g transform="translate(728, 68) rotate(14)">
            <path d="M-9,-30 L9,-30 L7,-2 C5,7 2,12 0,12 C-2,12 -5,7 -7,-2 Z" fill={`url(#${gid('champagne')})`} stroke="#FEF9C3" strokeWidth="1.2" />
            <line x1="-4" y1="-26" x2="-3" y2="-4" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
            <line x1="0" y1="12" x2="0" y2="36" stroke="#FDE047" strokeWidth="2" />
            <ellipse cx="0" cy="37" rx="10" ry="2.5" fill="#FDE047" />
          </g>
          {/* Bolhas e estrelas */}
          <circle cx="714" cy="28" r="2.4" fill="#FEF9C3" />
          <circle cx="719" cy="20" r="1.7" fill="#FDE047" />
          <circle cx="709" cy="16" r="1.5" fill="#FEF08A" />
          <circle cx="772" cy="80" r="2" fill="#FEF08A" />
          <circle cx="642" cy="70" r="1.8" fill="#FDE047" />
        </g>
      )}

      {!isMono && themeId === 'carnaval' && (
        <g>
          <defs>
            <linearGradient id={gid('mask')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>
          {/* Plumas exuberantes de Carnaval */}
          <path d="M718,48 C704,20 700,4 718,2 C730,8 730,28 724,48 Z" fill="#EC4899" stroke="#FBCFE8" strokeWidth="0.6" />
          <path d="M728,48 C728,16 738,2 754,4 C760,15 752,32 734,48 Z" fill="#FACC15" stroke="#FEF9C3" strokeWidth="0.6" />
          <path d="M738,50 C752,22 768,12 782,18 C782,32 764,44 742,54 Z" fill="#38BDF8" stroke="#BAE6FD" strokeWidth="0.6" />
          <path d="M710,50 C690,26 678,16 686,6 C698,8 710,25 716,48 Z" fill="#A855F7" stroke="#E9D5FF" strokeWidth="0.6" />
          {/* Máscara Veneziana dourada */}
          <g transform="translate(722, 68) rotate(-8)">
            <path
              d="M-38,-6 C-28,-20 -8,-15 0,-6 C8,-15 28,-20 38,-6 C42,5 34,18 19,18 C8,18 4,9 0,9 C-4,9 -8,18 -19,18 C-34,18 -42,5 -38,-6 Z"
              fill={`url(#${gid('mask')})`}
              stroke="#FEF08A"
              strokeWidth="1.8"
            />
            <ellipse cx="-16" cy="1" rx="9" ry="5.5" fill="#2E1065" stroke="#FDE047" strokeWidth="1" />
            <ellipse cx="16" cy="1" rx="9" ry="5.5" fill="#2E1065" stroke="#FDE047" strokeWidth="1" />
            <polygon points="0,-6 3,0 0,6 -3,0" fill="#FEF08A" />
          </g>
          {/* Serpentinas e confetes festivos */}
          <path d="M624,78 C640,62 654,84 672,68" fill="none" stroke="#FACC15" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M636,34 C648,22 662,38 676,24" fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="654" cy="48" r="3.2" fill="#FACC15" />
          <circle cx="672" cy="90" r="3" fill="#EC4899" />
          <circle cx="778" cy="88" r="3" fill="#38BDF8" />
          <rect x="630" y="18" width="5" height="5" transform="rotate(24 630 18)" fill="#A855F7" />
        </g>
      )}

      {!isMono && themeId === 'pascoa' && (
        <g>
          {/* Gramado primaveril no canto inferior direito */}
          <path
            d="M642,110 C658,84 676,90 692,76 C708,88 728,80 746,74 C766,84 780,82 794,92 L794,114 L642,114 Z"
            fill="#4ADE80"
          />
          <path
            d="M656,114 C676,92 696,96 716,86 C740,94 766,88 794,98 L794,114 Z"
            fill="#16A34A"
          />
          {/* Coelhinho branco com orelhas rosadas */}
          <g transform="translate(718, 64)">
            <ellipse cx="-10" cy="-34" rx="7" ry="22" transform="rotate(-10 -10 -34)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <ellipse cx="-10" cy="-33" rx="3.4" ry="14" transform="rotate(-10 -10 -33)" fill="#F9A8D4" />
            <ellipse cx="10" cy="-34" rx="7" ry="22" transform="rotate(10 10 -34)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <ellipse cx="10" cy="-33" rx="3.4" ry="14" transform="rotate(10 10 -33)" fill="#F9A8D4" />
            <ellipse cx="0" cy="18" rx="19" ry="19" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <circle cx="0" cy="-6" r="17.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            <circle cx="-6" cy="-9" r="2.3" fill="#1E293B" />
            <circle cx="6" cy="-9" r="2.3" fill="#1E293B" />
            <circle cx="-6.7" cy="-9.8" r="0.9" fill="#FFFFFF" />
            <circle cx="5.3" cy="-9.8" r="0.9" fill="#FFFFFF" />
            <ellipse cx="-10.5" cy="-3" rx="3.5" ry="2.2" fill="#FBCFE8" />
            <ellipse cx="10.5" cy="-3" rx="3.5" ry="2.2" fill="#FBCFE8" />
            <polygon points="-2.8,-3 2.8,-3 0,0" fill="#F472B6" />
          </g>
          {/* Ovos de Páscoa decorados */}
          <g transform="translate(758, 84) rotate(8)">
            <ellipse cx="0" cy="0" rx="13" ry="17.5" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.3" />
            <path d="M-12,-4 L-5,2 L0,-4 L5,2 L12,-4" fill="none" stroke="#FEF9C3" strokeWidth="1.8" />
            <circle cx="-5" cy="8" r="2.2" fill="#FCE7F3" />
            <circle cx="5" cy="8" r="2.2" fill="#FCE7F3" />
          </g>
          <g transform="translate(682, 90) rotate(-10)">
            <ellipse cx="0" cy="0" rx="9.5" ry="13" fill="#EC4899" stroke="#FBCFE8" strokeWidth="1.1" />
            <path d="M-9,0 L9,0" stroke="#FEF08A" strokeWidth="2.2" />
          </g>
        </g>
      )}

      {!isMono && themeId === 'dia_das_maes' && (
        <g>
          <defs>
            <linearGradient id={gid('petal')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1F7" />
              <stop offset="48%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#BE185D" />
            </linearGradient>
          </defs>
          {/* Folhas verdes */}
          <path d="M724,66 C696,68 682,88 692,102 C710,98 724,82 724,66 Z" fill="#15803D" />
          <path d="M750,62 C774,66 788,84 780,100 C764,96 750,78 750,62 Z" fill="#166534" />
          {/* Grande lírio rosa em flor */}
          <g transform="translate(736, 54)">
            <path d="M0,0 C-15,-30 -4,-48 0,-52 C4,-48 15,-30 0,0 Z" fill={`url(#${gid('petal')})`} stroke="#FBCFE8" strokeWidth="0.8" />
            <path d="M0,0 C-28,-17 -45,-4 -43,4 C-34,13 -15,8 0,0 Z" fill={`url(#${gid('petal')})`} stroke="#FBCFE8" strokeWidth="0.8" />
            <path d="M0,0 C28,-17 45,-4 43,4 C34,13 15,8 0,0 Z" fill={`url(#${gid('petal')})`} stroke="#FBCFE8" strokeWidth="0.8" />
            <path d="M0,0 C-26,15 -28,36 -17,40 C-7,38 2,19 0,0 Z" fill={`url(#${gid('petal')})`} stroke="#FBCFE8" strokeWidth="0.8" />
            <path d="M0,0 C26,15 28,36 17,40 C7,38 -2,19 0,0 Z" fill={`url(#${gid('petal')})`} stroke="#FBCFE8" strokeWidth="0.8" />
            <line x1="0" y1="0" x2="-6" y2="-15" stroke="#FEF08A" strokeWidth="1.3" />
            <line x1="0" y1="0" x2="6" y2="-15" stroke="#FEF08A" strokeWidth="1.3" />
            <line x1="0" y1="0" x2="0" y2="-18" stroke="#FEF08A" strokeWidth="1.3" />
            <circle cx="-6" cy="-15" r="2" fill="#F59E0B" />
            <circle cx="6" cy="-15" r="2" fill="#F59E0B" />
            <circle cx="0" cy="-18" r="2" fill="#F59E0B" />
          </g>
          {/* Pétalas delicadas flutuando */}
          <ellipse cx="648" cy="52" rx="6.5" ry="3.4" transform="rotate(-24 648 52)" fill="#F472B6" opacity="0.82" />
          <ellipse cx="672" cy="84" rx="5.2" ry="2.8" transform="rotate(18 672 84)" fill="#FB7185" opacity="0.78" />
          <ellipse cx="662" cy="24" rx="4.8" ry="2.5" transform="rotate(12 662 24)" fill="#F9A8D4" opacity="0.85" />
        </g>
      )}

      {!isMono && themeId === 'dia_dos_pais' && (
        <g>
          <defs>
            <linearGradient id={gid('tie')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="55%" stopColor="#0F294A" />
              <stop offset="100%" stopColor="#051020" />
            </linearGradient>
          </defs>
          {/* Riscas de giz sutis de alfaiataria */}
          <g stroke="#94A3B8" strokeWidth="0.8" opacity="0.22">
            <line x1="628" y1="0" x2="584" y2="106" />
            <line x1="654" y1="0" x2="610" y2="106" />
            <line x1="680" y1="0" x2="636" y2="106" />
            <line x1="706" y1="0" x2="662" y2="106" />
            <line x1="766" y1="0" x2="722" y2="106" />
          </g>
          {/* Colarinho branco social + Gravata listrada corporativa */}
          <g transform="translate(724, 0)">
            <polygon points="-40,0 -8,34 -34,48 -54,14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.1" />
            <polygon points="40,0 8,34 34,48 54,14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.1" />
            <polygon points="-14,6 14,6 10,27 -10,27" fill={`url(#${gid('tie')})`} stroke="#94A3B8" strokeWidth="1" />
            <polygon points="-10,27 10,27 18,98 0,108 -18,98" fill={`url(#${gid('tie')})`} stroke="#94A3B8" strokeWidth="1" />
            <line x1="-11" y1="43" x2="11" y2="33" stroke="#E2E8F0" strokeWidth="2.4" />
            <line x1="-13" y1="64" x2="13" y2="52" stroke="#E2E8F0" strokeWidth="2.4" />
            <line x1="-15" y1="84" x2="15" y2="71" stroke="#E2E8F0" strokeWidth="2.4" />
          </g>
        </g>
      )}

      {!isMono && themeId === 'halloween' && (
        <g>
          <defs>
            <radialGradient id={gid('pumpkin')} cx="42%" cy="34%" r="66%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="46%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </radialGradient>
          </defs>
          {/* Teia de aranha no canto superior direito */}
          <g stroke="#CBD5E1" strokeWidth="0.9" opacity="0.5" fill="none">
            <line x1="794" y1="0" x2="732" y2="0" />
            <line x1="794" y1="0" x2="740" y2="28" />
            <line x1="794" y1="0" x2="760" y2="50" />
            <line x1="794" y1="0" x2="788" y2="62" />
            <path d="M766,0 Q772,18 794,26" />
            <path d="M746,0 Q756,32 794,44" />
          </g>
          {/* Morcegos */}
          <path d="M674,26 C666,20 658,22 652,28 C658,28 664,30 668,34 C670,31 672,30 674,30 C676,30 678,31 680,34 C684,30 690,28 696,28 C690,22 682,20 674,26 Z" fill="#09090B" />
          <path d="M726,18 C720,13 713,15 708,20 C713,20 718,21 721,25 C723,22 724,21 726,21 C728,21 729,22 731,25 C734,21 739,20 744,20 C739,15 732,13 726,18 Z" fill="#09090B" />
          {/* Abóbora Jack-o'-lantern iluminada */}
          <g transform="translate(728, 76)">
            <path d="M-4,-25 C-3,-33 2,-37 7,-36 L4,-24 Z" fill="#3F6212" />
            <ellipse cx="-17" cy="0" rx="15" ry="23" fill="#C2410C" stroke="#7C2D12" strokeWidth="1" />
            <ellipse cx="17" cy="0" rx="15" ry="23" fill="#C2410C" stroke="#7C2D12" strokeWidth="1" />
            <ellipse cx="-7" cy="0" rx="14" ry="24" fill={`url(#${gid('pumpkin')})`} stroke="#9A3412" strokeWidth="0.9" />
            <ellipse cx="7" cy="0" rx="14" ry="24" fill={`url(#${gid('pumpkin')})`} stroke="#9A3412" strokeWidth="0.9" />
            <ellipse cx="0" cy="0" rx="9.5" ry="25" fill={`url(#${gid('pumpkin')})`} />
            <polygon points="-14,-8 -5,-4 -12,-1" fill="#FEF08A" />
            <polygon points="14,-8 5,-4 12,-1" fill="#FEF08A" />
            <polygon points="0,-2 -3,3 3,3" fill="#FEF08A" />
            <path d="M-16,6 Q0,19 16,6 L11,13 L6,10 L2,14 L-2,14 L-6,10 L-11,13 Z" fill="#FEF08A" />
          </g>
        </g>
      )}
    </svg>
  );
};

export const PromoSheetBottomWave: React.FC<PromoSheetArtworkProps> = ({
  themeId,
  uid,
  isMono,
}) => {
  const visual = getPromoSheetThemeVisual(themeId, Boolean(isMono));
  const gid = (name: string) => `psbw-${themeId}-${name}-${uid}`;

  return (
    <div style={{ width: '100%', lineHeight: 0, position: 'relative' }}>
      <svg
        viewBox="0 0 794 34"
        width="794"
        height="34"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '30px' }}
      >
        <defs>
          <linearGradient id={gid('back')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={visual.waveBack} />
            <stop offset="50%" stopColor={visual.waveBackHighlight} />
            <stop offset="100%" stopColor={visual.waveBack} />
          </linearGradient>
          <linearGradient id={gid('front')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={visual.waveFrontEnd} />
            <stop offset="55%" stopColor={visual.waveFrontMid} />
            <stop offset="100%" stopColor={visual.waveFrontStart} />
          </linearGradient>
        </defs>
        <path
          d="M0,16 C210,4 520,26 794,4 L794,34 L0,34 Z"
          fill={`url(#${gid('back')})`}
        />
        <path
          d="M0,21 C230,8 510,29 794,9 L794,34 L0,34 Z"
          fill={`url(#${gid('front')})`}
        />
        <path
          d="M0,21 C230,8 510,29 794,9"
          fill="none"
          stroke={visual.waveAccentStroke}
          strokeWidth="1.3"
          opacity="0.78"
        />
        {!isMono && themeId === 'carnaval' && (
          <g>
            <circle cx="48" cy="24" r="2.6" fill="#FACC15" />
            <circle cx="96" cy="28" r="2.2" fill="#38BDF8" />
            <circle cx="155" cy="25" r="2.3" fill="#EC4899" />
            <circle cx="420" cy="28" r="2" fill="#38BDF8" />
            <circle cx="695" cy="20" r="2.6" fill="#FACC15" />
            <circle cx="745" cy="24" r="2.4" fill="#EC4899" />
          </g>
        )}
        {!isMono && (themeId === 'natal' || themeId === 'ano_novo' || themeId === 'novembro_black') && (
          <g>
            <circle cx="56" cy="24" r="2" fill="#FEF08A" opacity="0.9" />
            <circle cx="195" cy="24" r="1.8" fill="#FEF08A" opacity="0.85" />
            <circle cx="520" cy="27" r="1.6" fill="#FEF08A" opacity="0.8" />
            <circle cx="728" cy="18" r="2.2" fill="#FEF08A" opacity="0.95" />
          </g>
        )}
        {!isMono && themeId === 'dia_das_maes' && (
          <g>
            <ellipse cx="64" cy="25" rx="5.5" ry="2.6" transform="rotate(-18 64 25)" fill="#F9A8D4" opacity="0.85" />
            <ellipse cx="732" cy="21" rx="5.5" ry="2.6" transform="rotate(14 732 21)" fill="#F9A8D4" opacity="0.85" />
          </g>
        )}
      </svg>
    </div>
  );
};
