import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') as string;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Payment succeeded for session:', session.id);
    
    // Retrieve the full session with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });
    
    // Send notification email to staff
    try {
      const staffEmail = process.env.STAFF_EMAIL || 'carlosarangovelasquez@gmail.com';
      const result = await resend.emails.send({
        from: 'Brisbane 3D Printing <onboarding@resend.dev>',
        to: staffEmail,
        subject: `Payment Confirmed: ${session.id} - ${session.customer_details?.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Payment Confirmed - Ready to Print</h1>
            
            <p>A payment has been successfully processed via Stripe webhook.</p>
            
            <h2>Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${session.customer_details?.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${session.customer_details?.email || 'N/A'}</td>
              </tr>
            </table>
            
            <h2>Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Order ID:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${session.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$${((session.amount_total || 0) / 100).toFixed(2)} ${session.currency?.toUpperCase()}</td>
              </tr>
              ${session.metadata?.modelName ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Model:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${session.metadata.modelName}</td>
              </tr>
              ` : ''}
              ${session.metadata?.material ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Material:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${session.metadata.material}</td>
              </tr>
              ` : ''}
            </table>
            
            <p style="margin-top: 30px; padding: 10px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <strong>Note:</strong> The 3D model file should have been sent in a separate email during checkout. 
              If you haven't received it, please check with the customer.
            </p>
          </div>
        `,
      });
      console.log('Webhook payment confirmation email sent successfully:', result);
    } catch (error) {
      console.error('Failed to send webhook notification email:', error);
      // Log more details about the error
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        staffEmail: staffEmail
      });
    }
  }

  return NextResponse.json({ received: true });
} 