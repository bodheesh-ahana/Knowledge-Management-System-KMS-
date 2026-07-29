import mongoose, { Schema } from 'mongoose';
import { ITeamMember } from '@/types';

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    joinDate: {
      type: String,
      default: '—',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

teamMemberSchema.index({ email: 1 });

// Force recompilation during hot reload so schema changes are picked up
if (mongoose.models.TeamMember) {
  delete mongoose.models.TeamMember;
}

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
