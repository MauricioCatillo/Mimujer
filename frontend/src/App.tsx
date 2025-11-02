import RomanticAlbum from './components/album/RomanticAlbum';
import { AuthProvider } from './context/AuthContext';
import AuthGate from './context/AuthGate';

const App = () => {
  return (
    <AuthProvider>
      <AuthGate>
        <RomanticAlbum />
      </AuthGate>
    </AuthProvider>
  );
};

export default App;
