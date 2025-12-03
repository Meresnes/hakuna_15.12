import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp, CHOICE_COLORS, type Vote } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';

function Admin() {
  const { state, fetchState } = useApp();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [last50, setLast50] = useState<Vote[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { emitTestVote, isConnected } = useSocket({ role: 'admin' });

  // Check if already authenticated (stored in session)
  useEffect(() => {
    const stored = sessionStorage.getItem('adminAuth');
    if (stored) {
      setIsAuthenticated(true);
      void loadLast50(stored);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/last50', {
        headers: {
          'Authorization': `Basic ${btoa(`admin:${password}`)}`,
        },
      });

      if (response.ok) {
        sessionStorage.setItem('adminAuth', password);
        setIsAuthenticated(true);
        const data = await response.json() as Vote[];
        setLast50(data);
      } else {
        setError('Неверный пароль');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLast50 = async (pwd: string) => {
    try {
      const response = await fetch('/api/admin/last50', {
        headers: {
          'Authorization': `Basic ${btoa(`admin:${pwd}`)}`,
        },
      });
      if (response.ok) {
        const data = await response.json() as Vote[];
        setLast50(data);
      }
    } catch (err) {
      console.error('Failed to load votes:', err);
    }
  };

  const handleExport = async () => {
    const pwd = sessionStorage.getItem('adminAuth');
    if (!pwd) return;

    try {
      const response = await fetch('/api/admin/export', {
        headers: {
          'Authorization': `Basic ${btoa(`admin:${pwd}`)}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `votes-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleReset = async () => {
    const pwd = sessionStorage.getItem('adminAuth');
    if (!pwd) return;

    if (!confirm('Вы уверены? Это действие удалит все голоса!')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`admin:${pwd}`)}`,
        },
      });
      
      if (response.ok) {
        setLast50([]);
        await fetchState();
        alert('База данных очищена');
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const handleTestVote = () => {
    const randomChoice = Math.floor(Math.random() * 4) + 1;
    const testNames = ['Тест', 'Анна', 'Михаил', 'Сара', 'Давид'];
    const randomName = testNames[Math.floor(Math.random() * testNames.length)] ?? 'Тест';
    
    emitTestVote(randomName, randomChoice);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-radial">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-night-medium p-8 rounded-2xl w-full max-w-sm"
        >
          <h1 className="font-cinzel text-2xl font-bold text-white mb-6 text-center">
            Вход в админку
          </h1>

          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль администратора"
              className="w-full px-4 py-3 bg-night-dark border border-night-light rounded-lg 
                       text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-flame-orange"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-flame-orange text-white font-semibold rounded-lg
                     hover:bg-flame-red transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Проверка...' : 'Войти'}
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-radial">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-white">
              Панель администратора
            </h1>
            <p className="text-gray-400 flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Подключено к Socket.IO' : 'Отключено'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleTestVote}
              className="px-4 py-2 bg-flame-yellow text-night-dark font-medium rounded-lg
                       hover:bg-flame-orange transition-colors"
            >
              🔥 Тест голоса
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-night-light text-white rounded-lg
                       hover:bg-night-medium transition-colors"
            >
              📥 Экспорт CSV
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg
                       hover:bg-red-700 transition-colors"
            >
              🗑️ Сброс БД
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-night-medium p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Всего</div>
            <div className="text-3xl font-bold text-white">{state.total}</div>
          </div>
          {[1, 2, 3, 4].map(choice => (
            <div key={choice} className="bg-night-medium p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHOICE_COLORS[choice] }}
                />
                <span className="text-gray-400 text-sm">Выбор {choice}</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {state.counts[choice as keyof typeof state.counts]}
              </div>
            </div>
          ))}
        </div>

        {/* Last 50 votes */}
        <div className="bg-night-medium rounded-xl overflow-hidden">
          <div className="p-4 border-b border-night-light">
            <h2 className="font-semibold text-white">Последние 50 голосов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-night-light">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Имя</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Выбор</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Время</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-light">
                {last50.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Нет записей
                    </td>
                  </tr>
                ) : (
                  last50.map(vote => (
                    <tr key={vote.id} className="hover:bg-night-light/50">
                      <td className="px-4 py-3 text-white">{vote.name}</td>
                      <td className="px-4 py-3">
                        <span 
                          className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm"
                          style={{ 
                            backgroundColor: `${CHOICE_COLORS[vote.choice]}20`,
                            color: CHOICE_COLORS[vote.choice],
                          }}
                        >
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: CHOICE_COLORS[vote.choice] }}
                          />
                          {vote.choice}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(vote.created_at).toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;

