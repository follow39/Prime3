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
      title: 'Welcome to Time Left',
      description:
        'A simple and effective app to help you stay focused on what matters most each day.',
      color: 'primary',
    },
    {
      icon: listOutline,
      title: 'Plan Your Day',
      description:
        'Start each day by choosing your 3 most important goals. Focus on what truly matters and avoid overwhelming yourself.',
      color: 'secondary',
    },
    {
      icon: timeOutline,
      title: 'Track Your Progress',
      description:
        'Work on your tasks throughout the day. Mark them as done when completed or defer them to another day.',
      color: 'tertiary',
    },
    {
      icon: statsChartOutline,
      title: 'Review & Improve',
      description:
        'Use the review page to see your completed tasks and track your progress over time. Learn from your patterns.',
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
                  Why exactly 3 goals?
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
