import { useState } from 'react';

// Тип для способа подписания (альтернативный)
type SigningOption = 'PEP' | 'inPerson' | 'remote' | 'scan';

// Первый useState
const [signingOption, setSigningOption] = useState<SigningOption>('PEP');

// Функции изменения
const selectPEP = () => setSigningOption('PEP');
const selectInPerson = () => setSigningOption('inPerson');
const selectRemote = () => setSigningOption('remote');
const selectScan = () => setSigningOption('scan');

// Второй useState для отслеживания выбранного документа
const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

// Функции изменения
const handleSelectDocument = (id: string) => setSelectedDocumentId(id);
const handleClearSelectedDocument = () => setSelectedDocumentId(null);