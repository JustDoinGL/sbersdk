const [openFirstLevel, setOpenFirstLevel] = useState<number[]>([]);
  const [openSecondLevel, setOpenSecondLevel] = useState<number[]>([]);

  const handleFirstLevelClick = (id: number): void => {
    setOpenFirstLevel(prev =>
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSecondLevelClick = (id: number): void => {
    setOpenSecondLevel(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
