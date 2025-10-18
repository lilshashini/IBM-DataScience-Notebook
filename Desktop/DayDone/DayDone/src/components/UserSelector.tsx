import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserPlus, ChevronDown } from 'lucide-react';

export default function UserSelector() {
  const { users, selectedUserId, setSelectedUserId, addUser } = useUser();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName && newUserEmail) {
      await addUser(newUserName, newUserEmail);
      setNewUserName('');
      setNewUserEmail('');
      setShowAddUser(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <select
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 dark:text-slate-100 transition-all"
        >
          {users.length === 0 && <option value="">No users yet</option>}
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
      </div>

      <button
        onClick={() => setShowAddUser(!showAddUser)}
        className="btn-purple flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-medium"
      >
        <UserPlus className="w-5 h-5" />
        Add User
      </button>

      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-purple px-4 py-3 rounded-xl font-medium"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
