import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import Bootcamp from './pages/Bootcamp';
import Game from './pages/Game';
import Home from './pages/Home';
import Juiced from './pages/Juiced';
import LeaderBoard from './pages/LeaderBoard';
import PartnerShip from './pages/PartnerShip';
import Staking from './pages/Staking';
import Whey from './pages/Whey';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout><Home /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/staking',
      element: <DashboardLayout><Staking /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/bootcamp',
      element: <DashboardLayout><Bootcamp /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/whey',
      element: <DashboardLayout><Whey /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/partnership',
      element: <DashboardLayout><PartnerShip /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/leaderboard',
      element: <DashboardLayout><LeaderBoard /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/game',
      element: <DashboardLayout><Game /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    {
      path: '/juiced',
      element: <DashboardLayout><Juiced /></DashboardLayout>,
      children: [
        { element: <Navigate to="/" replace /> },
        { path: '', element: <Home /> }
      ]
    },
    { path: '*', element: <Navigate to="/" replace /> }
  ]);
}
