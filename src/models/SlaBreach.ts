import mongoose, { Schema } from 'mongoose';

export interface ISlaBreach {
  _id: string;
  requestId: string;
  subject: string;
  requester: string;
  assignedTo: string;
  dueByDate?: Date | null;
  status: string;
  createdDate?: Date | null;
  site?: string;
  priority?: string;
  group?: string;
  account?: string;
  createdAt: Date;
  updatedAt: Date;
}

const slaBreachSchema = new Schema<ISlaBreach>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    requester: { type: String },
    assignedTo: { type: String },
    dueByDate: { type: Date, default: null },
    status: { type: String },
    createdDate: { type: Date, index: true },
    site: { type: String },
    priority: { type: String },
    group: { type: String },
    account: { type: String, default: 'Numera' },
  },
  { timestamps: true }
);

if (mongoose.models.SlaBreach) {
  delete mongoose.models.SlaBreach;
}

export const SlaBreach = mongoose.model<ISlaBreach>('SlaBreach', slaBreachSchema);
