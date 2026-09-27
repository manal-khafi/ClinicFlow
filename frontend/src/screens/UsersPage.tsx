import { useState, useEffect, useCallback } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, X, Eye, EyeOff, ShieldOff, AlertCircle, Power, PowerOff } from 'lucide-react';
import { User, UserRole, formatDate, initials, avatarGradient } from '../data';
import { RoleBadge, ActiveStatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BottomSheet from '../components/ui/BottomSheet';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { createUserSchema, updateUserSchema } from '../validators/user.schema';
import { getUsers, createUser, updateUser, deactivateUser, reactivateUser } from '../api/users.api';

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
// The form always collects fullName/email/password/role — password is simply never
// rendered (or required) in edit mode. createUserSchema/updateUserSchema differ only in
// whether password is present/required, so both validate this same shape; the resolver
// picks the right schema for the mode and the parent strips password before calling
// updateUser.
interface UserFormValues {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UserFormProps {
  user?: User;
  onSave: (data: UserFormValues) => void;
  onClose: () => void;
  submitError?: string;
}

function UserForm({ user, onSave, onClose, submitError }: UserFormProps) {
  const isEdit = Boolean(user);
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: (((values: any, context: any, options: any) =>
      zodResolver(isEdit ? updateUserSchema : createUserSchema)(values, context, options)
    ) as unknown) as Resolver<UserFormValues>,
    defaultValues: {
      fullName: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'staff',
    },
  });

  const password = watch('password');
  const role = watch('role');

  const inputClass = "w-full border border-[#E7F0EA] rounded-xl px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all bg-white";
  const errBorder = "border-red-300 ring-2 ring-red-100";

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between py-5 border-b border-[#E7F0EA] mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{user ? 'Edit User' : 'Add User'}</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Manage clinic staff access</p>
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F6FBF7] transition-colors"><X size={16} /></button>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        {submitError && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
            <AlertCircle size={14} color="#DC2626" />
            <p className="text-xs font-medium text-[#DC2626]">{submitError}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input {...register('fullName')} placeholder="e.g. Dr. Sarah Green" className={`${inputClass} ${errors.fullName ? errBorder : ''}`} />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email <span className="text-red-400">*</span></label>
          <input type="email" {...register('email')} placeholder="user@clinicflow.app" className={`${inputClass} ${errors.email ? errBorder : ''}`} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password only on create */}
        {!user && (
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} {...register('password')} placeholder="Min. 8 characters" className={`${inputClass} pr-11 ${errors.password ? errBorder : ''}`} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={password} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
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
                onClick={() => setValue('role', r, { shouldValidate: true })}
                className="flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: role === r ? '#16A34A' : '#E7F0EA',
                  background: role === r ? '#ECFDF5' : '#fff',
                }}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-semibold capitalize" style={{ color: role === r ? '#16A34A' : '#374151' }}>{r}</span>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all" style={{ borderColor: role === r ? '#16A34A' : '#D1D5DB' }}>
                    {role === r && <div className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} />}
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
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] transition-all active:scale-95">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>
            {isSubmitting ? 'Saving…' : user ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
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
export default function UsersPage({ userRole }: UsersPageProps) {
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const isMobile = useIsMobile();
  const isAdmin = userRole === 'admin';

  // Staff see 403
  if (!isAdmin) return <AccessDeniedPage onBack={() => {}} />;

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [formError, setFormError] = useState('');

  // Debounce the search box by ~300ms so it doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUsers({ search: debouncedSearch, page, limit: rowsPerPage });
      setUsers(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      addToast('error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleSave(values: UserFormValues) {
    setFormError('');
    try {
      if (editUser) {
        const { password, ...payload } = values;
        await updateUser(editUser.id, payload);
        addToast('success', `${values.fullName} updated successfully.`);
      } else {
        await createUser(values);
        addToast('success', `${values.fullName} added as ${values.role}.`);
      }
      setShowModal(false);
      setEditUser(undefined);
      fetchUsers();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setFormError(err.response.data?.error ?? 'A user with this email already exists.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    try {
      await deactivateUser(deactivateTarget.id);
      addToast('success', `${deactivateTarget.name}'s account deactivated.`);
      fetchUsers();
    } catch {
      addToast('error', 'Failed to deactivate user.');
    } finally {
      setDeactivateTarget(null);
    }
  }

  async function handleReactivate(u: User) {
    try {
      await reactivateUser(u.id);
      addToast('success', `${u.name}'s account reactivated.`);
      fetchUsers();
    } catch {
      addToast('error', 'Failed to reactivate user.');
    }
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
          onClick={() => { setEditUser(undefined); setFormError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
        >
          <Plus size={16} /> Add user
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-hidden">
        <div className="grid text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-6 py-3.5 border-b border-[#F0F5F2]" style={{ gridTemplateColumns: '2fr 2fr 100px 100px 1fr 80px' }}>
          <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Created</span><span className="text-right">Actions</span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description={search ? `No results for "${search}".` : 'Add clinic staff to get started.'} />
        ) : (
          users.map(u => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div key={u.id} className="grid items-center px-6 py-3.5 border-b border-[#F0F5F2] last:border-0 hover:bg-[#FAFCFB] transition-colors" style={{ gridTemplateColumns: '2fr 2fr 100px 100px 1fr 80px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: avatarGradient(u.id) }}>
                    {initials(u.name)}
                  </div>
                  <p className="text-sm font-semibold text-[#14532D]">{u.name}</p>
                </div>
                <span className="text-sm text-[#374151]">{u.email}</span>
                <RoleBadge role={u.role} />
                <ActiveStatusBadge isActive={u.isActive} />
                <span className="text-sm text-[#374151]">{formatDate(u.createdAt)}</span>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => { setEditUser(u); setFormError(''); setShowModal(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors" title="Edit">
                    <Pencil size={14} />
                  </button>
                  {!isSelf && (
                    u.isActive ? (
                      <button onClick={() => setDeactivateTarget(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors" title="Deactivate">
                        <PowerOff size={14} />
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors" title="Reactivate">
                        <Power size={14} />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {users.length > 0 && (
          <div className="px-6 py-3.5 border-t border-[#F0F5F2]">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} rowsPerPage={rowsPerPage} onRowsPerPage={n => { setRowsPerPage(n); setPage(1); }} totalItems={total} />
          </div>
        )}
      </div>
    </div>
  );

  // ── Mobile cards ──────────────────────────────────────────────────────────────
  const mobileContent = (
    <div className="flex flex-col gap-3 pt-2">
      {loading ? (
        <CardSkeleton count={5} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description={search ? `No results for "${search}".` : 'Add clinic staff to get started.'} />
      ) : (
        users.map(u => {
          const isSelf = u.id === currentUser?.id;
          return (
            <div key={u.id} className="bg-white rounded-2xl border border-[#E7F0EA] p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: avatarGradient(u.id) }}>
                  {initials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#14532D] truncate">{u.name}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RoleBadge role={u.role} />
                  <ActiveStatusBadge isActive={u.isActive} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditUser(u); setFormError(''); setShowModal(true); }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#374151] hover:bg-[#F6FBF7] transition-colors flex items-center justify-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
                {!isSelf && (
                  u.isActive ? (
                    <button onClick={() => setDeactivateTarget(u)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-red-100 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-1">
                      <PowerOff size={12} /> Deactivate
                    </button>
                  ) : (
                    <button onClick={() => handleReactivate(u)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#16A34A] hover:bg-[#ECFDF5] transition-colors flex items-center justify-center gap-1">
                      <Power size={12} /> Reactivate
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <>
      {isMobile ? mobileContent : desktopContent}

      {showModal && !isMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-[#E7F0EA] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <UserForm user={editUser} onSave={handleSave} onClose={() => setShowModal(false)} submitError={formError} />
          </div>
        </div>
      )}

      {showModal && isMobile && (
        <BottomSheet onClose={() => setShowModal(false)}>
          <UserForm user={editUser} onSave={handleSave} onClose={() => setShowModal(false)} submitError={formError} />
        </BottomSheet>
      )}

      {deactivateTarget && (
        <ConfirmDialog
          title={`Deactivate ${deactivateTarget.name}?`}
          message={`This will revoke ${deactivateTarget.name}'s access to ClinicFlow. They will no longer be able to sign in, but can be reactivated later.`}
          confirmLabel="Yes, deactivate"
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivateTarget(null)}
          danger
        />
      )}
    </>
  );
}
