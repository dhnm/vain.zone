import { Schema, model, Document } from 'mongoose';

const czSkSchema = new Schema({
  name: { type: String, unique: true, required: true },
});

export type ICzSk = Document & {
  name: string;
};

export const CzSk = model<ICzSk>('czsk', czSkSchema, 'czsk');
