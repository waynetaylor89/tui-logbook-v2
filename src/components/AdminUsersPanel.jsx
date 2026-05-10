import { useState } from "react";

export default function AdminUsersPanel({ users, history, userSummary, onDeleteUser, onResetPassword }) {
  const [passwordInputs, setPasswordInputs] = useState({});

  const handlePasswordChange = (username, value) => {
    setPasswordInputs((prev) => ({
      ...prev,
      [username]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
            <div className="text-sm text-slate-500">
              Manage registered users and reset passwords.
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {Object.keys(users).length} registered users
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-3 font-medium text-slate-500">Username</th>
              <th className="px-4 py-3 font-medium text-slate-500">Movements</th>
              <th className="px-4 py-3 font-medium text-slate-500">Password</th>
              <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userSummary.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                  No users to manage yet.
                </td>
              </tr>
            ) : (
              userSummary.map((row) => (
                <tr key={row.username} className="border-t">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {row.username}
                  </td>
                  <td className="px-4 py-3">{row.movements}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="password"
                        placeholder="New password"
                        value={passwordInputs[row.username] || ""}
                        onChange={(e) => handlePasswordChange(row.username, e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                    <button
                      onClick={() => {
                        const password = passwordInputs[row.username];
                        if (!password || password.trim().length < 3) {
                          alert("Enter a new password with at least 3 characters.");
                          return;
                        }
                        onResetPassword(row.username, password.trim());
                        setPasswordInputs((prev) => ({ ...prev, [row.username]: "" }));
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => onDeleteUser(row.username)}
                      className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600"
                    >
                      Delete User
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
