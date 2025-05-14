{
  "tabs": [
    {
      "id": "consultation",
      "label": "Нужна консультация",
      "fields": [
        {
          "type": "text",
          "name": "name",
          "label": "Имя",
          "required": true
        },
        {
          "type": "text",
          "name": "question",
          "label": "Ваш вопрос",
          "required": true
        },
        {
          "type": "submit",
          "label": "Отправить заказ"
        }
      ]
    },
    {
      "id": "entrepreneur",
      "label": "Зарегистрируйте ИП или станьте самозанятым",
      "fields": [
        {
          "type": "radio",
          "name": "registration_type",
          "label": "Муниципальный программный код:",
          "options": [
            {
              "value": "ip",
              "label": "Зарегистрировать ИП"
            },
            {
              "value": "selfemployed",
              "label": "Самозанятым"
            },
            {
              "value": "support",
              "label": "Способствовать"
            }
          ],
          "required": true
        },
        {
          "type": "text",
          "name": "full_name",
          "label": "ФИО",
          "required": true
        },
        {
          "type": "submit",
          "label": "Отправить заявку"
        }
      ]
    }
  ]
}