import React, { useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Settings, PrimaryColor, FontSize, Layout } from '../types';

interface SettingsScreenProps {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setSettings: (settings: Settings) => void;
  tasksHook: ReturnType<typeof useTasks>;
}

// Reusable Components for Settings Screen
const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold mb-4 text-[var(--brand-color)]">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const SettingsRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex justify-between items-center">
    <label className="text-gray-700 dark:text-gray-300">{label}</label>
    <div>{children}</div>
  </div>
);

const SettingsToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-[var(--brand-color)]/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--brand-color)]"></div>
    </label>
);


const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, updateSetting, tasksHook, setSettings }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify({ tasks: tasksHook.tasks, settings });
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `smart-kirpo-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const data = JSON.parse(result);
                if (data.tasks && Array.isArray(data.tasks)) {
                    tasksHook.setTasks(data.tasks);
                }
                if(data.settings) {
                    setSettings(data.settings);
                }
                alert('Dados importados com sucesso!');
            }
        } catch (error) {
            console.error('Falha ao importar dados:', error);
            alert('Arquivo de backup inválido.');
        }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (window.confirm('Você tem certeza que deseja apagar TODOS os dados (tarefas e configurações)? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('tasks');
            localStorage.removeItem('smart-kirpo-settings');
            window.location.reload();
        }
    };

  return (
    <div className="space-y-6 animate-slide-in-up max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Configurações</h2>
      
      {/* Aparência */}
      <SettingsCard title="🎨 Aparência">
        <SettingsRow label="Tema Escuro">
            <SettingsToggle checked={settings.theme === 'dark'} onChange={checked => updateSetting('theme', checked ? 'dark' : 'light')} />
        </SettingsRow>
         <SettingsRow label="Cor Principal">
            <div className="flex gap-2">
                {(['orange', 'blue', 'green'] as PrimaryColor[]).map(color => (
                    <button key={color} onClick={() => updateSetting('primaryColor', color)} className={`w-8 h-8 rounded-full bg-brand-${color} ring-2 ${settings.primaryColor === color ? 'ring-offset-2 ring-offset-gray-100 dark:ring-offset-dark-bg ring-[var(--brand-color)]' : 'ring-transparent'}`}></button>
                ))}
            </div>
        </SettingsRow>
        <SettingsRow label="Tamanho do Texto">
             <select value={settings.fontSize} onChange={e => updateSetting('fontSize', e.target.value as FontSize)} className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-1">
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
            </select>
        </SettingsRow>
        <SettingsRow label="Layout (em breve)">
             <select disabled value={settings.layout} onChange={e => updateSetting('layout', e.target.value as Layout)} className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-1 disabled:opacity-50">
                <option value="list">Lista Simples</option>
                <option value="blocks">Blocos Visuais</option>
            </select>
        </SettingsRow>
        <SettingsRow label="Ativar lembretes (notificações)">
            <SettingsToggle checked={settings.enableNotifications} onChange={v => updateSetting('enableNotifications', v)} />
        </SettingsRow>
      </SettingsCard>
      
      {/* Privacidade e Dados */}
      <SettingsCard title="🔒 Privacidade e dados">
         <SettingsRow label="Backup">
            <div className='flex gap-2'>
                <button onClick={handleExport} className="text-sm py-1 px-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md font-medium">Exportar</button>
                <button onClick={handleImportClick} className="text-sm py-1 px-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md font-medium">Importar</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
        </SettingsRow>
         <SettingsRow label="Limpar dados do app">
            <button onClick={handleClearData} className="text-sm py-1 px-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-md font-medium">Limpar</button>
        </SettingsRow>
      </SettingsCard>

    </div>
  );
};

export default SettingsScreen;