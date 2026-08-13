import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedPressable from '../components/AnimatedPressable';
import ProductCard from '../components/ProductCard';
import {
  bodyShapes,
  getStyleAnalysis,
  heights,
  occasions,
  skinTones,
  styleVibes
} from '../data/appData';
import { api } from '../services/api';
import { useAppState } from '../state/AppContext';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';

const loadingSteps = [
  'Menganalisis profil warna kulitmu...',
  'Memetakan proporsi tubuh...',
  'Mencocokkan preferensi gaya...',
  'Menyusun rekomendasi berbasis data...',
  'Memfinalisasi profil gaya personalmu...'
];

export default function StylistScreen({
  isActive = true,
  onNavigate,
  onProductPress,
  onBack,
  registerBackHandler
}) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(0);
  const { products, styleProfile, saveStyleProfile, resetStyleProfile, wishlist, toggleWishlist } = useAppState();

  const result = useMemo(() => {
    if (step === 'result') return styleProfile ?? getStyleAnalysis(answers);
    return null;
  }, [answers, step, styleProfile]);

  useEffect(() => {
    if (step !== 'analyzing') return undefined;
    setLoadingIndex(0);
    const interval = setInterval(() => {
      setLoadingIndex((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 420);
    const timeout = setTimeout(() => {
      const analysis = getStyleAnalysis(answers);
      saveStyleProfile(analysis);
      setStep('result');
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [answers, saveStyleProfile, step]);

  const canContinue =
    (step === 1 && !!answers.skinTone) ||
    (step === 2 && !!answers.bodyShape) ||
    (step === 3 && !!answers.height) ||
    (step === 4 && (answers.styleVibe?.length ?? 0) > 0) ||
    (step === 5 && (answers.occasion?.length ?? 0) > 0);

  const next = () => {
    if (step === 5) {
      setStep('analyzing');
      return;
    }
    if (typeof step === 'number') setStep(step + 1);
  };

  const back = () => {
    if (typeof step === 'number' && step > 1) {
      setStep(step - 1);
      return true;
    }
    return onBack?.() ?? false;
  };

  useEffect(() => {
    if (!isActive) return undefined;
    return registerBackHandler?.(back);
  }, [isActive, step, onBack, registerBackHandler]);

  const restart = () => {
    resetStyleProfile();
    setAnswers({});
    setStep(1);
  };

  if (step === 'analyzing') {
    return <AnalyzingScreen loadingIndex={loadingIndex} />;
  }

  if (step === 'result' && result) {
    return (
      <ResultScreen
        result={result}
        onBack={onBack}
        onRestart={restart}
        onNavigate={onNavigate}
        onProductPress={onProductPress}
        products={products}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    );
  }

  return (
    <ScrollView
      style={layout.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          {(step > 1 || onBack) && (
            <AnimatedPressable style={styles.backButton} onPress={back} scaleDown={0.90}>
              <Feather name="chevron-left" size={18} color={colors.forest} />
            </AnimatedPressable>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.kickerRow}>
              <MaterialCommunityIcons name="lightning-bolt" size={11} color={colors.forest} />
              <Text style={styles.kicker}>CIRCULAI AI STYLIST</Text>
            </View>
            <Text style={styles.stepText}>Langkah {step} dari 5</Text>
          </View>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step}/5</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item} style={[styles.progressBar, item <= step && styles.progressBarActive]} />
          ))}
        </View>
      </View>

      {step === 1 && (
        <QuestionBlock
          title="Bagaimana warna kulitmu?"
          desc="AI akan menentukan palet warna pakaian yang paling menonjolkan kulitmu secara alami."
        >
          <View style={styles.skinGrid}>
            {skinTones.map((tone) => {
              const selected = answers.skinTone === tone.id;
              return (
                <AnimatedPressable
                  key={tone.id}
                  style={[
                    styles.skinCard,
                    {
                      backgroundColor: selected ? 'rgba(47,79,58,0.06)' : colors.white,
                      borderColor: selected ? colors.forest : colors.lightGray,
                    },
                    selected && shadows.sm
                  ]}
                  onPress={() => setAnswers((current) => ({ ...current, skinTone: tone.id }))}
                  scaleDown={0.97}
                >
                  <View style={[styles.skinSwatch, { backgroundColor: tone.hex }]} />
                  <View style={layout.flex}>
                    <Text style={styles.optionTitle}>{tone.label}</Text>
                    <Text style={styles.optionDesc}>{tone.sub}</Text>
                  </View>
                  {selected && <CheckDot />}
                </AnimatedPressable>
              );
            })}
          </View>
        </QuestionBlock>
      )}

      {step === 2 && (
        <QuestionBlock
          title="Bentuk tubuhmu?"
          desc="AI akan merekomendasikan potongan yang paling flattering untuk proporsi tubuhmu."
        >
          <View style={styles.listGap}>
            {bodyShapes.map((shape) => {
              const selected = answers.bodyShape === shape.id;
              return (
                <AnimatedPressable
                  key={shape.id}
                  style={[
                    styles.bodyCard,
                    {
                      backgroundColor: selected ? 'rgba(47,79,58,0.06)' : colors.white,
                      borderColor: selected ? colors.forest : colors.lightGray,
                    },
                    selected && shadows.sm
                  ]}
                  onPress={() => setAnswers((current) => ({ ...current, bodyShape: shape.id }))}
                  scaleDown={0.97}
                >
                  <View style={[styles.bodyIcon, selected && styles.bodyIconActive]}>
                    <Feather name={shape.icon} size={20} color={selected ? colors.white : colors.forest} />
                  </View>
                  <View style={layout.flex}>
                    <Text style={styles.optionTitle}>{shape.label}</Text>
                    <Text style={styles.optionDesc}>{shape.desc}</Text>
                  </View>
                  {selected && <CheckDot />}
                </AnimatedPressable>
              );
            })}
          </View>
        </QuestionBlock>
      )}

      {step === 3 && (
        <QuestionBlock
          title="Berapa tinggi badanmu?"
          desc="Ini mempengaruhi rekomendasi panjang hem, proporsi outer, dan detail sleeve."
        >
          <View style={styles.listGap}>
            {heights.map((height) => {
              const selected = answers.height === height;
              return (
                <Pressable
                  key={height}
                  style={[
                    styles.heightCard,
                    {
                      backgroundColor: selected ? 'rgba(47,79,58,0.06)' : colors.white,
                      borderColor: selected ? colors.forest : colors.lightGray,
                    },
                    selected && shadows.sm
                  ]}
                  onPress={() => setAnswers((current) => ({ ...current, height }))}
                >
                  <Text style={styles.optionTitle}>{height}</Text>
                  {selected && <CheckDot />}
                </Pressable>
              );
            })}
          </View>
        </QuestionBlock>
      )}

      {step === 4 && (
        <QuestionBlock
          title="Gaya apa yang paling kamu suka?"
          desc="Pilih satu atau lebih agar AI menemukan titik temu antara preferensimu dan proporsi tubuhmu."
        >
          <View style={styles.twoColumnGrid}>
            {styleVibes.map((vibe) => {
              const selected = answers.styleVibe?.includes(vibe.id);
              return (
                <Pressable
                  key={vibe.id}
                  style={[
                    styles.vibeCard,
                    {
                      backgroundColor: selected ? 'rgba(47,79,58,0.06)' : colors.white,
                      borderColor: selected ? colors.forest : colors.lightGray,
                    },
                    selected && shadows.sm
                  ]}
                  onPress={() => {
                    setAnswers((current) => {
                      const currentVibes = current.styleVibe ?? [];
                      return {
                        ...current,
                        styleVibe: selected
                          ? currentVibes.filter((item) => item !== vibe.id)
                          : [...currentVibes, vibe.id]
                      };
                    });
                  }}
                >
                  <View style={styles.vibeTop}>
                    <View style={[styles.tinyDot, selected && styles.tinyDotActive]} />
                    {selected && <Feather name="check" size={14} color={colors.forest} />}
                  </View>
                  <Text style={styles.optionTitle}>{vibe.label}</Text>
                  <Text style={styles.optionDesc}>{vibe.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </QuestionBlock>
      )}

      {step === 5 && (
        <QuestionBlock
          title="Untuk kebutuhan apa?"
          desc="AI akan menyesuaikan rekomendasi agar outfit-mu fungsional sesuai aktivitasmu."
        >
          <View style={styles.listGap}>
            {occasions.map((occasion) => {
              const selected = answers.occasion?.includes(occasion.id);
              return (
                <Pressable
                  key={occasion.id}
                  style={[
                    styles.heightCard,
                    {
                      backgroundColor: selected ? 'rgba(47,79,58,0.06)' : colors.white,
                      borderColor: selected ? colors.forest : colors.lightGray,
                    },
                    selected && shadows.sm
                  ]}
                  onPress={() => {
                    setAnswers((current) => {
                      const currentOccasions = current.occasion ?? [];
                      return {
                        ...current,
                        occasion: selected
                          ? currentOccasions.filter((item) => item !== occasion.id)
                          : [...currentOccasions, occasion.id]
                      };
                    });
                  }}
                >
                  <Text style={styles.optionTitle}>{occasion.label}</Text>
                  {selected && <CheckDot />}
                </Pressable>
              );
            })}
          </View>
        </QuestionBlock>
      )}

      <AnimatedPressable
        style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
        disabled={!canContinue}
        onPress={next}
        scaleDown={0.97}
      >
        <Text style={[styles.nextText, !canContinue && styles.nextTextDisabled]}>
          {step === 5 ? 'Analisis dengan AI' : 'Lanjut'}
        </Text>
        <View style={[styles.nextArrow, !canContinue && styles.nextArrowDisabled]}>
          <Feather name="arrow-right" size={16} color={canContinue ? colors.forest : colors.warmGray} />
        </View>
      </AnimatedPressable>
    </ScrollView>
  );
}

function QuestionBlock({ title, desc, children }) {
  return (
    <View>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.questionDesc}>{desc}</Text>
      {children}
    </View>
  );
}

function CheckDot() {
  return (
    <View style={styles.checkDot}>
      <Feather name="check" size={13} color={colors.white} />
    </View>
  );
}

function AnalyzingScreen({ loadingIndex }) {
  return (
    <View style={[layout.scroll, styles.analyzingScreen]}>
      <View style={styles.loadingRing}>
        <View style={styles.loadingInner}>
          <Feather name="zap" size={30} color={colors.sand} />
        </View>
      </View>
      <Text style={styles.loadingTitle}>AI sedang menganalisis...</Text>
      <Text style={styles.loadingDesc}>CIRCULAI memproses profil unikmu untuk menemukan style yang paling sesuai</Text>
      <View style={styles.loadingList}>
        {loadingSteps.map((item, index) => (
          <View
            key={item}
            style={[
              styles.loadingItem,
              index <= loadingIndex && styles.loadingItemActive
            ]}
          >
            <View style={[styles.loadingDot, index <= loadingIndex && styles.loadingDotActive]}>
              {index < loadingIndex && <Feather name="check" size={12} color={colors.white} />}
            </View>
            <Text style={[styles.loadingItemText, index <= loadingIndex && styles.loadingItemTextActive]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ResultScreen({ result, onBack, onRestart, onNavigate, onProductPress, products, wishlist, toggleWishlist }) {
  const recommended = products.slice(0, 2);
  const [aiNarrative, setAiNarrative] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    let active = true;
    if (api.getAiStylistRecommendation) {
      setLoadingAi(true);
      api.getAiStylistRecommendation({}, result)
        .then((res) => {
          if (active && res?.narrative) {
            setAiNarrative(res.narrative);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoadingAi(false);
        });
    }
    return () => {
      active = false;
    };
  }, [result]);

  return (
    <ScrollView style={layout.scroll} contentContainerStyle={layout.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.resultTopRow}>
        <AnimatedPressable style={styles.backButton} onPress={onBack} scaleDown={0.9}>
          <Feather name="chevron-left" size={18} color={colors.forest} />
        </AnimatedPressable>
        <View style={[styles.resultKickerRow, styles.resultKickerRowInline]}>
          <Feather name="zap" size={16} color={colors.terracotta} />
          <Text style={styles.resultKicker}>MY CIRCULAR STYLE</Text>
        </View>
      </View>
      <Text style={styles.resultTitle}>{result.archetype}</Text>
      <Text style={styles.resultTagline}>"{result.tagline}"</Text>

      {!!aiNarrative && (
        <View style={styles.aiInsightCard}>
          <View style={styles.aiInsightHeader}>
            <Feather name="cpu" size={15} color={colors.forest} />
            <Text style={styles.aiInsightLabel}>AI PERSONAL INSIGHT</Text>
          </View>
          <Text style={styles.aiInsightText}>{aiNarrative}</Text>
        </View>
      )}

      {loadingAi && !aiNarrative && (
        <View style={styles.aiInsightCardLoading}>
          <Feather name="loader" size={14} color={colors.warmGray} />
          <Text style={styles.aiInsightLoadingText}>Mengonsultasikan profil dengan AI LLM...</Text>
        </View>
      )}

      <View style={styles.analysisCard}>
        <Text style={styles.analysisLabel}>ANALISIS PROFIL</Text>
        <Text style={styles.analysisText}>{result.analysis}</Text>
      </View>

      <ResultCard icon="palette" title="Palet Warna Ideal" family="material">
        <View style={styles.paletteRow}>
          {result.palette.map((color) => (
            <View key={color.name} style={styles.paletteItem}>
              <View style={[styles.paletteSwatch, { backgroundColor: color.hex }]} />
              <Text style={styles.paletteLabel}>{color.name}</Text>
            </View>
          ))}
        </View>
      </ResultCard>

      <ResultCard icon="scissors-cutting" title="Potongan Terbaik" family="material">
        <View style={styles.wrapRow}>
          {result.cuttings.map((item) => (
            <Pill key={item} text={item} />
          ))}
        </View>
        {result.avoidCuttings.length > 0 && (
          <>
            <Text style={styles.avoidLabel}>Hindari:</Text>
            <View style={styles.wrapRow}>
              {result.avoidCuttings.map((item) => (
                <Pill key={item} text={item} danger />
              ))}
            </View>
          </>
        )}
      </ResultCard>

      <ResultCard icon="tshirt-crew-outline" title="Kain yang Cocok" family="material">
        <View style={styles.wrapRow}>
          {result.fabrics.map((item) => (
            <Pill key={item} text={item} sand />
          ))}
        </View>
      </ResultCard>

      <View style={styles.recommendedCard}>
        <Text style={styles.recommendedTitle}>Produk yang Cocok Untukmu</Text>
        {result.products.map((item) => (
          <View key={item.name} style={styles.recommendLine}>
            <View style={styles.recommendDot} />
            <View style={layout.flex}>
              <Text style={styles.recommendName}>{item.name}</Text>
              <Text style={styles.recommendWhy}>{item.why}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.resultProducts}>
        {recommended.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            grid
            favorite={wishlist.includes(product.id)}
            onToggleFavorite={() => toggleWishlist(product.id)}
            onPress={() => onProductPress(product)}
          />
        ))}
      </View>

      <Pressable style={styles.marketButton} onPress={() => onNavigate('explore')}>
        <Text style={styles.marketButtonText}>Cari Outfit Sesuai Profil</Text>
        <Feather name="arrow-right" size={18} color={colors.white} />
      </Pressable>
      <Pressable style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartButtonText}>Ulangi Quiz</Text>
      </Pressable>
    </ScrollView>
  );
}

function ResultCard({ icon, title, family = 'feather', children }) {
  const Icon = family === 'material' ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultCardHeader}>
        <Icon name={icon} size={17} color={colors.forest} />
        <Text style={styles.resultCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Pill({ text, danger = false, sand = false }) {
  return (
    <View style={[styles.pill, danger && styles.pillDanger, sand && styles.pillSand]}>
      <Text style={[styles.pillText, danger && styles.pillDangerText, sand && styles.pillSandText]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 116
  },
  header: {
    marginBottom: 22
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  kicker: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(47,79,58,0.09)',
  },
  stepBadgeText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '900',
  },
  stepText: {
    color: colors.warmGray,
    fontSize: 11,
    marginTop: 2
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 9999,
    backgroundColor: colors.lightGray
  },
  progressBarActive: {
    backgroundColor: colors.forest
  },
  questionTitle: {
    color: colors.charcoal,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginBottom: 6
  },
  questionDesc: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20
  },
  skinGrid: {
    gap: 10
  },
  skinCard: {
    minHeight: 78,
    borderRadius: 20,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray
  },
  optionCardActive: {
    backgroundColor: 'rgba(47,79,58,0.06)',
    borderColor: colors.forest,
    ...shadows.sm
  },
  skinSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)'
  },
  optionTitle: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '900'
  },
  optionDesc: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  listGap: {
    gap: 10
  },
  bodyCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray
  },
  bodyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sandLight,
  },
  bodyIconActive: {
    backgroundColor: colors.forest,
  },
  heightCard: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  vibeCard: {
    width: '48%',
    minHeight: 122,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray
  },
  vibeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  tinyDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.lightGray
  },
  tinyDotActive: {
    backgroundColor: colors.forest
  },
  nextButton: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.forest,
    marginTop: 28,
    ...shadows.forest,
  },
  nextButtonDisabled: {
    backgroundColor: colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  nextTextDisabled: {
    color: colors.warmGray
  },
  nextArrow: {
    position: 'absolute',
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  nextArrowDisabled: {
    backgroundColor: colors.lightGrayDark,
  },
  analyzingScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 100,
    backgroundColor: colors.ivory
  },
  loadingRing: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 5,
    borderColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26
  },
  loadingInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest
  },
  loadingTitle: {
    color: colors.charcoal,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center'
  },
  loadingDesc: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 28
  },
  loadingList: {
    width: '100%',
    gap: 9
  },
  loadingItem: {
    minHeight: 46,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    opacity: 0.55
  },
  loadingItemActive: {
    opacity: 1,
    backgroundColor: 'rgba(47,79,58,0.08)',
    borderColor: 'rgba(47,79,58,0.2)'
  },
  loadingDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingDotActive: {
    backgroundColor: colors.forest
  },
  loadingItemText: {
    color: colors.warmGray,
    fontSize: 12
  },
  loadingItemTextActive: {
    color: colors.charcoal,
    fontWeight: '800'
  },
  resultKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  resultKickerRowInline: {
    marginBottom: 0,
  },
  resultKicker: {
    color: colors.terracotta,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1
  },
  resultTitle: {
    color: colors.charcoal,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32
  },
  resultTagline: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 16
  },
  aiInsightCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(47,79,58,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(47,79,58,0.18)',
    marginBottom: 14
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  aiInsightLabel: {
    color: colors.forest,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  aiInsightText: {
    color: colors.charcoal,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500'
  },
  aiInsightCardLoading: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.sandLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  aiInsightLoadingText: {
    color: colors.warmGray,
    fontSize: 12,
    fontWeight: '600'
  },
  analysisCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.forest,
    marginBottom: 14
  },
  analysisLabel: {
    color: 'rgba(232,220,200,0.75)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8
  },
  analysisText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 20
  },
  resultCard: {
    borderRadius: 20,
    padding: 15,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    marginBottom: 14,
    ...shadows.sm
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  resultCardTitle: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900'
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 8
  },
  paletteItem: {
    flex: 1,
    alignItems: 'center'
  },
  paletteSwatch: {
    width: '100%',
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)'
  },
  paletteLabel: {
    color: colors.warmGray,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 5
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(47,79,58,0.08)'
  },
  pillDanger: {
    backgroundColor: 'rgba(201,123,99,0.10)'
  },
  pillSand: {
    backgroundColor: colors.sand
  },
  pillText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '800'
  },
  pillDangerText: {
    color: colors.terracotta
  },
  pillSandText: {
    color: colors.charcoal
  },
  avoidLabel: {
    color: colors.terracotta,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 8
  },
  recommendedCard: {
    borderRadius: 20,
    padding: 15,
    backgroundColor: 'rgba(47,79,58,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(47,79,58,0.15)',
    marginBottom: 16
  },
  recommendedTitle: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 12
  },
  recommendLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10
  },
  recommendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forest,
    marginTop: 6
  },
  recommendName: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: '900'
  },
  recommendWhy: {
    color: colors.warmGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  },
  resultProducts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  marketButton: {
    minHeight: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.forest,
    marginTop: 8,
    marginBottom: 10,
    ...shadows.forest,
  },
  marketButtonText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  restartButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  restartButtonText: {
    color: colors.warmGray,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '700'
  }
});
