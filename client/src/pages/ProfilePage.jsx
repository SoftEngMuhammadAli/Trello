import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AppShell from '../layouts/AppShell';
import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
} from '../features/auth/authSlice';
import { ensureUserProfile } from '../features/auth/profileDefaults';

const tabs = [
  { id: 'personal', label: 'Personal' },
  { id: 'professional', label: 'Professional' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'education', label: 'Education' },
  { id: 'social', label: 'Social' },
  { id: 'account', label: 'Account' },
];

const workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const formatLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const readValue = (source, path, fallback = '') => {
  if (!source) return fallback;
  return path.reduce((acc, key) => (acc === undefined || acc === null ? undefined : acc[key]), source) ?? fallback;
};

const updateAtPath = (source, path, value) => {
  if (path.length === 0) return source;
  const [head, ...rest] = path;
  return {
    ...(source || {}),
    [head]:
      rest.length === 0
        ? value
        : updateAtPath(source && typeof source === 'object' ? source[head] : undefined, rest, value),
  };
};

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, profileStatus } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setDraft(ensureUserProfile(user));
  }, [user]);

  const safeUser = useMemo(() => ensureUserProfile(draft || user), [draft, user]);

  const setField = (path, value) => {
    setDraft((previous) => updateAtPath(previous, path, value));
  };

  const completion = safeUser?.profile?.completion || 0;
  const displayName =
    safeUser?.name ||
    [safeUser?.profile?.personal?.firstName, safeUser?.profile?.personal?.lastName]
      .filter(Boolean)
      .join(' ');

  const onSave = async () => {
    if (!draft) return;
    const profilePayload = { ...(draft.profile || {}) };
    delete profilePayload.completion;

    const payload = {
      name: draft.name,
      avatar: draft.avatar,
      profile: profilePayload,
    };
    const result = await dispatch(updateCurrentUserProfile(payload));
    if (updateCurrentUserProfile.fulfilled.match(result)) {
      toast.success('Profile updated');
      setEditing(false);
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  const onCancel = () => {
    setDraft(ensureUserProfile(user));
    setEditing(false);
  };

  return (
    <AppShell title="My Profile">
      <main className="space-y-6 rise-in">
        <header className="app-card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-app md:text-4xl">My Profile</h1>
            <p className="mt-2 text-sm text-app-muted md:text-base">Manage your personal information and preferences</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  className="rounded-xl border border-app bg-panel-soft px-5 py-2 font-semibold text-app"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-strong"
                  onClick={onSave}
                >
                  Save
                </button>
              </>
            ) : (
              <button
                className="rounded-xl bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-strong"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          <article className="app-card p-5">
            <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-app bg-panel-soft">
              {safeUser?.avatar ? (
                <img src={safeUser.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-app">{displayName?.slice(0, 1)?.toUpperCase() || 'U'}</span>
              )}
            </div>

            <h2 className="mt-5 text-center text-3xl font-black tracking-tight text-app">{displayName || 'User'}</h2>
            <p className="mt-1 text-center text-base text-app-muted">
              {safeUser?.profile?.professional?.jobTitle || 'Team Member'}
            </p>
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-app bg-panel-soft px-4 py-1 text-sm font-semibold text-app-muted">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {safeUser?.profile?.account?.status || 'offline'}
            </div>

            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between text-sm text-app-muted">
                <span>Profile Completion</span>
                <span>{completion}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-panel-soft">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
                />
              </div>
            </div>
          </article>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-app bg-panel-soft p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    activeTab === tab.id ? 'bg-panel text-app' : 'text-app-muted hover:text-app'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <section className="app-card p-5">
              {activeTab === 'personal' ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">Basic Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">First Name</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'personal', 'firstName'])}
                        onChange={(event) => setField(['profile', 'personal', 'firstName'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Last Name</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'personal', 'lastName'])}
                        onChange={(event) => setField(['profile', 'personal', 'lastName'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Phone Number</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'personal', 'phoneNumber'])}
                        onChange={(event) => setField(['profile', 'personal', 'phoneNumber'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Personal Email</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'personal', 'personalEmail'])}
                        onChange={(event) => setField(['profile', 'personal', 'personalEmail'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Date of Birth</span>
                      <input
                        type="date"
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'personal', 'dateOfBirth'], '').slice(0, 10)}
                        onChange={(event) => setField(['profile', 'personal', 'dateOfBirth'], event.target.value || null)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Gender</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'personal', 'gender'])}
                        onChange={(event) => setField(['profile', 'personal', 'gender'], event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">About</span>
                    <textarea
                      className="profile-field min-h-28"
                      disabled={!editing}
                      value={readValue(safeUser, ['profile', 'personal', 'about'])}
                      onChange={(event) => setField(['profile', 'personal', 'about'], event.target.value)}
                    />
                  </label>
                </div>
              ) : null}

              {activeTab === 'professional' ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">Work Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Job Title</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'professional', 'jobTitle'])}
                        onChange={(event) => setField(['profile', 'professional', 'jobTitle'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Department</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'professional', 'department'])}
                        onChange={(event) => setField(['profile', 'professional', 'department'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Years of Experience</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'professional', 'yearsOfExperience'])}
                        onChange={(event) =>
                          setField(['profile', 'professional', 'yearsOfExperience'], event.target.value)
                        }
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Work Location</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'professional', 'workLocation'])}
                        onChange={(event) =>
                          setField(['profile', 'professional', 'workLocation'], event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Skills (comma separated)</span>
                    <input
                      className="profile-field"
                      disabled={!editing}
                      value={readValue(safeUser, ['profile', 'professional', 'skills'], []).join(', ')}
                      onChange={(event) =>
                        setField(
                          ['profile', 'professional', 'skills'],
                          event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                        )
                      }
                    />
                  </label>
                </div>
              ) : null}

              {activeTab === 'schedule' ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">Working Hours</h3>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Time Zone</span>
                    <input
                      className="profile-field"
                      disabled={!editing}
                      value={readValue(safeUser, ['profile', 'schedule', 'timeZone'])}
                      onChange={(event) => setField(['profile', 'schedule', 'timeZone'], event.target.value)}
                    />
                  </label>

                  <div className="rounded-xl border border-app">
                    {workingDays.map((day) => (
                      <div key={day} className="grid gap-2 border-b border-app px-3 py-3 last:border-b-0 md:grid-cols-4">
                        <div className="font-semibold">{formatLabel(day)}</div>
                        <label className="flex items-center gap-2 text-sm text-app-muted">
                          <input
                            type="checkbox"
                            disabled={!editing}
                            checked={Boolean(readValue(safeUser, ['profile', 'schedule', 'workingHours', day, 'enabled'], false))}
                            onChange={(event) =>
                              setField(
                                ['profile', 'schedule', 'workingHours', day, 'enabled'],
                                event.target.checked,
                              )
                            }
                          />
                          Active
                        </label>
                        <input
                          type="time"
                          className="profile-field"
                          disabled={!editing}
                          value={readValue(safeUser, ['profile', 'schedule', 'workingHours', day, 'start'])}
                          onChange={(event) =>
                            setField(['profile', 'schedule', 'workingHours', day, 'start'], event.target.value)
                          }
                        />
                        <input
                          type="time"
                          className="profile-field"
                          disabled={!editing}
                          value={readValue(safeUser, ['profile', 'schedule', 'workingHours', day, 'end'])}
                          onChange={(event) =>
                            setField(['profile', 'schedule', 'workingHours', day, 'end'], event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === 'education' ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">Education</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Degree</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'education', 'degree'])}
                        onChange={(event) => setField(['profile', 'education', 'degree'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Institution</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'education', 'institution'])}
                        onChange={(event) => setField(['profile', 'education', 'institution'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Field of Study</span>
                      <input
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'education', 'fieldOfStudy'])}
                        onChange={(event) => setField(['profile', 'education', 'fieldOfStudy'], event.target.value)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">Start Date</span>
                      <input
                        type="date"
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'education', 'startDate'], '').slice(0, 10)}
                        onChange={(event) => setField(['profile', 'education', 'startDate'], event.target.value || null)}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-semibold text-app-muted">End Date</span>
                      <input
                        type="date"
                        className="profile-field"
                        disabled={!editing}
                        value={readValue(safeUser, ['profile', 'education', 'endDate'], '').slice(0, 10)}
                        onChange={(event) => setField(['profile', 'education', 'endDate'], event.target.value || null)}
                      />
                    </label>
                  </div>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Description</span>
                    <textarea
                      className="profile-field min-h-24"
                      disabled={!editing}
                      value={readValue(safeUser, ['profile', 'education', 'description'])}
                      onChange={(event) => setField(['profile', 'education', 'description'], event.target.value)}
                    />
                  </label>
                </div>
              ) : null}

              {activeTab === 'social' ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">Social Profiles</h3>
                  <div className="grid gap-4">
                    {['github', 'linkedin', 'website', 'x'].map((field) => (
                      <label key={field} className="space-y-1">
                        <span className="text-sm font-semibold text-app-muted">{formatLabel(field)}</span>
                        <input
                          className="profile-field"
                          disabled={!editing}
                          value={readValue(safeUser, ['profile', 'social', field])}
                          onChange={(event) => setField(['profile', 'social', field], event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeTab === 'account' ? (
                <div className="space-y-5">
                  <h3 className="text-3xl font-black tracking-tight md:text-4xl">Account Settings</h3>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Display Name</span>
                    <input
                      className="profile-field"
                      disabled={!editing}
                      value={readValue(safeUser, ['name'])}
                      onChange={(event) => setField(['name'], event.target.value)}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Primary Email</span>
                    <input className="profile-field" disabled value={readValue(safeUser, ['email'])} />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Secondary Email</span>
                    <input
                      className="profile-field"
                      disabled={!editing}
                      value={readValue(safeUser, ['profile', 'account', 'secondaryEmail'])}
                      onChange={(event) => setField(['profile', 'account', 'secondaryEmail'], event.target.value)}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-semibold text-app-muted">Status</span>
                    <select
                      className="profile-field"
                      disabled={!editing}
                      value={readValue(safeUser, ['profile', 'account', 'status'], 'offline')}
                      onChange={(event) => setField(['profile', 'account', 'status'], event.target.value)}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="away">Away</option>
                      <option value="busy">Busy</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </main>

      {profileStatus === 'loading' ? (
        <div className="fixed bottom-5 right-5 rounded-xl border border-app bg-panel px-4 py-2 text-sm text-app-muted">
          Updating profile...
        </div>
      ) : null}
    </AppShell>
  );
}

export default ProfilePage;
