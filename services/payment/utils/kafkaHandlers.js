const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { publishMessage } = require('./kafka');
const { profileInfo, insertTransactionQuery } = require("../database/db");

// Kafka message handlers
async function handleSlotRegistered(message) {
    const { 
        slotId, 
        userId, 
        vehicleId, 
        garageId, 
        price, 
        reservationId
    } = message;

    try {
        const user = await profileInfo(userId);

        // stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
            client_reference_id: reservationId,
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        unit_amount: Math.round(price * 100),
                        product_data: {
                            name: `Parking Reservation - Slot ${slotId}`,
                            description: `Reservation for Vehicle ID: ${vehicleId} at Garage ${garageId}`
                        }
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                reservationId,
                slotId,
                vehicleId,
                garageId,
                userId
            }
        });

        const transactionValues = [
            userId, 
            price, 
            'INR', 
            'pending', 
            reservationId,
            session.id,
            slotId,
            vehicleId,
            garageId
        ];

        const slotTransactionId = await insertTransactionQuery(transactionValues);

        // await publishMessage('PAYMENT_INITIATED', {
        //     slotTransactionId,
        //     stripeCheckoutSessionId: session.id,
        //     checkoutUrl: session.url,
        //     amount: price,
        //     userId,
        //     reservationId
        // });

        return { 
            slotTransactionId, 
            stripeCheckoutSessionId: session.id,
            checkoutUrl: session.url
        };
    } catch (error) {
        console.error('Error creating Stripe Checkout Session:', error);
        
        // await publishMessage('PAYMENT_ERROR', {
        //     error: error.message,
        //     reservationId: message.reservationId
        // });
        throw error;
    }
}

module.exports = { handleSlotRegistered };