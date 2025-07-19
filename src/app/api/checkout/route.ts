import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

import Stripe from 'stripe';
// Use the latest API version without specifying it (Stripe will use the latest by default)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function sendOrderConfirmationEmail(customerInfo: any, orderDetails: any) {
  try {
    // Send customer confirmation email
    const result = await resend.emails.send({
      from: 'Brisbane 3D Printing <onboarding@resend.dev>', // Using Resend's test domain
      to: customerInfo.email,
      subject: 'Order Confirmation - Brisbane 3D Printing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Order Confirmation</h1>
          <p>Dear ${customerInfo.name},</p>
          <p>Thank you for your order! We've received your 3D printing request and will begin processing it shortly.</p>
          
          <h2 style="color: #1e40af;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Order Number:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Model:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Material:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.material}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Dimensions:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.dimensions.x.toFixed(1)} x ${orderDetails.modelDetails.dimensions.y.toFixed(1)} x ${orderDetails.modelDetails.dimensions.z.toFixed(1)} mm</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Weight:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.weight.toFixed(1)}g</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Print Time:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.printTime.toFixed(1)} hours</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 2px solid #1e40af;"><strong>Total Cost:</strong></td>
              <td style="padding: 8px; border-bottom: 2px solid #1e40af;"><strong>$${orderDetails.amount.toFixed(2)} AUD</strong></td>
            </tr>
          </table>
          
          <h2 style="color: #1e40af;">Shipping Address</h2>
          <p>
            ${customerInfo.address?.line1 || 'Address to be confirmed'}<br>
            ${customerInfo.address?.city || ''}, ${customerInfo.address?.state || ''} ${customerInfo.address?.postal_code || ''}<br>
            ${customerInfo.address?.country || 'Australia'}
          </p>
          
          <p style="margin-top: 30px;">We'll notify you once your print is ready. If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Brisbane 3D Printing Team</p>
        </div>
      `,
    });
    console.log('Customer confirmation email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Customer email sending failed:', error);
    // Return error details for debugging
    return { success: false, error: error };
  }
}

async function sendStaffNotificationEmail(customerInfo: any, orderDetails: any, fileBuffer: Buffer, fileName: string) {
  try {
    // Get staff email from environment variable or use a default
    const staffEmail = process.env.STAFF_EMAIL || 'carlosarangovelasquez@gmail.com'; // Replace with your email
    
    // Send staff notification with attachment
    const result = await resend.emails.send({
      from: 'Brisbane 3D Printing Orders <onboarding@resend.dev>', // Using Resend's test domain
      to: staffEmail,
      subject: `New Order: ${orderDetails.orderNumber} - ${customerInfo.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">New 3D Print Order</h1>
          
          <h2>Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${customerInfo.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${customerInfo.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Shipping Address:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                ${customerInfo.address?.line1 || 'To be collected at checkout'}<br>
                ${customerInfo.address?.city || ''}, ${customerInfo.address?.state || ''} ${customerInfo.address?.postal_code || ''}<br>
                ${customerInfo.address?.country || 'Australia'}
              </td>
            </tr>
          </table>
          
          <h2>Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Order Number:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Model File:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.name} (attached)</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Material:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.material}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Dimensions:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.dimensions.x.toFixed(1)} x ${orderDetails.modelDetails.dimensions.y.toFixed(1)} x ${orderDetails.modelDetails.dimensions.z.toFixed(1)} mm</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Volume:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.volume.toFixed(2)} cm³</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Weight:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.weight.toFixed(1)}g</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Print Time:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${orderDetails.modelDetails.printTime.toFixed(1)} hours</td>
            </tr>
            <tr style="background-color: #fef3c7;">
              <td style="padding: 8px; border-bottom: 2px solid #f59e0b;"><strong>Total Revenue:</strong></td>
              <td style="padding: 8px; border-bottom: 2px solid #f59e0b;"><strong>$${orderDetails.amount.toFixed(2)} AUD</strong></td>
            </tr>
          </table>
          
          <p style="margin-top: 30px; padding: 10px; background-color: #dbeafe; border-left: 4px solid #2563eb;">
            <strong>Action Required:</strong> Please download the attached 3D model file and begin processing this order.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: fileBuffer.toString('base64'),
        },
      ],
    });
    console.log('Staff notification email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Staff email sending failed:', error);
    // Return error details for debugging
    return { success: false, error: error };
  }
}

export async function GET(req: NextRequest) {
  try {
    // In a real implementation, we would:
    // 1. Get details from the query params or session
    // 2. Create a Stripe checkout session
    // 3. Return the session URL or ID
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      message: 'Stripe checkout session would be created here',
      mockCheckoutUrl: 'https://checkout.stripe.com/mock-session',
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { amount, productName, modelDetails, customerInfo, fileData } = body;
    
    if (!customerInfo || !customerInfo.email) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }
    
    console.log('Creating checkout session with:', { amount, productName, modelDetails, customerInfo });
    
    // Debug environment variables
    const baseUrl = process.env.NEXT_PUBLIC_URL;
    console.log('Environment check:', {
      NEXT_PUBLIC_URL: baseUrl,
      hasBaseUrl: !!baseUrl,
      NODE_ENV: process.env.NODE_ENV
    });
    
    // Construct URLs with fallback
    const successUrl = baseUrl 
      ? `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://brisbane-3d-printing-web-new.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = baseUrl 
      ? `${baseUrl}/cancel`
      : `https://brisbane-3d-printing-web-new.vercel.app/cancel`;
    
    console.log('Redirect URLs:', { successUrl, cancelUrl });
    
    // Create a checkout session with the latest API format
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: productName || '3D Printing Service',
              description: `Material: ${modelDetails.material}, Volume: ${modelDetails.volume.toFixed(2)}cm³, Weight: ${modelDetails.weight.toFixed(2)}g`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ['AU'], // Allow only Australian addresses
      },
      metadata: {
        customerName: customerInfo.name,
        modelName: modelDetails.name || 'Custom 3D Model',
        material: modelDetails.material,
        dimensions: JSON.stringify(modelDetails.dimensions),
        printTime: modelDetails.printTime,
        // Store file data in metadata if it's small enough, otherwise we'll need a different approach
        hasFile: fileData ? 'true' : 'false',
      },
    });
    
    console.log('Checkout session created:', session.id);
    
    // Send confirmation emails and capture results
    const emailResults = {
      customer: null as any,
      staff: null as any,
    };
    
    // Send customer confirmation
    emailResults.customer = await sendOrderConfirmationEmail(customerInfo, {
      orderNumber: session.id,
      amount: amount,
      product: productName,
      modelDetails: modelDetails,
      address: customerInfo.address || {}
    });
    
    // If we have file data, send staff notification with attachment
    if (fileData && fileData.content && fileData.filename) {
      const fileBuffer = Buffer.from(fileData.content, 'base64');
      emailResults.staff = await sendStaffNotificationEmail(customerInfo, {
        orderNumber: session.id,
        amount: amount,
        product: productName,
        modelDetails: modelDetails
      }, fileBuffer, fileData.filename);
    }
    
    // Log email results for debugging
    console.log('Email sending results:', emailResults);
    
    // Include email status in response for debugging
    return NextResponse.json({ 
      success: true,
      url: session.url,
      emailStatus: {
        customer: emailResults.customer?.success || false,
        staff: emailResults.staff?.success || false,
        errors: {
          customer: emailResults.customer?.error || null,
          staff: emailResults.staff?.error || null,
        }
      }
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 