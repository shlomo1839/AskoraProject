import type { ISection, IQuestion } from '../models/Survey';

/**
 * // Clones survey sections with new IDs and updates question dependencies
 */
export function cloneSurveySections(sections: ISection[]): ISection[] {
  const questionIdMap = new Map<string, string>();

  for (const section of sections) {
    for (const question of section.questions) {
      questionIdMap.set(question.id, crypto.randomUUID());
    }
  }

  return sections.map((section) => ({
    id: crypto.randomUUID(),
    title: section.title,
    description: section.description,
    questions: section.questions.map((question): IQuestion => {
      const dependsOn = question.dependsOn
        ? {
            questionId: questionIdMap.get(question.dependsOn.questionId) ?? question.dependsOn.questionId,
            value: question.dependsOn.value,
          }
        : null;

      return {
        id: questionIdMap.get(question.id) ?? crypto.randomUUID(),
        type: question.type,
        title: question.title,
        options: question.options ? [...question.options] : undefined,
        isRequired: question.isRequired,
        dependsOn,
      };
    }),
  }));
}
