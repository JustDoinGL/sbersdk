
const actStatusChoice = (): { value: string; label: string }[] => {
  const { 
    roleConfig: { excluderds = [] } 
  } = currentConfig;
  
  const nameMap = new Map<string, number[]>();

  Object.values(actStatus).forEach(({ name, id }: { name: string; id: number }) => {
    if (!name) return;
    
    // Пропускаем исключенные ID
    if (excluderds.includes(id)) return;
    
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name)!.push(id);
  });

  return Array.from(nameMap.entries())
    .map(([name, ids]) => ({
      value: ids.sort((a, b) => a - b).join(","),
      label: name,
    }));
};