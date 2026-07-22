import mongoose, { Schema, type Document } from 'mongoose';

export type QuestionType = 'open' | 'multiple-choice' | 'rating';

export interface ICondition {
  questionId: string;
  value: string;
}

export interface IQuestion {
  id: string;
  type: QuestionType;
  title: string;
  options?: string[];
  isRequired: boolean;
  dependsOn?: ICondition | null;
}

export interface ISection {
  id: string;
  title: string;
  description: string;
  questions: IQuestion[];
}

export interface ISurvey extends Document {
  id: string;
  version: number;
  title: string;
  description: string;
  sections: ISection[];
  createdBy: string;
  createdAt: Date;
  closesAt?: Date | null;
}

const conditionSchema = new Schema<ICondition>(
  {
    questionId: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ['open', 'multiple-choice', 'rating'] },
    title: { type: String, required: true, trim: true },
    options: [{ type: String, trim: true }],
    isRequired: { type: Boolean, required: true },
    dependsOn: { type: conditionSchema, required: false, default: null },
  },
  { _id: false }
);

const sectionSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false }
);

const surveySchema = new Schema<ISurvey>(
  {
    id: { type: String, required: true, unique: true },
    version: { type: Number, required: true, default: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    sections: { type: [sectionSchema], required: true },
    createdBy: { type: String, required: true, index: true },
    // Optional deadline. When null, the survey never closes automatically.
    closesAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Survey = mongoose.model<ISurvey>('Survey', surveySchema);

export function toPublicSurvey(survey: ISurvey) {
  return {
    id: survey.id,
    version: survey.version,
    title: survey.title,
    description: survey.description,
    sections: survey.sections,
    createdBy: survey.createdBy,
    createdAt: survey.createdAt.toISOString(),
    closesAt: survey.closesAt ? survey.closesAt.toISOString() : null,
  };
}
