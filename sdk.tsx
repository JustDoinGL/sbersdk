const createPolicyStore = (): PolicyStore => {
  // 1. Внутреннее состояние
  let state: PolicyInternalState = {
    status: "DRAFT_INCOMPLETE",
    lastRecalculationCounter: 0,
    isFirstCalculation: true,
    documents: [],
  };

  // 2. Слушатели
  const listeners = new Set<() => void>();
  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  // 3. Снимок для React. Инициализируем копией данных.
  let snapshot: PolicyInternalState = { ...state };

  // 4. Функция для обновления стейта и снимка
  const updateState = (newState: Partial<PolicyInternalState>) => {
    state = { ...state, ...newState };
    snapshot = { ...state }; // Создаем НОВЫЙ объект для React
    emit();
  };

  const store: PolicyStore = {
    // Начальные данные (для типизации, если обращаетесь напрямую)
    ...state,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // Возвращаем чистый снимок данных
    getSnapshot: () => snapshot,

    syncExternalFlags: (flags) => {
      const newStatus = resolveStatus(flags, state);
      updateState({
        status: newStatus,
        lastRecalculationCounter: flags.recalculationCounter,
      });
    },

    setStatus: (status) => {
      if (status === "READY_DOWNLOAD_OR_SENT") {
        updateState({ status, isFirstCalculation: false });
      } else {
        updateState({ status });
      }
    },

    setDocuments: (documents: SampleDocument[]) => {
      updateState({ documents });
    },

    reset: () => {
      state = {
        status: "DRAFT_INCOMPLETE",
        lastRecalculationCounter: 0,
        isFirstCalculation: true,
        documents: [],
      };
      snapshot = { ...state }; // Обновляем снимок
      emit();
    },
  };

  return store;
};

const policyStore = createPolicyStore();

export const usePolicyStore = () => {
  return useSyncExternalStore(
    policyStore.subscribe,
    policyStore.getSnapshot,
    policyStore.getSnapshot
  );
};

export const usePolicyConfig = () => {
  // usePolicyStore теперь возвращает данные (PolicyInternalState), 
  // а не весь стор с методами. Поэтому деструктуризация работает корректно.
  const { status } = usePolicyStore();
  return POLICY_STATUSES[status];
};