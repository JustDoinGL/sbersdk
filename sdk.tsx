let state: PolicyInternalState = {
  status: "DRAFT_INCOMPLETE",
  lastRecalculationCounter: 0,
  isFirstCalculation: true,
  documents: [],
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

const getSnapshot = () => state;


setStatus: (status) => {
  state = {
    ...state,
    status,
  };

  emit();
},

