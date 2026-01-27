Вот названия полей для Zod схемы на основе данных формы:

Страхователь (PolicyHolder):

1. program — Выбор программы
2. fullName — ФИО
3. birthDate — Дата рождения
4. gender — Пол
5. isResident — Резидент РФ
6. documentType — Тип документа
7. departmentCode — Код подразделения
8. passportSeries — Серия паспорта
9. passportNumber — Номер паспорта
10. issueDate — Дата выдачи
11. registrationAddress — Адрес регистрации
12. issuedBy — Кем выдан
13. email — Электронная почта
14. phone — Телефон
15. isMainEmail — Основной email
16. isMainPhone — Основной телефон
17. isSameAsInsured — Страхователь и Застрахованный — одно лицо

Застрахованный (InsuredPerson):

1. fullName — ФИО
2. birthDate — Дата рождения
3. gender — Пол
4. isResident — Резидент

Все поля соответствуют структуре формы и могут быть использованы для валидации с помощью Zod.