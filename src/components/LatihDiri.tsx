import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TopNavBar, WoodArrowButton, AudioSpeakerButton } from './OrganicNav';
import { CatVector, BoyVector } from './IllustratedCharacters';
import { CuteSunVector, ButterflyVector, FoliageForeground } from './StoryGraphics';
import { sound } from '../utils/audio';

interface LatihDiriProps {
  onBack: () => void;
  onComplete: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const DRILL_QUESTIONS = [
  {
    id: 1,
    sentenceStart: '',
    blank1: '_______',
    sentenceMid: 'petik bunga di kebun sekolah itu.',
    answer1: 'Jangan',
    choices: ['Jangan', 'Sila', 'Harap'],
    fullSentence: 'Jangan petik bunga di kebun sekolah itu.'
  },
  {
    id: 2,
    sentenceStart: '',
    blank1: '___________',
    sentenceMid: 'datang ke rumah saya.',
    answer1: 'Jemputlah',
    choices: ['Jemputlah', 'Usah', 'Jangan'],
    fullSentence: 'Jemputlah datang ke rumah saya.'
  },
  {
    id: 3,
    sentenceStart: '',
    blank1: '____________',
    sentenceMid: 'ambilkan saya secawan air',
    answer1: 'Tolong',
    choices: ['Tolong', 'Usah', 'Jangan'],
    fullSentence: 'Tolong ambilkan saya secawan air.'
  },
  {
    id: 4,
    sentenceStart: '',
    blank1: '________',
    sentenceMid: 'perintah mengandungi',
    blank2: '________',
    sentenceEnd: 'perintah',
    answer1: 'Ayat',
    answer2: 'kata',
    choices: ['Ayat & kata', 'Huruf & ejaan', 'Frasa & tanda'],
    fullSentence: 'Ayat perintah mengandungi kata perintah.'
  },
  {
    id: 5,
    sentenceStart: 'Tolong, harap dan minta merupakan kata perintah',
    blank1: '______________',
    sentenceMid: '',
    answer1: 'permintaan',
    choices: ['permintaan', 'larangan', 'silaan'],
    fullSentence: 'Tolong, harap dan minta merupakan kata perintah permintaan.'
  }
];

export const LatihDiri: React.FC<LatihDiriProps> = ({
  onBack,
  onComplete,
  soundEnabled,
  onToggleSound
}) => {
  const [step, setStep] = useState<'intro' | 'question' | 'congrats'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userChoice, setUserChoice] = useState<string | null>(null);

  const cur = DRILL_QUESTIONS[qIndex];

