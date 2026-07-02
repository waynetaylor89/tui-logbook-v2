import { useLocation, Link } from "react-router-dom";
import { memo } from "react";

const Breadcrumbs = memo(function Breadcrumbs() {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const breadcrumbMap = {
      '': 'Statistics',
      'statistics': 'Statistics',
      'flights': 'Flight Board',
      'my-shift': 'My Shift',
      'fleet': 'Fleet',
      'timeline': 'Operations Timeline',
      'history': 'History',
      'calendar': 'Shift Calendar',
      'import': 'FlightRadar24 Import',
      'users': 'Manage Users'
    };

    return pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const displayName = breadcrumbMap[name] || name;

      return (
        <span key={routeTo} className="flex items-center">
          {index > 0 && <span className="mx-2 text-slate-400">/</span>}
          {isLast ? (
            <span className="font-medium text-slate-200">{displayName}</span>
          ) : (
            <Link 
              to={routeTo} 
              className="text-sky-300 transition-colors hover:text-sky-200"
            >
              {displayName}
            </Link>
          )}
        </span>
      );
    });
  };

  return (
    <nav className="ops-panel flex items-center space-x-1 rounded-xl px-4 py-2 text-sm text-slate-300">
      <Link to="/statistics" className="text-sky-300 transition-colors hover:text-sky-200">
        Statistics
      </Link>
      {getBreadcrumbs()}
    </nav>
  );
});

export default Breadcrumbs;
