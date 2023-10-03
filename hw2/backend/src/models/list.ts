import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISong } from './song'; // Ensure the path is correct based on your project structure

export interface IList extends Document {
    name: string;
    songs: ISong['_id'][];
    numberOfSongs: number;
}

const listSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    songs: [{
        type: Schema.Types.ObjectId,
        ref: 'Song'
    }],
    numberOfSongs: {
        type: Number,
        default: 0
    }
});

const ListModel: Model<IList> = mongoose.model<IList>('List', listSchema);

export default ListModel;