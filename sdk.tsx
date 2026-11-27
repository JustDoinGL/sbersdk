const createPolicyStore = (): PolicyStore => {
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

    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = () => state;

  const updateState = (
    updater: (prev: PolicyInternalState) => PolicyInternalState
  ) => {
    state = updater(state);
    emit();
  };

  const store: PolicyStore = {
    // Подписки
    subscribe,
    getSnapshot,

    // Все твои методы остаются доступными
    syncExternalFlags: (flags) => {
      updateState(prev => ({
        ...prev,
        status: resolveStatus(flags, prev),
        lastRecalculationCounter: flags.recalculationCounter,
      }));
    },

    setStatus: (status) => {
      updateState(prev => ({
        ...prev,
        status,
        ...(status === "READY_DOWNLOAD_OR_SENT"
          ? { isFirstCalculation: false }
          : {}),
      }));
    },

    setDocuments: (documents) => {
      updateState(prev => ({
        ...prev,
        documents,
      }));
    },

    reset: () => {
      updateState(() => ({
        status: "DRAFT_INCOMPLETE",
        lastRecalculationCounter: 0,
        isFirstCalculation: true,
        documents: [],
      }));
    },
  };

  return store;
};

export const policyStore = createPolicyStore();

export const usePolicyStore = () => {
  return useSyncExternalStore(
    policyStore.subscribe,
    policyStore.getSnapshot,
    policyStore.getSnapshot
  );
};

export const usePolicyConfig = () => {
  const { status } = usePolicyStore();

  return POLICY_STATUSES[status];
};