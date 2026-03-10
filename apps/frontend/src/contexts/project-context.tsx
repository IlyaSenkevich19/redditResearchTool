'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'leadgen_project_id';

interface ProjectContextType {
  projectId: number | null;
  setProjectId: (id: number | null) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  projectId: null,
  setProjectId: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectIdState] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) setProjectIdState(n);
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  const setProjectId = useCallback((id: number | null) => {
    setProjectIdState(id);
    if (id !== null) {
      localStorage.setItem(STORAGE_KEY, String(id));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = hydrated ? { projectId, setProjectId } : { projectId: null, setProjectId };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
