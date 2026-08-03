import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVIPUser extends Document {
  name: string;
  company: string;
  priority: 'P1' | 'P2' | 'P3';
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VIPUserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      default: 'Numera VIP Client',
    },
    priority: {
      type: String,
      required: true,
      enum: ['P1', 'P2', 'P3'],
      default: 'P1',
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
VIPUserSchema.index({ name: 'text', company: 'text', notes: 'text' });

const VIPUser: Model<IVIPUser> = mongoose.models.VIPUser || mongoose.model<IVIPUser>('VIPUser', VIPUserSchema);

export default VIPUser;
export { VIPUser };
