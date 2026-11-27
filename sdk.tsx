const createPolicyStore = (): PolicyStore => {
  // Внутреннее состояние (используется для логики)
  let state: PolicyInternalState = {
    status: "DRAFT_INCOMPLETE",
    lastRecalculationCounter: 0,
    isFirstCalculation: true,
    documents: [],
  };

  // Слушатели для useSyncExternalStore
  const listeners = new Set<() => void>();
  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  // Снимок (Snapshot) - именно его будет читать React. 
  // Важно: он должен быть неизменяемым и обновляться новым объектом при каждом изменении.
  let snapshot: PolicyStore;

  // Вспомогательная функция для обновления состояния и создания нового снимка
  const updateState = (newState: Partial<PolicyInternalState>) => {
    state = { ...state, ...newState };
    
    // Создаем НОВЫЙ объект для снимка, чтобы React увидел изменение ссылки
    snapshot = {
      ...snapshot,
      ...newState,
    };
    
    emit();
  };

  // Создаем стор
  const store: PolicyStore = {
    // В PolicyStore должны быть методы и состояние. 
    // Инициализируем начальными данными.
    ...state,

    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    // Возвращаем снимок, а не сам стор
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
      // Сбрасываем внутреннее состояние
      state = {
        status: "DRAFT_INCOMPLETE",
        lastRecalculationCounter: 0,
        isFirstCalculation: true,
        documents: [],
      };
      
      // Принудительно создаем новый снимок с методами
      snapshot = {
        ...store,
        ...state,
      };
      
      emit();
    },
  };

  // Инициализируем снимок при первом создании стора
  snapshot = { ...store };

  return store;
};

const policyStore = createPolicyStore();

export const usePolicyStore = () => {
  return useSyncExternalStore(
    policyStore.subscribe,
    policyStore.getSnapshot,
    policyStore.getSnapshot // Третий аргумент для SSR (серверного рендеринга)
  );
};

export const usePolicyConfig = () => {
  const { status } = usePolicyStore();
  return POLICY_STATUSES[status];
};