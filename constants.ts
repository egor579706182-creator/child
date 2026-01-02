
import { Question, QuestionOption } from './types';

const freqOptions: QuestionOption[] = [
  { value: 1, label: "Никогда" },
  { value: 2, label: "Редко" },
  { value: 3, label: "Иногда" },
  { value: 4, label: "Часто" },
  { value: 5, label: "Постоянно" }
];

const matchOptions: QuestionOption[] = [
  { value: 1, label: "Совсем не соответствует" },
  { value: 2, label: "Плохо соответствует" },
  { value: 3, label: "Частично соответствует" },
  { value: 4, label: "В основном соответствует" },
  { value: 5, label: "Полностью соответствует" }
];

const intensityOptions: QuestionOption[] = [
  { value: 1, label: "Отсутствует" },
  { value: 2, label: "Слабо выражено" },
  { value: 3, label: "Умеренно выражено" },
  { value: 4, label: "Сильно выражено" },
  { value: 5, label: "Крайне выражено" }
];

export const QUESTIONS: Question[] = [
  { id: 1, category: 'social', text: "Проявляет ли ребенок инициативу в общении со сверстниками или взрослыми?", options: freqOptions },
  { id: 2, category: 'social', text: "Насколько стабильно ребенок поддерживает зрительный контакт?", options: [
    { value: 1, label: "Контакт отсутствует" },
    { value: 2, label: "Избегает контакта" },
    { value: 3, label: "Непостоянный контакт" },
    { value: 4, label: "Почти всегда держит" },
    { value: 5, label: "Стабильный контакт" }
  ]},
  { id: 3, category: 'verbal', text: "Соответствует ли развитие речи ребенка его хронологическому возрасту?", options: matchOptions },
  { id: 4, category: 'nonverbal', text: "Использует ли ребенок жесты (указание, махание) для коммуникации?", options: freqOptions },
  { id: 5, category: 'social', text: "Как часто ребенок откликается на свое имя?", options: freqOptions },
  { id: 6, category: 'behavioral', text: "Наличие повторяющихся движений (взмахи руками, раскачивания):", options: intensityOptions },
  { id: 7, category: 'verbal', text: "Повторение слов или фраз вне контекста (эхолалия):", options: intensityOptions },
  { id: 8, category: 'social', text: "Интерес к играм и занятиям других детей:", options: intensityOptions },
  { id: 9, category: 'nonverbal', text: "Способность проследить за указательным жестом взрослого:", options: matchOptions },
  { id: 10, category: 'verbal', text: "Использование речи для выражения просьб и эмоций:", options: matchOptions },
  { id: 11, category: 'sensory', text: "Реакция на громкие звуки или специфические текстуры:", options: intensityOptions },
  { id: 12, category: 'social', text: "Участие в сюжетно-ролевых или воображаемых играх:", options: freqOptions },
  { id: 13, category: 'social', text: "Желание показывать предметы взрослым для привлечения внимания:", options: freqOptions },
  { id: 14, category: 'nonverbal', text: "Соответствие мимики ребенка текущей ситуации:", options: matchOptions },
  { id: 15, category: 'behavioral', text: "Наличие узконаправленных и навязчивых интересов:", options: intensityOptions },
  { id: 16, category: 'verbal', text: "Степень задержки появления первых слов:", options: [
    { value: 1, label: "Задержки нет" },
    { value: 2, label: "Незначительная" },
    { value: 3, label: "Умеренная" },
    { value: 4, label: "Значительная" },
    { value: 5, label: "Речь отсутствует" }
  ]},
  { id: 17, category: 'social', text: "Соблюдение социальных границ и личного пространства:", options: matchOptions },
  { id: 18, category: 'nonverbal', text: "Использование руки взрослого как «инструмента»:", options: freqOptions },
  { id: 19, category: 'sensory', text: "Стремление к необычным сенсорным ощущениям (нюхать, облизывать):", options: freqOptions },
  { id: 20, category: 'verbal', text: "Способность поддерживать диалог и очередность реплик:", options: matchOptions },
  { id: 21, category: 'behavioral', text: "Уровень стресса при изменении привычного распорядка:", options: intensityOptions },
  { id: 22, category: 'social', text: "Степень отстраненности («ребенок в своем мире»):", options: intensityOptions },
  { id: 23, category: 'nonverbal', text: "Наличие ответной социальной улыбки:", options: freqOptions },
  { id: 24, category: 'verbal', text: "Необычность интонации или ритма речи (монотонность):", options: intensityOptions },
  { id: 25, category: 'social', text: "Проявление сочувствия или сопереживания другим людям:", options: freqOptions },
  { id: 26, category: 'behavioral', text: "Необычные способы игры с предметами (кручение колес и т.д.):", options: intensityOptions },
  { id: 27, category: 'verbal', text: "Правильность использования личных местоимений (Я/Ты):", options: matchOptions },
  { id: 28, category: 'nonverbal', text: "Использование кивка или мотания головой (Да/Нет):", options: freqOptions },
  { id: 29, category: 'sensory', text: "Порог чувствительности к боли или температуре:", options: [
    { value: 1, label: "Нормальный" },
    { value: 2, label: "Слегка снижен" },
    { value: 3, label: "Снижен" },
    { value: 4, label: "Значительно снижен" },
    { value: 5, label: "Почти не чувствует" }
  ]},
  { id: 30, category: 'social', text: "Обращение к взрослому за одобрением или для радости:", options: freqOptions }
];
