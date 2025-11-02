import styled from '@emotion/styled';

const HeroWrapper = styled.header`
  width: 100%;
  padding: clamp(3rem, 8vw, 6rem) 0 2rem;
  background: radial-gradient(circle at top left, rgba(255, 173, 196, 0.6), transparent 55%),
    radial-gradient(circle at bottom right, rgba(255, 143, 163, 0.55), transparent 50%),
    linear-gradient(180deg, #ffe5ec 0%, #fff7fb 100%);
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  width: min(1100px, 92vw);
  margin: 0 auto;
  display: grid;
  gap: 2.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.6rem, 4vw, 3.8rem);
  line-height: 1.1;
  color: #8a1253;
`;

const Highlight = styled.span`
  display: inline-block;
  background: linear-gradient(120deg, #ff4d6d 0%, #ff85a1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: clamp(1rem, 2vw, 1.3rem);
  margin: 0;
  color: rgba(74, 22, 41, 0.85);
  max-width: 540px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CTAButton = styled.button`
  padding: 0.8rem 1.6rem;
  border-radius: 999px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: linear-gradient(135deg, #ff4d6d 0%, #ff85a1 100%);
  box-shadow: 0 15px 30px rgba(255, 77, 109, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 34px rgba(255, 77, 109, 0.3);
  }
`;

const SecondaryButton = styled(CTAButton)`
  background: rgba(255, 255, 255, 0.85);
  color: #ff4d6d;
`;

const HeartOrbit = styled.div`
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(255, 143, 163, 0.4);
  pointer-events: none;
  animation: spin 20s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Heart = styled.span`
  position: absolute;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #ff4d6d 0%, #ff85a1 100%);
  clip-path: path('M0.5 0.3 C0.5 0.1 0.7 0 0.8 0 C0.9 0 1 0.1 1 0.2 C1 0.1 1.1 0 1.2 0 C1.3 0 1.5 0.1 1.5 0.3 C1.5 0.6 1.2 0.9 0.8 1.2 C0.4 0.9 0.1 0.6 0.1 0.3 Z');
  opacity: 0.7;
`;

const PromiseCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 18px 45px rgba(138, 18, 83, 0.15);
  display: grid;
  gap: 1.2rem;
`;

const PromiseTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #a41655;
`;

const PromiseList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: rgba(74, 22, 41, 0.8);
  display: grid;
  gap: 0.6rem;
`;

const PromiseItem = styled.li`
  font-size: 1rem;
`;

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const HeroSection = () => {
  return (
    <HeroWrapper>
      <HeartOrbit style={{ width: '420px', height: '420px', top: '-120px', right: '-120px' }}>
        <Heart style={{ top: '20%', left: '50%' }} />
        <Heart style={{ top: '65%', left: '80%' }} />
        <Heart style={{ top: '40%', left: '10%' }} />
      </HeartOrbit>
      <HeartOrbit style={{ width: '300px', height: '300px', bottom: '-100px', left: '-80px', animationDuration: '26s' }}>
        <Heart style={{ top: '15%', left: '30%' }} />
        <Heart style={{ top: '70%', left: '60%' }} />
      </HeartOrbit>

      <HeroContent>
        <TextBlock>
          <Title>
            Un universo creado para <Highlight>ti y para ella</Highlight>
          </Title>
          <Subtitle>
            Este refugio digital está diseñado para atesorar cada momento, planear nuevas memorias y sorprenderse mutuamente con
            detalles inolvidables. Todo lo que necesitan está a un corazón de distancia.
          </Subtitle>
          <ButtonRow>
            <CTAButton onClick={() => scrollToSection('calendar-section')}>Planear momentos</CTAButton>
            <SecondaryButton onClick={() => scrollToSection('album-section')}>Revivir recuerdos</SecondaryButton>
          </ButtonRow>
        </TextBlock>

        <PromiseCard>
          <PromiseTitle>Nuestros detalles para su amor</PromiseTitle>
          <PromiseList>
            <PromiseItem>Un calendario romántico para celebrar cada fecha especial.</PromiseItem>
            <PromiseItem>Recordatorios tiernos que nunca dejan escapar una promesa.</PromiseItem>
            <PromiseItem>Un álbum eterno donde las fotos viven incluso si cierras la página.</PromiseItem>
            <PromiseItem>Un showroom de experiencias web para sorprender a tu prometida antes de abrirlas.</PromiseItem>
          </PromiseList>
        </PromiseCard>
      </HeroContent>
    </HeroWrapper>
  );
};

export default HeroSection;
