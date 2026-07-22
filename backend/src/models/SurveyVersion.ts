import mongoose, { Schema, type Document } from 'mongoose';
import type { ISection } from './Survey';

export interface ISurveyVersion extends Document {
  surveyId: string;
  version: number;
  title: string;
  description: string;
  sections: ISection[];
  createdBy: string;
  createdAt: Date;
  closesAt?: Date | null;
}

const surveyVersionSchema = new Schema<ISurveyVersion>(
  {
    surveyId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    // We can reuse the shape of sections without the exact schema from Survey if we want,
    // but Mongoose allows passing mixed types for historical data or using the same schema.
    // We'll just use Schema.Types.Mixed for flexibility in historical versions,
    // or better yet, define it exactly. Let's use Mixed to avoid schema drift breaking history.
    sections: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: String, required: true },
    closesAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure we don't have duplicate versions for the same survey
surveyVersionSchema.index({ surveyId: 1, version: 1 }, { unique: true });

export const SurveyVersion = mongoose.model<ISurveyVersion>('SurveyVersion', surveyVersionSchema);

export function toPublicSurveyVersion(surveyVersion: ISurveyVersion) {
  return {
    surveyId: surveyVersion.surveyId,
    version: surveyVersion.version,
    title: surveyVersion.title,
    description: surveyVersion.description,
    sections: surveyVersion.sections,
    createdBy: surveyVersion.createdBy,
    createdAt: surveyVersion.createdAt.toISOString(),
    closesAt: surveyVersion.closesAt ? surveyVersion.closesAt.toISOString() : null,
  };
}
