import AdminUsersPanel from "../components/AdminUsersPanel.jsx";

export default function UsersPage({ users, history, userSummary, handleDeleteUser, resetUserPassword }) {
  return (
    <AdminUsersPanel
      users={users}
      history={history}
      userSummary={userSummary}
      onDeleteUser={handleDeleteUser}
      onResetPassword={resetUserPassword}
    />
  );
}
