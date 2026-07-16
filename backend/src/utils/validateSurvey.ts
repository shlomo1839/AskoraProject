import { AppError } from '../middleware/error.middleware';
import type { ISection } from '../models/Survey';

interface SurveyInput {
  title?: string;
  description?: string;
  sections?: ISection[];
  questions?: unknown;
  closesAt?: string | null;
}

export function validateSurveyInput(input: SurveyInput): {
  title: string;
  description: string;
  sections: ISection[];
  closesAt: Date | null;
} {
  if (input.questions !== undefined) {
    throw new AppError(400, 'פורמט לא נתמך: יש לשלוח שאלות בתוך קטעים (sections) בלבד');
  }

  const title = input.title?.trim() ?? '';
  const description = input.description?.trim() ?? '';
  const sections = input.sections ?? [];

  let closesAt: Date | null = null;
  if (input.closesAt != null && input.closesAt !== '') {
    const parsed = new Date(input.closesAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError(400, 'תאריך סגירת הסקר אינו תקין');
    }
    closesAt = parsed;
  }

  if (!title) {
    throw new AppError(400, 'יש להזין כותרת לסקר');
  }

  if (sections.length === 0) {
    throw new AppError(400, 'יש להוסיף לפחות קטע אחד');
  }

  const seenQuestionIds = new Set<string>();

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

      if (question.dependsOn) {
        if (!question.dependsOn.questionId) {
          throw new AppError(400, 'התניה חסרה מזהה שאלה קודמת');
        }
        if (!seenQuestionIds.has(question.dependsOn.questionId)) {
          throw new AppError(400, 'שאלה לא יכולה להיות תלויה בעצמה או בשאלה שמופיעה אחריה');
        }
        if (!question.dependsOn.value) {
          throw new AppError(400, 'יש להגדיר ערך לתנאי התצוגה');
        }
      }

      seenQuestionIds.add(question.id);
    }
  }

  return { title, description, sections, closesAt };
}
