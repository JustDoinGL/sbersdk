// Функция для парсинга даты в формате DD.MM.YYYY
const parseCustomDate = (dateString) => {
  if (!dateString) return new Date(0); // Возвращаем минимальную дату если пусто
  
  const parts = dateString.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Месяцы в JS: 0-11
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return new Date(0); // Если формат неправильный
};

// Для даты окончания
{
  title: <TableHeader title={"Дата окончания"} />,
  dataIndex: "end_date",
  key: "end_date",
  width: 150,
  ellipsis: true,
  sorter: (a, b) => {
    const dateA = parseCustomDate(a.end_date).getTime();
    const dateB = parseCustomDate(b.end_date).getTime();
    return dateB - dateA; // По убыванию (новые даты first)
  },
  sortOrder: sorter?.column === "end_date" ? sorter.order : null,
},

// Для даты начала (если нужно)
{
  title: <TableHeader title={"Дата начала"} />,
  dataIndex: "start_date", 
  key: "start_date",
  width: 150,
  ellipsis: true,
  sorter: (a, b) => {
    const dateA = parseCustomDate(a.start_date).getTime();
    const dateB = parseCustomDate(b.start_date).getTime();
    return dateB - dateA;
  },
  sortOrder: sorter?.column === "start_date" ? sorter.order : null,
},

// Для филиала (stage)
{
  title: <TableHeader title={"Филиал"} />,
  dataIndex: "stage",
  key: "stage",
  width: 150,
  ellipsis: true,
  sorter: (a, b) => {
    const stageA = a.stage?.toString() || '';
    const stageB = b.st