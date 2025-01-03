import mongoose , {Schema}from "mongoose";

const SubscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},{
    timestamps: true
});

export const subscriptionModel = mongoose.model('Subscription', SubscriptionSchema);