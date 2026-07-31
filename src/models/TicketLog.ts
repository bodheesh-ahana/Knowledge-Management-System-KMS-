import mongoose, { Schema } from 'mongoose';

export interface ITicketLog {
  _id: string;
  account: string;
  requestId: string;
  status: string;
  requestType: string;
  category: string;
  technician: string;
  subject: string;
  requester: string;
  createdTime?: Date | null;
  respondedDate?: Date | null;
  responseDueByTime?: Date | null;
  resolvedTime?: Date | null;
  slaResolutionTime?: string;
  slaResponseTime?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ticketLogSchema = new Schema<ITicketLog>(
  {
    account: { type: String, default: 'Numera' },
    requestId: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true, index: true },
    requestType: { type: String, index: true },
    category: { type: String, index: true },
    technician: { type: String, index: true },
    subject: { type: String, required: true },
    requester: { type: String },
    createdTime: { type: Date },
    respondedDate: { type: Date, default: null },
    responseDueByTime: { type: Date, default: null },
    resolvedTime: { type: Date, default: null },
    slaResolutionTime: { type: String },
    slaResponseTime: { type: String },
    source: { type: String },
  },
  {
    timestamps: true,
  }
);

ticketLogSchema.index({ status: 1, requestType: 1 });
ticketLogSchema.index({ subject: 'text', requester: 'text', technician: 'text' });

if (mongoose.models.TicketLog) {
  delete mongoose.models.TicketLog;
}

export const TicketLog = mongoose.model<ITicketLog>('TicketLog', ticketLogSchema);
