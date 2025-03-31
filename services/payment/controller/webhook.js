const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { updateTransaction, updateTransactionToFail } = require('../database/db');
const { publishMessage } = require('../utils/kafka');

async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            try {
                // Update transaction status
                transaction = await updateTransaction(session.payment_intent, session.id);

                // Publish successful payment message to Kafka
                await publishMessage('PAYMENT_COMPLETED', {
                    transactionId: transaction.id,
                    reservationId: transaction.reservation_id,
                    userId: transaction.user_id
                });
            } catch (error) {
                console.error('Error processing successful payment:', error);
            }
            break;

        case 'checkout.session.async_payment_failed':
            const failedSession = event.data.object;
            
            try {
                // Update transaction status to failed
                await updateTransactionToFail(JSON.stringify(failedSession), failedSession.id);

                // Publish payment failure message to Kafka
                await publishMessage('PAYMENT_FAILED', {
                    stripeCheckoutSessionId: failedSession.id,
                    reservationId: failedSession.client_reference_id
                });
            } catch (error) {
                console.error('Error processing failed payment:', error);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({message: "Payment Succesful"});
}

module.exports = { handleStripeWebhook };