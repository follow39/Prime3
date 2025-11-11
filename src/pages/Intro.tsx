import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  listOutline,
  timeOutline,
  statsChartOutline,
} from 'ionicons/icons';
import PreferencesService from '../services/preferencesService';
import ThreeGoalsHelpModal from '../components/ThreeGoalsHelpModal';
import './Intro.css';

const Intro: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThreeGoalsModal, setShowThreeGoalsModal] = useState(false);
  const history = useHistory();

  const slides = [
    {
      icon: checkmarkCircleOutline,
      title: 'Welcome to Trium',
      description:
        'Every day is an opportunity to make meaningful progress. Trium helps you transform intention into action by focusing on what truly matters.',
      color: 'primary',
    },
    {
      icon: listOutline,
      title: 'Three Goals, One Day',
      description:
        'Each morning, choose your 3 most important goals. Not everything, just what matters most. This is the secret to sustainable achievement without burnout.',
      color: 'secondary',
    },
    {
      icon: timeOutline,
      title: 'Make It Happen',
      description:
        'Watch your day unfold with clarity and purpose. Every completed goal builds momentum. Every lesson learned makes tomorrow better.',
      color: 'tertiary',
    },
    {
      icon: statsChartOutline,
      title: 'Build Your Success Story',
      description:
        'See your progress accumulate. Celebrate your wins. Understand your patterns. Small daily victories compound into extraordinary results.',
      color: 'success',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = async () => {
    await PreferencesService.setIntroShown(true);
    history.replace('/home');
  };

  const handleSkip = async () => {
    await PreferencesService.setIntroShown(true);
    history.replace('/home');
  };

  const slide = slides[currentSlide];

  return (
    <IonPage>
      <IonContent className="ion-padding intro-content">
        <div className="intro-container">
          <IonButton
            fill="clear"
            size="small"
            className="skip-button"
            onClick={handleSkip}
          >
            Skip
          </IonButton>

          <IonCard className="intro-card">
            <IonCardContent className="intro-card-content">
              <div className={`intro-icon-container ion-color-${slide.color}`}>
                <IonIcon icon={slide.icon} className="intro-icon" />
              </div>

              <IonText>
                <h1 className="intro-title">{slide.title}</h1>
              </IonText>

              <IonText color="medium">
                <p className="intro-description">{slide.description}</p>
              </IonText>

              {currentSlide === 1 && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => setShowThreeGoalsModal(true)}
                  style={{ marginTop: '10px' }}
                >
                  Why is 3 the magic number?
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>

          <div className="intro-dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`intro-dot ${
                  index === currentSlide ? 'active' : ''
                }`}
              />
            ))}
          </div>

          <div className="intro-buttons">
            {currentSlide > 0 && (
              <IonButton fill="outline" onClick={handlePrevious}>
                Previous
              </IonButton>
            )}

            {currentSlide < slides.length - 1 ? (
              <IonButton onClick={handleNext}>Next</IonButton>
            ) : (
              <IonButton onClick={handleGetStarted} color="primary">
                Get Started
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>

      <ThreeGoalsHelpModal
        isOpen={showThreeGoalsModal}
        onClose={() => setShowThreeGoalsModal(false)}
      />
    </IonPage>
  );
};

export default Intro;
