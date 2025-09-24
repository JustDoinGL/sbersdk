const columns = [
    {
        title: 'Номер',
        dataIndex: 'number',
        key: 'number',
        sorter: (a, b) => b.number.localeCompare(a.number), // Z-A
    },
    {
        title: 'Продукт',
        dataIndex: 'product',
        key: 'product',
        sorter: (a, b) => b.product.localeCompare(a.product), // Z-A
    },
    {
        title: 'Премия',
        dataIndex: 'premium',
        key: 'premium',
        sorter: (a, b) => {
            const numA = parseFloat(a.premium.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const numB = parseFloat(b.premium.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            return numB - numA; // от большей к меньшей
        },
    },
    {
        title: 'Дата начала',
        dataIndex: 'startDate',
        key: 'startDate',
        sorter: (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(), // от новых к старым
    },
    {
        title: 'Дата окончания',
        dataIndex: 'endDate',
        key: 'endDate',
        sorter: (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(), // от новых к старым
    },
    {
        title: 'Филиал',
        dataIndex: 'branch',
        key: 'branch',
        sorter: (a, b) => b.branch.localeCompare(a.branch), // Z-A
    },
    {
        title: 'Заявленные убытки',
        dataIndex: 'declaredLoss',
        key: 'declaredLoss',
        sorter: (a, b) => {
            const numA = parseFloat(a.declaredLoss.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const numB = parseFloat(b.declaredLoss.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            return numB - numA; // от большей к меньшей
        },
    },
    {
        title: 'Оплаченные убытки',
        dataIndex: 'paidLoss',
        key: 'paidLoss',
        sorter: (a, b) => {
            const numA = parseFloat(a.paidLoss.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const numB = parseFloat(b.paidLoss.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            return numB - numA; // от большей к меньшей
        },
    },
    {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        sorter: (a, b) => b.status.localeCompare(a.status), // Z-A
    },
    {
        title: 'Менеджер',
        dataIndex: 'manager',
        key: 'manager',
        sorter: (a, b) => b.manager.localeCompare(a.manager), // Z-A
    }
];