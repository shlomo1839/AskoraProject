import type { ISurvey } from '../models/Survey';
import type { ISubmission, IAnswer } from '../models/Submission';
import { getAllQuestions } from './surveyHelpers';

export function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAnswerValue(value: IAnswer['value'] | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(String).join('; ');
  }
  return String(value);
}

function slugifyTitle(title: string): string {
  // HTTP Content-Disposition must be ASCII-safe; drop non-ASCII (e.g. Hebrew).
  const slug = title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return slug || 'export';
}

export function buildCsvFilename(surveyTitle: string): string {
  return `survey-${slugifyTitle(surveyTitle)}-responses.csv`;
}

export function buildSubmissionsCsv(
  survey: ISurvey,
  submissions: ISubmission[]
): string {
  const questions = getAllQuestions(survey);
  const headers = ['submissionId', 'submittedAt', ...questions.map((q) => q.title)];

  const rows = submissions.map((submission) => {
    const answerByQuestionId = new Map(
      submission.answers.map((answer) => [answer.questionId, answer.value])
    );

    const cells = [
      submission.id,
      submission.submittedAt.toISOString(),
      ...questions.map((question) =>
        formatAnswerValue(answerByQuestionId.get(question.id))
      ),
    ];

    return cells.map(escapeCsvCell).join(',');
  });

  const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  return `\uFEFF${csv}`;
}
