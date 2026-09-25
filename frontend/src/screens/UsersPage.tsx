import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff, ShieldOff } from 'lucide-react';
import { User, UserRole, formatDate, initials, avatarGradient } from '../data';
import { RoleBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BottomSheet from '../components/ui/BottomSheet';
import { useToast } from '../context/ToastContext';
import { useIsMobile } from '../hooks/useIsMobile';

interface UsersPageProps {
  userRole: UserRole;
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#DC2626', '#D97706', '#2563EB', '#16A34A'];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= score ? colors[score] : '#E7F0EA' }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}

// ─── User form modal ──────────────────────────────────────────────────────────
interface UserFormProps {
  user?: User;
  onSave: (u: Omit<User, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

function UserForm({ user, onSave, onClose }: UserFormProps) {
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', password: '', role: user?.role ?? 'staff' as UserRole });
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSave() {
    setSubmitted(true);
    if (!form.name || !form.email) return;
    if (!user && !form.password) return;
    onSave({ name: form.name, email: form.email, role: form.role });
  }

  const inputClass = "w-full border border-[#E7F0EA] rounded-xl px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all bg-white";
  const errBorder = "border-red-300 ring-2 ring-red-100";

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between py-5 border-b border-[#E7F0EA] mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{user ? 'Edit User' : 'Add User'}</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Manage clinic staff access</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F6FBF7] transition-colors"><X size={16} /></button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} placeholder="e.g. Dr. Sarah Green" className={`${inputClass} ${submitted && !form.name ? errBorder : ''}`} />
          {submitted && !form.name && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email <span className="text-red-400">*</span></label>
          <input type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} placeholder="user@clinicflow.app" className={`${inputClass} ${submitted && !form.email ? errBorder : ''}`} />
          {submitted && !form.email && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>

        {/* Password only on create */}
        {!user && (
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(v => ({ ...v, password: e.target.value }))} placeholder="Min. 8 characters" className={`${inputClass} pr-11 ${submitted && !form.password ? errBorder : ''}`} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
            {submitted && !form.password && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
        )}

        {/* Role selection */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-2">Role <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {(['admin', 'staff'] as UserRole[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(v => ({ ...v, role: r }))}
                className="flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: form.role === r ? '#16A34A' : '#E7F0EA',
                  background: form.role === r ? '#ECFDF5' : '#fff',
                }}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-semibold capitalize" style={{ color: form.role === r ? '#16A34A' : '#374151' }}>{r}</span>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all" style={{ borderColor: form.role === r ? '#16A34A' : '#D1D5DB' }}>
                    {form.role === r && <div className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} />}
                  </div>
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-snug">
                  {r === 'admin' ? 'Full access including user management.' : 'Can manage patients & appointments.'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1 border-t border-[#E7F0EA] mt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] transition-all active:scale-95">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>
            {user ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 403 Screen ───────────────────────────────────────────────────────────────
export function AccessDeniedPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#FEF2F2' }}>
        <ShieldOff size={36} color="#DC2626" />
      </div>
      <h2 className="text-xl font-semibold text-[#14532D] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>403 — Access Denied</h2>
      <p className="text-sm text-[#6B7280] max-w-sm leading-relaxed mb-6">
        You don't have permission to access this page. This area is restricted to clinic administrators.
      </p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// TODO: replace with real API call
const USERS: User[] = [];

export default function UsersPage({ userRole }: UsersPageProps) {
  const { addToast } = useToast();
  const isMobile = useIsMobile();
  const isAdmin = userRole === 'admin';

  // Staff see 403
  if (!isAdmin) return <AccessDeniedPage onBack={() => {}} />;

  const [users, setUsers] = useState(USERS);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  function handleSave(form: Omit<User, 'id' | 'createdAt'>) {
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
      addToast('success', `${form.name} updated successfully.`);
    } else {
      setUsers(prev => [{ ...form, id: `u${Date.now()}`, createdAt: '2026-09-24' }, ...prev]);
      addToast('success', `${form.name} added as ${form.role}.`);
    }
    setShowModal(false);
    setEditUser(undefined);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    addToast('success', `${deleteTarget.name}'s account removed.`);
    setDeleteTarget(null);
  }

  // ── Desktop table ─────────────────────────────────────────────────────────────
  const desktopContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>Users</h2>
          <p className="text-sm text-[#9CA3AF] mt-0.5">Manage clinic staff and administrators</p>
        </div>
        <button
          onClick={() => { setEditUser(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
        >
          <Plus size={16} /> Add user
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-hidden">
        <div className="grid text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-6 py-3.5 border-b border-[#F0F5F2]" style={{ gridTemplateColumns: '2fr 2fr 120px 1fr 80px' }}>
          <span>Name</span><span>Email</span><span>Role</span><span>Created</span><span className="text-right">Actions</span>
        </div>

        {users.length === 0 ? (
          <EmptyState title="No users yet" description="Add clinic staff to get started." />
        ) : (
          users.map(u => (
            <div key={u.id} className="grid items-center px-6 py-3.5 border-b border-[#F0F5F2] last:border-0 hover:bg-[#FAFCFB] transition-colors" style={{ gridTemplateColumns: '2fr 2fr 120px 1fr 80px' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: avatarGradient(u.id) }}>
                  {initials(u.name)}
                </div>
                <p className="text-sm font-semibold text-[#14532D]">{u.name}</p>
              </div>
              <span className="text-sm text-[#374151]">{u.email}</span>
              <RoleBadge role={u.role} />
              <span className="text-sm text-[#374151]">{formatDate(u.createdAt)}</span>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => { setEditUser(u); setShowModal(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteTarget(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ── Mobile cards ──────────────────────────────────────────────────────────────
  const mobileContent = (
    <div className="flex flex-col gap-3 pt-2">
      {users.map(u => (
        <div key={u.id} className="bg-white rounded-2xl border border-[#E7F0EA] p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: avatarGradient(u.id) }}>
              {initials(u.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#14532D] truncate">{u.name}</p>
              <p className="text-xs text-[#9CA3AF] truncate">{u.email}</p>
            </div>
            <RoleBadge role={u.role} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditUser(u); setShowModal(true); }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#374151] hover:bg-[#F6FBF7] transition-colors flex items-center justify-center gap-1">
              <Pencil size={12} /> Edit
            </button>
            <button onClick={() => setDeleteTarget(u)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-red-100 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-1">
              <Trash2 size={12} /> Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {isMobile ? mobileContent : desktopContent}

      {showModal && !isMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-[#E7F0EA] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <UserForm user={editUser} onSave={handleSave} onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}

      {showModal && isMobile && (
        <BottomSheet onClose={() => setShowModal(false)}>
          <UserForm user={editUser} onSave={handleSave} onClose={() => setShowModal(false)} />
        </BottomSheet>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Remove ${deleteTarget.name}?`}
          message={`This will revoke ${deleteTarget.name}'s access to ClinicFlow. They will no longer be able to sign in.`}
          confirmLabel="Yes, remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </>
  );
}
