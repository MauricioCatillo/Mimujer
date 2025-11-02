import "./LoadingScreen.css";

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="loading-screen">
    <div className="loading-screen__spinner" />
    <p>{message}</p>
  </div>
);

export default LoadingScreen;
