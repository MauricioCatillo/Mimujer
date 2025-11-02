import styled from '@emotion/styled';
import HeroSection from './sections/HeroSection';
import CalendarSection from './sections/CalendarSection';
import RemindersSection from './sections/RemindersSection';
import PhotoAlbumSection from './sections/PhotoAlbumSection';
import WebExperiencesSection from './sections/WebExperiencesSection';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding-bottom: 4rem;
`;

const MainContent = styled.main`
  width: min(1100px, 92vw);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4rem;
`;

const Footer = styled.footer`
  text-align: center;
  color: rgba(51, 17, 26, 0.7);
  font-size: 0.95rem;
  padding-bottom: 2rem;
`;

function App() {
  return (
    <PageWrapper>
      <HeroSection />
      <MainContent>
        <CalendarSection />
        <RemindersSection />
        <PhotoAlbumSection />
        <WebExperiencesSection />
      </MainContent>
      <Footer>
        Hecho con un corazón que late por ustedes dos. Cada detalle fue creado para recordarles que su amor es único e infinito.
      </Footer>
    </PageWrapper>
  );
}

export default App;
