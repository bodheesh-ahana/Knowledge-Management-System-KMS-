import mongoose, { Schema, Document } from 'mongoose';

export interface IManualTicket extends Document {
  serialNumber: number;
  ticketId: string;
  month: string;
  resolvedByOurTeam: string;
  reassignedToOtherTeams: string;
  escalatedToOEM: string;
  slaBreach: string;
  reason: string;
  createdDate: Date;
  resolvedDate: Date;
  averageResolutionTime: string;
}

const ManualTicketSchema = new Schema<IManualTicket>(
  {
    serialNumber: { type: Number, required: true },
    ticketId: { type: String, required: true },
    month: { type: String, required: true },
    resolvedByOurTeam: { type: String, default: '' },
    reassignedToOtherTeams: { type: String, default: '' },
    escalatedToOEM: { type: String, default: '' },
    slaBreach: { type: String, default: '' },
    reason: { type: String, default: '' },
    createdDate: { type: Date, default: null },
    resolvedDate: { type: Date, default: null },
    averageResolutionTime: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const ManualTicket = mongoose.models.ManualTicket || mongoose.model<IManualTicket>('ManualTicket', ManualTicketSchema);
