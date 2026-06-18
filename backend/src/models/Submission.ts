import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAnswer {
  questionId: string;
  value: string | number | string[] | Types.Array<string | number>;
}

export interface ISubmission extends Document {
  id: string;
  surveyId: string;
  answers: IAnswer[];
  submittedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const submissionSchema = new Schema<ISubmission>(
  {
    id: { type: String, required: true, unique: true },
    surveyId: { type: String, required: true, index: true },
    answers: { type: [answerSchema], required: true },
    submittedAt: { type: Date, required: true },
  },
  {
    timestamps: false,
  }
);

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

export function toPublicSubmission(submission: ISubmission) {
  return {
    id: submission.id,
    surveyId: submission.surveyId,
    answers: submission.answers,
    submittedAt: submission.submittedAt.toISOString(),
  };
}
