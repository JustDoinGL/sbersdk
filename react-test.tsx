
import { useSyncExternalStore } from "react";

// ==========================================
// TYPES
// ==========================================

type PolicyInternalState = {
  status: PolicyStatus;
  lastRecalculationCounter: number;
  isFirstCalculation: boolean;
  documents: SampleDocument[];
};

// Все методы стора
type PolicyStoreActions = {
  syncExternalFlags: (flags: ExternalFlags) => void;
  setStatus: (status: PolicyStatus) => void;
  setDocuments: (documents: SampleDocument[]) => void;
  reset: () => void;
};

// API самого хранилища
type PolicyStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PolicyInternalState;
  actions: PolicyStoreActions;
};

// То, что возвращает React Hook
type PolicyStoreResult = PolicyInternalState & PolicyStoreActions;


// ==========================================
// RESOLVE STATUS
// ==========================================

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


// ==========================================
// CREATE POLICY STORE
// ==========================================

const createPolicyStore = (): PolicyStore => {

  // Internal state
  let state: PolicyInternalState = {
    status: "DRAFT_INCOMPLETE",
    lastRecalculationCounter: 0,
    isFirstCalculation: true,
    documents: [],
  };

  // Listeners
  const listeners = new Set<() => void>();

  // Notify subscribers
  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  // Subscribe
  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  // Get current snapshot
  const getSnapshot = (): PolicyInternalState => state;

  // Centralized state update
  const updateState = (
    updater: (
      prev: PolicyInternalState
    ) => PolicyInternalState
  ) => {
    state = updater(state);
    emit();
  };


  // ========================================
  // ACTIONS
  // ========================================

  const actions: PolicyStoreActions = {

    // Synchronize external flags
    syncExternalFlags: (flags) => {
      updateState((prev) => ({
        ...prev,
        status: resolveStatus(flags, prev),
        lastRecalculationCounter:
          flags.recalculationCounter,
      }));
    },

    // Set status
    setStatus: (status) => {
      updateState((prev) => ({
        ...prev,
        status,
        ...(status === "READY_DOWNLOAD_OR_SENT"
          ? { isFirstCalculation: false }
          : {}),
      }));
    },

    // Set documents
    setDocuments: (documents) => {
      updateState((prev) => ({
        ...prev,
        documents,
      }));
    },

    // Reset store
    reset: () => {
      updateState(() => ({
        status: "DRAFT_INCOMPLETE",
        lastRecalculationCounter: 0,
        isFirstCalculation: true,
        documents: [],
      }));
    },
  };


  // Return store
  return {
    subscribe,
    getSnapshot,
    actions,
  };
};


// ==========================================
// POLICY STORE INSTANCE
// ==========================================

const policyStore = createPolicyStore();


// ==========================================
// USE POLICY STORE
// ==========================================

export const usePolicyStore = (): PolicyStoreResult => {

  const state = useSyncExternalStore(
    policyStore.subscribe,
    policyStore.getSnapshot,
    policyStore.getSnapshot
  );

  return {
    ...state,
    ...policyStore.actions,
  };
};


// ==========================================
// USE POLICY CONFIG
// ==========================================

export const usePolicyConfig = () => {
  const { status } = usePolicyStore();

  return POLICY_STATUSES[status];
};
