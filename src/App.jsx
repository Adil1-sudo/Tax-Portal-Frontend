import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { BusinessSettingsProvider } from "./context/BusinessSettingsContext";

function App() {
  return (
    <BrowserRouter>
      <BusinessSettingsProvider>
        <AppRoutes />
      </BusinessSettingsProvider>
    </BrowserRouter>
  );
}

export default App;
