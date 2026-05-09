import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'task-manager-auth-v1';

export function useAuth() {
  const [currentMemberId, setCurrentMemberId] = useLocalStorage<string | null>(STORAGE_KEY, null);

  const login = (memberId: string) => setCurrentMemberId(memberId);
  const logout = () => setCurrentMemberId(null);

  return { currentMemberId, login, logout };
}
