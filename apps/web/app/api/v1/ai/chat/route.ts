import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const apiBackend = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const targetUrl = `${apiBackend.replace(/\/$/, '')}/ai/chat`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { success: false, message: 'AI Gateway error from upstream service' },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[AI CHAT PROXY ERROR]:', error);
    // Graceful fallback response so the client is never broken
    return NextResponse.json(
      {
        success: true,
        answer: `### 🏥 MediNexa Healthcare Assistant\n\nThank you for reaching out. MediNexa AI is available to assist you with:\n- 📅 **[Appointment Guidance](/portal/appointments)**\n- 🏥 **Department Recommendations**\n- 💊 **Prescription Explanations**\n- 🔬 **Lab Report Guidance**\n- 🗺️ **Hospital Navigation**\n\n*Clinical Disclaimer: For urgent medical emergencies, please visit the 24/7 Emergency Department or dial 108/112.*`,
        sources: ['MediNexa Resilient Client Gateway'],
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ONLINE',
    service: 'MediNexa AI Chat Gateway Proxy',
    endpoint: '/api/v1/ai/chat',
  });
}
