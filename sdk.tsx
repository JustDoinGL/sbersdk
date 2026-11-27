
type PolicyInternalState = {
  status: PolicyStatus;
  lastRecalculationCounter: number;
  isFirstCalculation: boolean;
  documents: SampleDocument[];
};

type PolicyStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PolicyInternalState;

  syncExternalFlags: (flags: ExternalFlags) => void;
  setStatus: (status: PolicyStatus) => void;
  setDocuments: (documents: SampleDocument[]) => void;
  reset: () => void;
};

const resolveStatus = (
  flags: ExternalFlags,
  internal: PolicyInternalState
): PolicyStatus => {
  const { canRequest, recalculationCounter } = flags;

  const {
    lastRecalculationCounter,
    status,
    isFirstCalculation,
  } = internal;

  if (!canRequest) {
    return "DRAFT_INCOMPLETE";
  }

  if (!isFirstCalculation) {
    const isRecalculated =
      recalculationCounter > lastRecalculationCounter;

    if (isRecalculated) {
      emailCooldown.reset();
      return "DRAFT_REWORK";
    }
  }

  if (status === "SENT_DOCUMENT") {
    return "SENT_DOCUMENT";
  }

  if (status === "READY_DOWNLOAD_OR_SENT") {
    return "READY_DOWNLOAD_OR_SENT";
  }

  return "READY_TO_GENERATE";
};

const createPolicyStore = (): PolicyStore => {
  // Начальное состояние
  let state: PolicyInternalState = {
    status: "DRAFT_INCOMPLETE",
    lastRecalculationCounter: 0,
    isFirstCalculation: true,
    documents: [],
  };

  // Подписчики
  const listeners = new Set<() => void>();

  // Уведомление подписчиков
  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  // Подписка
  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  // Получение актуального snapshot
  const getSnapshot = () => state;

  // Обновление состояния
  const updateState = (
    updater: (
      prev: PolicyInternalState
    ) => PolicyInternalState
  ) => {
    state = updater(state);
    emit();
  };

  const store: PolicyStore = {
    subscribe,
    getSnapshot,

    syncExternalFlags: (flags) => {
      updateState((prev) => ({
        ...prev,
        status: resolveStatus(flags, prev),
        lastRecalculationCounter:
          flags.recalculationCounter,
      }));
    },

    setStatus: (status) => {
      updateState((prev) => ({
        ...prev,
        status,
        ...(status === "READY_DOWNLOAD_OR_SENT"
          ? { isFirstCalculation: false }
          : {}),
      }));
    },

    setDocuments: (documents) => {
      updateState((prev) => ({
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

// Создаём store
const policyStore = createPolicyStore();

// React hook
export const usePolicyStore = () => {
  return useSyncExternalStore(
    policyStore.subscribe,
    policyStore.getSnapshot,
    policyStore.getSnapshot
  );
};

// Получение конфигурации
export const usePolicyConfig = () => {
  const { status } = usePolicyStore();

  return POLICY_STATUSES[status];
};
