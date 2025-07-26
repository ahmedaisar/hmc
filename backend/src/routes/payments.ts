import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/database';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createError, notFoundError } from '../middleware/errorHandler';
import { PaymentStatus, BookingStatus } from '@prisma/client';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create payment intent
router.post('/create-intent', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotel: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw notFoundError('Booking');
    }

    if (booking.userId !== req.user!.id) {
      throw createError('Not authorized to pay for this booking', 403);
    }

    if (booking.paymentStatus === PaymentStatus.COMPLETED) {
      throw createError('Booking is already paid', 400);
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        userId: req.user!.id,
        hotelName: booking.hotel.name,
      },
      description: `Booking ${booking.bookingNumber} - ${booking.hotel.name}`,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.total,
        currency: booking.currency,
        method: 'STRIPE',
        status: PaymentStatus.PENDING,
        stripePaymentId: paymentIntent.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
});

// Confirm payment
router.post('/confirm', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw createError('Payment intent not found', 404);
    }

    const bookingId = paymentIntent.metadata.bookingId;

    // Update payment status
    await prisma.payment.updateMany({
      where: {
        stripePaymentId: paymentIntentId,
      },
      data: {
        status: paymentIntent.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        gatewayResponse: paymentIntent,
      },
    });

    // Update booking status if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: BookingStatus.CONFIRMED,
          stripePaymentId: paymentIntentId,
        },
      });
    }

    res.json({
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
    });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment and booking status
        await prisma.payment.updateMany({
          where: {
            stripePaymentId: paymentIntent.id,
          },
          data: {
            status: PaymentStatus.COMPLETED,
            gatewayResponse: paymentIntent,
          },
        });

        await prisma.booking.update({
          where: { id: paymentIntent.metadata.bookingId },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            status: BookingStatus.CONFIRMED,
          },
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.updateMany({
          where: {
            stripePaymentId: failedPayment.id,
          },
          data: {
            status: PaymentStatus.FAILED,
            gatewayResponse: failedPayment,
          },
        });
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Get payment history for user
router.get('/history', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          userId: req.user!.id,
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            checkIn: true,
            checkOut: true,
            hotel: {
              select: {
                name: true,
                island: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

export default router;