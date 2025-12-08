import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header/Header';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import TransactionsPage from './pages/TransactionsPage';
import FinancesPage from './pages/FinancesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import RoutesByMonthPage from './pages/RoutesByMonthPage';
import TripReportsPage from './pages/TripReportsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import NotFoundPage from './pages/NotFoundPage';
import KpiPage from './pages/KpiPage';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/routes-by-month" element={<RoutesByMonthPage />} />
        <Route path="/trip-reports" element={<TripReportsPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/finances" element={<FinancesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/kpi" element={<KpiPage />} />
      </Routes>
    </Router>
  );
}

export default App;
