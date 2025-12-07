/**
 * Questions for Presenter Questions Screen
 * These questions are displayed on the projector during the Hanukkah event.
 * Answers are revealed by admin command via Socket.IO.
 */

export interface Question {
  id: number;
  text: string;
  answer: number;
}

export const QUESTIONS: readonly Question[] = [
  {
    id: 1,
    text: 'Сумма цифр числа свечей, которые зажигают на Хануку',
    answer: 8,
  },
  {
    id: 2,
    text: 'Гематрия второй буквы, написанной на севивоне (волчке)',
    answer: 3,
  },
  {
    id: 3,
    text: 'Количество свечей, которые зажигают в шестой день',
    answer: 7,
  },
  {
    id: 4,
    text: 'Число сыновей Матитьягу',
    answer: 5,
  },
] as const;





