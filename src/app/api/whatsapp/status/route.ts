import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const renderUrl = process.env.WHATSAPP_API_URL?.trim().replace(/\/$/, "");
    const apiKey = process.env.WHATSAPP_API_KEY?.trim();
    const instanceName = process.env.WHATSAPP_INSTANCE_NAME || 'ResenhaBot';

    if (!renderUrl || !apiKey) {
      return NextResponse.json({ connected: false });
    }

    const res = await fetch(`${renderUrl}/instance/fetchInstances?instanceName=${instanceName}`, {
      method: 'GET',
      headers: { 'apikey': apiKey }
    });

    if (!res.ok) {
        return NextResponse.json({ connected: false });
    }

    const data = await res.json();
    
    // fetchInstances retorna um array
    const instance = Array.isArray(data) ? data.find((i: any) => i.name === instanceName) : null;
    
    if (instance && instance.connectionStatus === 'open') {
      let number = null;
      if (instance.ownerJid) {
        number = instance.ownerJid.split('@')[0];
      }
      return NextResponse.json({ 
        connected: true, 
        number: number,
        state: instance.connectionStatus 
      });
    }

    return NextResponse.json({ connected: false, state: instance?.connectionStatus || 'close' });
  } catch (error) {
    console.error("Erro ao checar status de conexão:", error);
    return NextResponse.json({ connected: false });
  }
}
