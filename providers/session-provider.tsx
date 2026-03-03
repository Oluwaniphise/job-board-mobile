import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type SessionUser = {
  username: string;
};

export type JobApplication = {
  jobId: string;
  resumeName: string;
  resumeUri: string;
  coverLetter?: string;
  appliedAt: string;
};

type SessionContextValue = {
  user: SessionUser | null;
  isHydrating: boolean;
  applications: JobApplication[];
  signIn: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
  applyToJob: (application: Omit<JobApplication, 'appliedAt'>) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  getApplication: (jobId: string) => JobApplication | undefined;
};

const SESSION_USER_KEY = 'session_user';
const JOB_APPLICATIONS_KEY = 'job_applications';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedUser, storedApplications] = await Promise.all([
          AsyncStorage.getItem(SESSION_USER_KEY),
          AsyncStorage.getItem(JOB_APPLICATIONS_KEY),
        ]);

        if (storedUser) {
          setUser(JSON.parse(storedUser) as SessionUser);
        }
        if (storedApplications) {
          setApplications(JSON.parse(storedApplications) as JobApplication[]);
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, []);

  const signIn = async (username: string) => {
    const nextUser = { username };
    setUser(nextUser);
    await AsyncStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_USER_KEY);
  };

  const applyToJob = async (application: Omit<JobApplication, 'appliedAt'>) => {
    const next: JobApplication = {
      ...application,
      appliedAt: new Date().toISOString(),
    };

    setApplications((previous) => {
      const filtered = previous.filter((item) => item.jobId !== application.jobId);
      const updated = [next, ...filtered];
      AsyncStorage.setItem(JOB_APPLICATIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const hasApplied = (jobId: string) => applications.some((application) => application.jobId === jobId);

  const getApplication = (jobId: string) =>
    applications.find((application) => application.jobId === jobId);

  const value = useMemo(
    () => ({
      user,
      isHydrating,
      applications,
      signIn,
      signOut,
      applyToJob,
      hasApplied,
      getApplication,
    }),
    [applications, isHydrating, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
}
