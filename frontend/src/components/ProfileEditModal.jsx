import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Save, User, Building2, Camera } from 'lucide-react';
import { getMyProfile, updateMyProfile, uploadAvatar, resolveMediaUrl } from '../services/api';

function Field({ id, label, value, onChange, placeholder, type = 'text', maxLength, as = 'input' }) {
  const cls = 'w-full bg-[#EFF6FF]/60 dark:bg-[#020B18] border border-[#BFDBFE] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F0F8FF] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-black/30 dark:placeholder:text-white/20';
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-black/55 dark:text-white/50 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} className={`${cls} min-h-[70px] resize-y`} />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} className={cls} />
      )}
    </div>
  );
}

export default function ProfileEditModal({ onClose, onSaved }) {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState('personal');
  const fileRef                   = useRef(null);

  const [form, setForm] = useState({
    display_name: '', username: '', bio: '', website_url: '', location_name: '',
    avatar_url: '',
    is_company: false, company_name: '', mission: '', vision: '',
    professional_area: '', company_description: '', contact_email: '', contact_phone: '',
  });

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setForm({
          display_name: p.DisplayName || '',
          username: p.Username || '',
          bio: p.Bio || '',
          website_url: p.WebsiteUrl || '',
          location_name: p.LocationName || '',
          avatar_url: p.AvatarUrl || '',
          is_company: !!p.IsCompany,
          company_name: p.CompanyName || '',
          mission: p.Mission || '',
          vision: p.Vision || '',
          professional_area: p.ProfessionalArea || '',
          company_description: p.CompanyDescription || '',
          contact_email: p.ContactEmail || '',
          contact_phone: p.ContactPhone || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAvatarClick = () => fileRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadAvatar(file);
      setForm(f => ({ ...f, avatar_url: res.avatar_url }));
    } catch (err) {
      setError(err.message || 'Error al subir la foto.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyProfile(form);
      const stored = JSON.parse(localStorage.getItem('nexus_user') || '{}');
      stored.DisplayName = updated.DisplayName;
      stored.Username    = updated.Username;
      localStorage.setItem('nexus_user', JSON.stringify(stored));
      onSaved?.(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.display_name || form.username || '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const avatarSrc = form.avatar_url ? resolveMediaUrl(form.avatar_url) : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        role="dialog" aria-label="Editar perfil"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#060E1E] border border-[#BFDBFE] dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BFDBFE] dark:border-white/10">
          <span className="font-serif font-black tracking-widest uppercase text-sm text-[#0F172A] dark:text-[#F0F8FF]">
            Editar Perfil
          </span>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X className="w-5 h-5 text-black/60 dark:text-white/60" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-[#BFDBFE] dark:border-white/10 px-6 pt-3">
              <button type="button" onClick={() => setTab('personal')}
                className={`flex items-center gap-2 px-4 pb-3 text-sm font-bold border-b-2 transition-colors ${
                  tab === 'personal' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-black/50 dark:text-white/40'
                }`}>
                <User className="w-4 h-4" /> Personal
              </button>
              <button type="button" onClick={() => setTab('company')}
                className={`flex items-center gap-2 px-4 pb-3 text-sm font-bold border-b-2 transition-colors ${
                  tab === 'company' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-black/50 dark:text-white/40'
                }`}>
                <Building2 className="w-4 h-4" /> Empresa
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {tab === 'personal' ? (
                <>
                  <div className="flex flex-col items-center gap-2 pb-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                      className="hidden" onChange={handleAvatarChange} />
                    <button type="button" onClick={handleAvatarClick} disabled={uploading}
                      className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#BFDBFE] dark:border-white/15 shadow-md hover:border-[#2563EB] transition-all focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                      {uploading ? (
                        <div className="w-full h-full flex items-center justify-center bg-[#EFF6FF] dark:bg-[#0D1B38]">
                          <Loader2 className="w-7 h-7 text-[#2563EB] animate-spin" />
                        </div>
                      ) : avatarSrc ? (
                        <>
                          <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex flex-col items-center justify-center gap-1">
                          <span className="text-white font-black font-serif text-2xl">{initials}</span>
                          <Camera className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </button>
                    <p className="text-[11px] text-black/40 dark:text-white/30">
                      {uploading ? 'Subiendo…' : 'Clic para cambiar foto'}
                    </p>
                  </div>

                  <Field id="pf-name"     label="Nombre visible"       value={form.display_name}   onChange={set('display_name')}   placeholder="Tu nombre"          maxLength={100} />
                  <Field id="pf-username" label="Nombre de usuario"    value={form.username}        onChange={set('username')}        placeholder="usuario"            maxLength={50} />
                  <Field id="pf-bio"      label="Biografía"            value={form.bio}             onChange={set('bio')}             placeholder="Cuéntanos sobre ti..." maxLength={500} as="textarea" />
                  <Field id="pf-web"      label="Sitio web"            value={form.website_url}     onChange={set('website_url')}     placeholder="https://…"          type="url" maxLength={500} />
                  <Field id="pf-location" label="Ubicación"            value={form.location_name}   onChange={set('location_name')}   placeholder="Ciudad, País"       maxLength={100} />
                </>
              ) : (
                <>
                  <label className="flex items-center gap-3 cursor-pointer text-sm text-black/70 dark:text-white/60 p-3 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/20">
                    <input type="checkbox" checked={form.is_company}
                      onChange={(e) => setForm((f) => ({ ...f, is_company: e.target.checked }))}
                      className="w-4 h-4 accent-[#2563EB]" />
                    <span>Este perfil representa a una <strong>empresa u organización</strong></span>
                  </label>
                  <Field id="pf-company"  label="Nombre de la empresa"  value={form.company_name}        onChange={set('company_name')}        placeholder="Mi Empresa S.A.S"          maxLength={150} />
                  <Field id="pf-area"     label="Área profesional"       value={form.professional_area}   onChange={set('professional_area')}   placeholder="Desarrollo de software…"  maxLength={150} />
                  <Field id="pf-mission"  label="Misión"                 value={form.mission}             onChange={set('mission')}             placeholder="Nuestra misión es…"        maxLength={500} as="textarea" />
                  <Field id="pf-vision"   label="Visión"                 value={form.vision}              onChange={set('vision')}              placeholder="Nuestra visión es…"        maxLength={500} as="textarea" />
                  <Field id="pf-cdesc"    label="Descripción"            value={form.company_description} onChange={set('company_description')} placeholder="A qué se dedica…"          maxLength={1000} as="textarea" />
                  <Field id="pf-cemail"   label="Email de contacto"      value={form.contact_email}       onChange={set('contact_email')}       placeholder="contacto@empresa.com"     type="email" maxLength={255} />
                  <Field id="pf-cphone"   label="Teléfono de contacto"   value={form.contact_phone}       onChange={set('contact_phone')}       placeholder="+57 300 000 0000"         maxLength={50} />
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#BFDBFE] dark:border-white/10 space-y-3">
              {error && <p className="text-xs text-red-500 font-bold" role="alert">{error}</p>}
              <button type="submit" disabled={saving || uploading}
                className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/40 text-white text-sm font-black transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