  const handleReveal = () => {
    sound.playSuccess();
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (step === 'intro') {
      setStep('question');
      setQIndex(0);
      setShowAnswer(false);
      setUserChoice(null);
    } else if (step === 'question') {
      if (qIndex < DRILL_QUESTIONS.length - 1) {
        setQIndex((prev) => prev + 1);
        setShowAnswer(false);
        setUserChoice(null);
      } else {
        setStep('congrats');
        sound.playFanfare();
        onComplete();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    } else if (step === 'congrats') {
      onBack();
    }
  };

  const handlePrev = () => {
    if (step === 'congrats') {
      setStep('question');
    } else if (step === 'question') {
      if (qIndex > 0) {
        setQIndex((prev) => prev - 1);
        setShowAnswer(false);
        setUserChoice(null);
      } else {
        setStep('intro');
      }
    }
  };

  return (
    <div className="relative min-h-[620px] max-w-4xl mx-auto rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Navbar */}
      <TopNavBar
        onExit={onBack}
        onHome={onBack}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        title={step === 'question' ? `Latih Diri: Soalan ${qIndex + 1}` : 'Latih Diri'}
      />

      {/* Intro Screen (Page 17) */}
      {step === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center my-4 animate-fade-in text-center">
          <h1 className="text-4xl sm:text-6xl font-black font-heading text-slate-900 tracking-tight mb-4">
            Latih Diri
          </h1>
          <p className="text-amber-800 text-lg sm:text-2xl font-heading font-bold max-w-lg leading-relaxed mb-6">
            “Jom kukuhkan pengetahuan dengan menjawab 5 soalan berkenaan ayat perintah”
          </p>

          <div className="flex items-center justify-center gap-6 my-2">
            <CatVector size={130} />
            <BoyVector pose="flag" size={150} />
          </div>

          <button
            onClick={handleNext}
            className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-heading font-extrabold text-lg shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-[0_2px_0_#b45309] transition-all transform hover:scale-105"
          >
            Mula Latihan 💡
          </button>
        </div>
      )}

      {/* Question Screens (Pages 18 to 22) */}
      {step === 'question' && (
        <div className="flex-1 flex flex-col justify-between my-2 animate-fade-in">
          <div className="text-center mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full">
              Isi tempat kosong dengan jawapan yang betul
            </span>
          </div>

          {/* Question Card Box with dashed border matching storyboard */}
          <div className="relative max-w-2xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-white/95 border-3 border-dashed border-amber-400 shadow-xl text-center">
            <span className="block text-amber-700 font-heading font-black text-lg mb-4">
              soalan {qIndex + 1}
            </span>

            <div className="text-xl sm:text-2xl font-heading font-bold text-slate-800 my-4 leading-relaxed">
              {cur.sentenceStart && <span>{cur.sentenceStart} </span>}
              <span className={`inline-block px-3 py-1 rounded-xl mx-1 font-extrabold ${
                showAnswer
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 animate-bounce'
                  : 'bg-amber-100 text-amber-900 border-2 border-dashed border-amber-400'
              }`}>
                {showAnswer ? cur.answer1 : (userChoice || cur.blank1)}
              </span>
              <span>{cur.sentenceMid} </span>
              {cur.blank2 && (
                <span className={`inline-block px-3 py-1 rounded-xl mx-1 font-extrabold ${
                  showAnswer
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 animate-bounce'
                    : 'bg-amber-100 text-amber-900 border-2 border-dashed border-amber-400'
                }`}>
                  {showAnswer ? cur.answer2 : cur.blank2}
                </span>
              )}
              {cur.sentenceEnd && <span>{cur.sentenceEnd}</span>}
            </div>

            {/* Multiple Choice interactive buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {cur.choices.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    sound.playClick();
                    setUserChoice(c);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-heading font-bold border-2 transition-all ${
                    userChoice === c
                      ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-md'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Pink Jawapan Reveal Button matching storyboard */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleReveal}
                className="px-8 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-heading font-black text-xl shadow-[0_5px_0_#9d174d] active:shadow-[0_1px_0_#9d174d] active:translate-y-1 transition-all"
              >
                {showAnswer ? '✓ Jawapan Didedahkan' : 'jawapan'}
              </button>

              <AudioSpeakerButton textToSpeak={cur.fullSentence} size="lg" label="Dengar" />
            </div>
          </div>

          {/* Cute Cat vector at the bottom as shown in storyboard */}
          <div className="flex justify-center -mb-2">
            <CatVector size={110} />
          </div>
        </div>
      )}

      {/* Congrats Screen (Page 23) */}
      {step === 'congrats' && (
        <div className="flex-1 flex flex-col items-center justify-center my-4 animate-fade-in text-center">
          <div className="max-w-xl w-full bg-white/95 p-6 sm:p-8 rounded-3xl border-4 border-amber-400 shadow-xl">
            <h2 className="text-4xl sm:text-5xl font-heading font-black text-slate-900 mb-4">
              Tahniah! 🌟
            </h2>

            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 my-4">
              <p className="text-xl sm:text-2xl font-heading font-bold text-amber-900">
                Kamu sudah memahami ayat perintah dengan baik
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Terima kasih kerana sudi memberikan perhatian dan kerjasama.
              </p>
            </div>

            <div className="flex justify-center my-4">
              <BoyVector pose="flag" size={160} />
            </div>

            <button
              onClick={onBack}
              className="px-8 py-3.5 rounded-2xl bg-[#ddb892] hover:bg-[#b08968] text-[#582f0e] font-heading font-extrabold text-base border-3 border-[#7f4f24] shadow-[0_4px_0_#7f4f24] transition-all"
            >
              Tekan ini untuk kembali ke halaman jom belajar
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {/* Foliage layer in background */}
      <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
        <FoliageForeground />
      </div>

      <div className="flex items-center justify-between w-full pt-2 relative z-10">
        <WoodArrowButton
          direction="prev"
          onClick={handlePrev}
          disabled={step === 'intro'}
        />

        <div className="text-xs font-bold text-amber-900 bg-amber-200/90 px-4 py-1.5 rounded-full shadow-sm">
          {step === 'intro' && 'Pengenalan Latih Diri'}
          {step === 'question' && `Soalan ${qIndex + 1} daripada ${DRILL_QUESTIONS.length}`}
          {step === 'congrats' && 'Selesai'}
        </div>

        <WoodArrowButton
          direction="next"
          onClick={handleNext}
        />
      </div>
    </div>
  );
};
