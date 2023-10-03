import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISong extends Document {
    title: string;
    author: string;
    link: string;
}

const songSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

const SongModel: Model<ISong> = mongoose.model<ISong>('Song', songSchema);

export default SongModel;
