const EmptyState = ({ 
  icon, 
  title, 
  message, 
  action, 
  actionText 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="text-6xl mb-4 text-slate-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">
        {message}
      </p>
      {action && (
        <button
          onClick={action}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const NoMovementsEmpty = ({ onAddMovement }) => (
  <EmptyState
    icon="✈️"
    title="No Aircraft Movements Yet"
    message="Start tracking aircraft movements by adding your first movement record. This will help you monitor ground operations and stand usage."
    action={onAddMovement}
    actionText="Add First Movement"
  />
);

export const NoRecordsEmpty = ({ onAddMovement }) => (
  <EmptyState
    icon="📋"
    title="No Movement Records"
    message="Movement records will appear here once you start adding aircraft movements. Track all ground operations for better analysis."
    action={onAddMovement}
    actionText="Add Movement"
  />
);

export const NoUsersEmpty = ({ onRegister }) => (
  <EmptyState
    icon="👥"
    title="No Users Registered"
    message="Invite team members to help manage the logbook. Each user can track their own movements and contribute to the fleet operations."
    action={onRegister}
    actionText="Register First User"
  />
);

export const NoResultsEmpty = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon="🔍"
    title="No Results Found"
    message={`No movements found matching "${searchTerm}". Try adjusting your search terms or browse all movements.`}
    action={onClearSearch}
    actionText="Clear Search"
  />
);

export const NoDataEmpty = ({ message = "No data available" }) => (
  <EmptyState
    icon="📊"
    title="No Data Available"
    message={message}
  />
);

export default EmptyState;
