'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import {
  categoriesApi, tagsApi, rolesApi, toolsApi, uploadApi,
  AiTool, AiToolPayload, Category, Tag, Role, Difficulty, ToolExample,
} from '@/lib/api';
import { textOn } from '@/lib/color';
import { useToast } from '@/components/Toast';

interface Props {
  initial?: AiTool;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'beginner',     label: 'Начинаещ' },
  { value: 'intermediate', label: 'Среден' },
  { value: 'advanced',     label: 'Напреднал' },
];

const inputCls  = 'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500';
const sectionCls = 'border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{children}</h3>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

function emptyExample(): Omit<ToolExample, 'id'> {
  return { title: '', url: '', image_url: '', description: '' };
}

// ─── Image input: URL поле + качване на файл (JPG/PNG/WebP, до 5MB) ─────────

function ImageInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.upload(file);
      onChange(url);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Грешка при качване', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="flex gap-2">
      <input type="url" className={inputCls} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg whitespace-nowrap disabled:opacity-50">
        {uploading ? 'Качва…' : '📁 Качи'}
      </button>
    </div>
  );
}

// ─── Inline tag/category adder chip ──────────────────────────────────────────

function InlineAdder({
  placeholder,
  onAdd,
  withColor = false,
}: {
  placeholder: string;
  onAdd: (name: string, color: string) => Promise<void>;
  withColor?: boolean;
}) {
  const [name,  setName]  = useState('');
  const [color, setColor] = useState('#f59e0b');
  const [busy,  setBusy]  = useState(false);
  const { toast } = useToast();

  async function handle() {
    if (!name.trim()) return;
    setBusy(true);
    try { await onAdd(name.trim(), color); setName(''); }
    catch (e: unknown) { toast(e instanceof Error ? e.message : 'Грешка', 'error'); }
    finally { setBusy(false); }
  }

  return (
    <div className="flex gap-2 items-center mt-2">
      <input
        type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handle())}
        className="flex-1 px-3 py-1.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      {withColor && (
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" title="Цвят" />
      )}
      <button type="button" onClick={handle} disabled={busy || !name.trim()}
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg disabled:opacity-50">
        + Добави
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ToolForm({ initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags,       setTags]       = useState<Tag[]>([]);
  const [roles,      setRoles]      = useState<Role[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const [form, setForm] = useState<AiToolPayload>({
    name:              initial?.name              ?? '',
    description:       initial?.description       ?? '',
    how_to_use:        initial?.how_to_use        ?? '',
    url:               initial?.url               ?? '',
    logo_url:          initial?.logo_url           ?? '',
    documentation_url: initial?.documentation_url ?? '',
    video_url:         initial?.video_url          ?? '',
    difficulty:        initial?.difficulty         ?? 'beginner',
    is_active:         initial?.is_active          ?? true,
    is_free:           initial?.is_free            ?? true,
    category_ids:      initial?.categories.map(c => c.id) ?? [],
    role_ids:          initial?.roles.map(r => r.id)      ?? [],
    tag_ids:           initial?.tags.map(t => t.id)       ?? [],
    examples:          initial?.examples?.map(e => ({
      title: e.title ?? '', url: e.url ?? '', image_url: e.image_url ?? '', description: e.description ?? '',
    })) ?? [],
  });

  useEffect(() => {
    Promise.all([categoriesApi.list(), tagsApi.list(), rolesApi.list()])
      .then(([cats, tgs, rls]) => { setCategories(cats); setTags(tgs); setRoles(rls); });
  }, []);

  function set<K extends keyof AiToolPayload>(key: K, value: AiToolPayload[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleId(key: 'category_ids' | 'role_ids' | 'tag_ids', id: number) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter(x => x !== id) : [...prev[key], id],
    }));
  }

  // ── Examples helpers ────────────────────────────────────────────────────────
  function addExample() {
    setForm(prev => ({ ...prev, examples: [...prev.examples, emptyExample()] }));
  }

  function removeExample(i: number) {
    setForm(prev => ({ ...prev, examples: prev.examples.filter((_, idx) => idx !== i) }));
  }

  function setExample(i: number, key: keyof Omit<ToolExample, 'id'>, value: string) {
    setForm(prev => {
      const examples = [...prev.examples];
      examples[i] = { ...examples[i], [key]: value };
      return { ...prev, examples };
    });
  }

  // ── Inline add category / tag ────────────────────────────────────────────────
  async function addCategory(name: string, color: string) {
    const cat = await categoriesApi.create({ name, color });
    setCategories(prev => [...prev, cat]);
    setForm(prev => ({ ...prev, category_ids: [...prev.category_ids, cat.id] }));
  }

  async function addTag(name: string, color: string) {
    const tag = await tagsApi.create({ name, color });
    setTags(prev => [...prev, tag]);
    setForm(prev => ({ ...prev, tag_ids: [...prev.tag_ids, tag.id] }));
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (initial) {
        await toolsApi.update(initial.id, form);
        toast('Промените са запазени.');
      } else {
        const created = await toolsApi.create(form);
        toast(created.status === 'pending'
          ? 'Инструментът е изпратен за одобрение.'
          : 'Инструментът е добавен успешно.');
      }
      router.push('/tools');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Грешка при запис');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</div>
      )}

      {/* ── 1. Основна информация ─────────────────────────────────────────── */}
      <div className={sectionCls}>
        <SectionTitle>Основна информация</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Име *">
            <input required className={inputCls} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="ChatGPT" />
          </Field>
          <Field label="Уебсайт (линк)">
            <input type="url" className={inputCls} value={form.url}
              onChange={e => set('url', e.target.value)} placeholder="https://chatgpt.com" />
          </Field>
        </div>

        <Field label="Описание">
          <textarea rows={3} className={inputCls} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Кратко описание на инструмента и какви проблеми решава..." />
        </Field>

        <Field label="Как се използва"
          hint="Поддържа Markdown: **удебелен**, `код`, списъци с -, заглавия с ##">
          <textarea rows={4} className={inputCls} value={form.how_to_use}
            onChange={e => set('how_to_use', e.target.value)}
            placeholder={"1. Отиди на сайта и се регистрирай\n2. Избери модел\n3. Въведи prompt..."} />
        </Field>
      </div>

      {/* ── 2. Линкове ────────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <SectionTitle>Линкове и ресурси</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Официална документация">
            <input type="url" className={inputCls} value={form.documentation_url}
              onChange={e => set('documentation_url', e.target.value)}
              placeholder="https://docs.example.com" />
          </Field>
          <Field label="Видео ресурс / Tutorial">
            <input type="url" className={inputCls} value={form.video_url}
              onChange={e => set('video_url', e.target.value)}
              placeholder="https://youtube.com/..." />
          </Field>
          <Field label="Лого (URL или качи файл)">
            <ImageInput value={form.logo_url}
              onChange={url => set('logo_url', url)}
              placeholder="https://example.com/logo.png" />
          </Field>
        </div>
      </div>

      {/* ── 3. Класификация ───────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <SectionTitle>Класификация</SectionTitle>

        <div className="flex flex-wrap gap-4 items-end">
          <Field label="Ниво на трудност *">
            <select required className={`${inputCls} w-auto`} value={form.difficulty}
              onChange={e => set('difficulty', e.target.value as Difficulty)}>
              {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>

          <label className="flex items-center gap-2 cursor-pointer select-none pb-0.5">
            <input type="checkbox" checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 rounded accent-amber-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Активен</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none pb-0.5">
            <input type="checkbox" checked={form.is_free}
              onChange={e => set('is_free', e.target.checked)}
              className="w-4 h-4 rounded accent-amber-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Безплатен</span>
          </label>
        </div>

        {/* Категории */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Категории</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => {
              const selected = form.category_ids.includes(cat.id);
              return (
                <button type="button" key={cat.id}
                  onClick={() => toggleId('category_ids', cat.id)}
                  className={`text-sm px-3 py-1 rounded-full border-2 transition-all ${
                    selected ? 'text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  style={selected ? { backgroundColor: cat.color, borderColor: cat.color, color: textOn(cat.color) } : {}}>
                  {cat.name}
                </button>
              );
            })}
          </div>
          <InlineAdder placeholder="Нова категория..." onAdd={addCategory} withColor />
        </div>

        {/* Роли */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Препоръчителни роли
          </label>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => {
              const selected = form.role_ids.includes(role.id);
              return (
                <button type="button" key={role.id}
                  onClick={() => toggleId('role_ids', role.id)}
                  className={`text-sm px-3 py-1 rounded-full border-2 transition-all ${
                    selected
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                  }`}>
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Тагове */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Тагове</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const selected = form.tag_ids.includes(tag.id);
              return (
                <button type="button" key={tag.id}
                  onClick={() => toggleId('tag_ids', tag.id)}
                  className={`text-sm px-3 py-1 rounded-full border-2 transition-all ${
                    selected ? 'text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                  style={selected ? { backgroundColor: tag.color, borderColor: tag.color, color: textOn(tag.color) } : {}}>
                  #{tag.name}
                </button>
              );
            })}
          </div>
          <InlineAdder placeholder="Нов таг..." onAdd={addTag} withColor />
        </div>
      </div>

      {/* ── 4. Реални примери / Скрийншоти ────────────────────────────────── */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <SectionTitle>Реални примери и скрийншоти</SectionTitle>
          <button type="button" onClick={addExample}
            className="text-sm px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition-colors">
            + Добави пример
          </button>
        </div>

        {form.examples.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Няма добавени примери. Добави реален use-case или скрийншот.
          </p>
        ) : (
          <div className="space-y-4">
            {form.examples.map((ex, i) => (
              <div key={i} className="relative border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <button type="button" onClick={() => removeExample(i)}
                  className="absolute top-3 right-3 text-xs text-gray-400 hover:text-red-500">
                  ✕
                </button>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">Пример #{i + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Заглавие</label>
                    <input className={inputCls} value={ex.title}
                      onChange={e => setExample(i, 'title', e.target.value)}
                      placeholder="Пример: Генериране на тестове" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Линк към примера</label>
                    <input type="url" className={inputCls} value={ex.url}
                      onChange={e => setExample(i, 'url', e.target.value)}
                      placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Скрийншот (URL или качи файл)</label>
                    <ImageInput value={ex.image_url}
                      onChange={url => setExample(i, 'image_url', url)}
                      placeholder="https://i.imgur.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Описание</label>
                    <input className={inputCls} value={ex.description}
                      onChange={e => setExample(i, 'description', e.target.value)}
                      placeholder="Кратко описание на примера" />
                  </div>
                </div>
                {ex.image_url && (
                  <div className="mt-3">
                    <img src={ex.image_url} alt={ex.title || 'скрийншот'}
                      className="max-h-40 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-6 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors">
          {saving ? 'Записва...' : initial ? 'Запази промените' : 'Добави инструмент'}
        </button>
        <button type="button" onClick={() => router.push('/tools')}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Отказ
        </button>
      </div>
    </form>
  );
}
