import { AppError } from '../middleware/error.middleware';
import type { ISection } from '../models/Survey';

interface SurveyInput {
  title?: string;
  description?: string;
  sections?: ISection[];
  questions?: unknown;
}

export function validateSurveyInput(input: SurveyInput): {
  title: string;
  description: string;
  sections: ISection[];
} {
  if (input.questions !== undefined) {
    throw new AppError(400, 'פורמט לא נתמך: יש לשלוח שאלות בתוך קטעים (sections) בלבד');
  }

  const title = input.title?.trim() ?? '';
  const description = input.description?.trim() ?? '';
  const sections = input.sections ?? [];

  if (!title) {
    throw new AppError(400, 'יש להזין כותרת לסקר');
  }

  if (sections.length === 0) {
    throw new AppError(400, 'יש להוסיף לפחות קטע אחד');
  }

  for (const section of sections) {
    if (!section.title?.trim()) {
      throw new AppError(400, 'יש להזין כותרת לכל קטע');
    }

    if (!section.questions || section.questions.length === 0) {
      throw new AppError(400, 'יש להוסיף לפחות שאלה אחת לכל קטע');
    }

    for (const question of section.questions) {
      if (!question.title?.trim()) {
        throw new AppError(400, 'יש למלא את נוסח כל השאלות');
      }

      if (
        question.type === 'multiple-choice' &&
        (question.options ?? []).some((option) => !option.trim())
      ) {
        throw new AppError(400, 'יש למלא את כל אפשרויות הבחירה');
      }
    }
  }

  return { title, description, sections };
}
