import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { supabase, type User } from '../lib/supabase';

interface UserContextType {
  users: User[];
  selectedUserId: string | null;
  selectedUser: User | null;
  setSelectedUserId: (id: string | null) => void;
  refreshUsers: () => Promise<void>;
  addUser: (name: string, email: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const refreshUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    }
  };

  const addUser = async (name: string, email: string) => {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select()
      .single();

    if (!error && data) {
      await refreshUsers();
      setSelectedUserId(data.id);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  return (
    <UserContext.Provider value={{
      users,
      selectedUserId,
      selectedUser,
      setSelectedUserId,
      refreshUsers,
      addUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
