import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const renderUrl = process.env.WHATSAPP_API_URL?.trim().replace(/\/$/, "");
    const apiKey = process.env.WHATSAPP_API_KEY?.trim();
    const instanceName = process.env.WHATSAPP_INSTANCE_NAME || 'ResenhaBot';

    if (!renderUrl || !apiKey) {
      return NextResponse.json({ connected: false });
    }

    const res = await fetch(`${renderUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': apiKey }
    });

    if (!res.ok) {
        return NextResponse.json({ connected: false });
    }

    const data = await res.json();
    
    // Na Evolution API, o state pode vir como "open", "connecting", "close" 
    // Mapeamos open para true.
    if (data && data.instance && data.instance.state === 'open') {
      return NextResponse.json({ connected: true });
    }

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error("Erro ao checar status de conexão:", error);
    return NextResponse.json({ connected: false });
  }
}
