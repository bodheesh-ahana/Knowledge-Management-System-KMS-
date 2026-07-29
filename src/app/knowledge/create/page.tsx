'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components';

interface Step {
  order: number;
  description: string;
}

export default function CreateKnowledgeArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [application, setApplication] = useState('');
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [prevention, setPrevention] = useState('');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<Step[]>([{ order: 1, description: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStep = () => setSteps((s) => [...s, { order: s.length + 1, description: '' }]);
  const removeStep = (idx: number) =>
    setSteps((s) => s.filter((_, i) => i !== idx).map((step, i) => ({ ...step, order: i + 1 })));
  const updateStep = (idx: number, description: string) =>
    setSteps((s) => s.map((step, i) => (i === idx ? { ...step, description } : step)));

  const submit = async (status: 'Draft' | 'Published') => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        application: application.trim(),
        symptoms: symptoms.trim(),
        rootCause: rootCause.trim(),
        resolution: resolution.trim(),
        prevention: prevention.trim() || undefined,
        troubleshootingSteps: steps.filter((s) => s.description.trim()),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        status,
      };

      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save article');
      }

      router.push(`/knowledge/${json.data._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit('Published');
  };

  return (
    <AppLayout>
      <div className="p-lg max-w-[900px] mx-auto space-y-lg">
        <div className="pb-sm border-b border-outline-variant/20">
          <h1 className="font-h1 text-h1 text-on-surface tracking-tight">New Knowledge Article</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Document the issue so anyone can search and resolve it next time.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-md py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <Field label="Title *">
            <input
              required
              minLength={10}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Drake Icons Not Displaying in Numera Cloud"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <Field label="Application *">
              <input
                required
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                placeholder="e.g. Drake, QuickBooks, CCH"
                className="input"
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. login, icons, folder mapping"
                className="input"
              />
            </Field>
          </div>

          <Field label="Short Description">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One-line summary of the issue"
              className="input"
            />
          </Field>

          <Field label="Symptoms *">
            <textarea
              required
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="What does the user see/experience? e.g. Drake icon missing, application shortcut blank"
              className="input"
            />
          </Field>

          <Field label="Root Cause *">
            <textarea
              required
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Why did this happen?"
              className="input"
            />
          </Field>

          <Field label="Troubleshooting Steps">
            <div className="space-y-xs">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-xs items-center">
                  <span className="w-6 text-center text-on-surface-variant text-body-sm">
                    {step.order}
                  </span>
                  <input
                    value={step.description}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    placeholder={`Step ${step.order}`}
                    className="input flex-1"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-error text-body-sm px-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="text-primary text-body-sm font-medium"
              >
                + Add Step
              </button>
            </div>
          </Field>

          <Field label="Resolution *">
            <textarea
              required
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="How was it fixed?"
              className="input"
            />
          </Field>

          <Field label="Prevention">
            <textarea
              rows={2}
              value={prevention}
              onChange={(e) => setPrevention(e.target.value)}
              placeholder="How to prevent this from recurring?"
              className="input"
            />
          </Field>

          <div className="flex justify-end gap-sm pt-sm">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => submit('Draft')}
            >
              Save as Draft
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          background: var(--tw-color-surface, #fff);
          border: 1px solid rgba(115, 118, 134, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
        }
        .input:focus {
          outline: none;
          border-color: #004ac6;
        }
      `}</style>
    </AppLayout>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
