import { useState, useEffect, useCallback } from 'react';

interface TabState {
  tab: string | null;
  content: string | null;
}

const useTabs = () => {
  const [state, setState] = useState<TabState>(() => {
    const url = new URL(window.location.href);
    const tab = url.searchParams.get('tabcontent');
    const content = tab ? `Content for tab ${tab}` : null;

    return {
      tab,
      content,
    };
  });

  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const tab = url.searchParams.get('tabcontent');
      const content = tab ? `Content for tab ${tab}` : null;

      setState({
        tab,
        content,
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const setTab = useCallback((tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tabcontent', tab);

    window.history.pushState({}, '', url.toString());

    setState({
      tab,
      content: `Content for tab ${tab}`,
    });
  }, []);

  const clearTab = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('tabcontent');

    window.history.pushState({}, '', url.toString());

    setState({
      tab: null,
      content: null,
    });
  }, []);

  return {
    state,
    setTab,
    clearTab,
  };
};

export default useTabs;

import React from 'react';
import useTabs from './useTabs';

const App = () => {
  const { state, setTab, clearTab } = useTabs();

  const handleSetTab = (tab: string) => {
    setTab(tab);
  };

  const handleClearTab = () => {
    clearTab();
  };

  return (
    <div>
      <h1>Current Tab: {state.tab}</h1>
      <h2>Content:</h2>
      {state.content ? (
        <p>{state.content}</p>
      ) : (
        <p>No content available for this tab</p>
      )}
      <button onClick={() => handleSetTab('1')}>Set Tab 1</button>
      <button onClick={() => handleSetTab('2')}>Set Tab 2</button>
      <button onClick={handleClearTab}>Clear Tab</button>
    </div>
  );
};

export default App;