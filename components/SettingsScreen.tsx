import React, { useState, useRef, useEffect } from 'react';
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

const SettingsRow: React.FC<{ label: string; children: React.ReactNode; description?: string }> = ({ label, children, description }) => (
  <div>
    <div className="flex justify-between items-center">
        <label className="text-gray-700 dark:text-gray-300">{label}</label>
        <div>{children}</div>
    </div>
    {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
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
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');

    useEffect(() => {
        // Reset pin input when toggling off
        if (!settings.usePin) {
            setPinInput('');
            setPinError('');
        }
    }, [settings.usePin]);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
        if (value.length <= 6) {
            setPinInput(value);
            if (pinError) setPinError('');
        }
    };

    const handleSetPin = () => {
        if (pinInput.length < 4) {
            setPinError('O PIN deve ter entre 4 e 6 dígitos.');
            return;
        }
        updateSetting('pin', pinInput);
        alert('PIN definido com sucesso!');
        setPinInput('');
    };
    
    const handleTogglePin = (checked: boolean) => {
        if (checked) {
            // If turning on without a pin set, force setting one.
             updateSetting('usePin', true);
        } else {
            // Turning off
            updateSetting('usePin', false);
            updateSetting('pin', null);
        }
    }

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify({ tasks: tasksHook.tasks, settings }, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `smart-kirpo-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data", error);
            alert("Não foi possível exportar seus dados.");
        }
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
                    // Basic validation for tasks
                    if (data.tasks.every((t: any) => t.id && t.title)) {
                        tasksHook.setTasks(data.tasks);
                    }
                }
                if(data.settings) {
                    // Don't overwrite with invalid settings
                    if (typeof data.settings === 'object' && data.settings !== null) {
                        setSettings(data.settings);
                    }
                }
                alert('Dados importados com sucesso! A página será recarregada.');
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error('Falha ao importar dados:', error);
            alert('Arquivo de backup inválido.');
        } finally {
            // Reset file input
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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
    <div className="space-y-6 animate-slide-in-up max-w-2xl mx-auto pb-8">
      <h2 className="text-2xl font-bold">Configurações</h2>
      
      {/* Aparência */}
      <SettingsCard title="🎨 Aparência">
        <SettingsRow label="Tema Escuro">
            <SettingsToggle checked={settings.theme === 'dark'} onChange={checked => updateSetting('theme', checked ? 'dark' : 'light')} />
        </SettingsRow>
         <SettingsRow label="Cor Principal">
            <div className="flex gap-2">
                {(['orange', 'blue', 'green'] as PrimaryColor[]).map(color => (
                    <button key={color} onClick={() => updateSetting('primaryColor', color)} className={`w-8 h-8 rounded-full bg-brand-${color} ring-2 transition-all ${settings.primaryColor === color ? 'ring-offset-2 ring-offset-gray-100 dark:ring-offset-dark-bg ring-[var(--brand-color)]' : 'ring-transparent hover:ring-gray-300'}`}></button>
                ))}
            </div>
        </SettingsRow>
        <SettingsRow label="Tamanho do Texto">
             <select value={settings.fontSize} onChange={e => updateSetting('fontSize', e.target.value as FontSize)} className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-1 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]">
                <option value="small">Pequeno</option>
                <option value="medium">Médio</option>
                <option value="large">Grande</option>
            </select>
        </SettingsRow>
        <SettingsRow label="Layout da Lista de Tarefas">
             <select disabled value={settings.layout} onChange={e => updateSetting('layout', e.target.value as Layout)} className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-1 disabled:opacity-50">
                <option value="list">Lista (Padrão)</option>
                <option value="blocks">Blocos (Em breve)</option>
            </select>
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="💡 Funcionalidades">
        <SettingsRow label="Ativar lembretes (notificações)">
            <SettingsToggle checked={settings.enableNotifications} onChange={v => updateSetting('enableNotifications', v)} />
        </SettingsRow>
        <SettingsRow 
            label="Mostrar frase motivacional"
            description="Usa a API Gemini para buscar uma nova frase a cada dia."
        >
            <SettingsToggle checked={settings.showMotivation} onChange={v => updateSetting('showMotivation', v)} />
        </SettingsRow>
      </SettingsCard>
      
      {/* Privacidade e Dados */}
      <SettingsCard title="🔒 Privacidade e Dados">
        <SettingsRow label="Bloqueio por PIN" description="Proteja seu app com um PIN numérico.">
            <SettingsToggle checked={settings.usePin} onChange={handleTogglePin} />
        </SettingsRow>
        {settings.usePin && (
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {settings.pin ? "PIN está definido." : "Defina um PIN de 4-6 dígitos."}
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <input 
                        type="password"
                        inputMode="numeric"
                        value={pinInput}
                        onChange={handlePinChange}
                        maxLength={6}
                        className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-1 w-32 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]"
                        placeholder={settings.pin ? "Novo PIN" : "Definir PIN"}
                    />
                    <button onClick={handleSetPin} className="text-sm py-1 px-3 bg-[var(--brand-color)] text-white hover:opacity-90 rounded-md font-medium">
                        {settings.pin ? "Alterar" : "Salvar"}
                    </button>
                </div>
                {pinError && <p className="text-red-500 text-xs mt-1">{pinError}</p>}
            </div>
        )}
         <SettingsRow label="Backup dos Dados">
            <div className='flex gap-2'>
                <button onClick={handleExport} className="text-sm py-1 px-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover-bg-gray-500 rounded-md font-medium">Exportar</button>
                <button onClick={handleImportClick} className="text-sm py-1 px-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md font-medium">Importar</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
        </SettingsRow>
         <SettingsRow label="Limpar todos os dados">
            <button onClick={handleClearData} className="text-sm py-1 px-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-md font-medium">Limpar App</button>
        </SettingsRow>
      </SettingsCard>

    </div>
  );
};

export default SettingsScreen;