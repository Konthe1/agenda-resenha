import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server-admin'; // Precisamos de um client admin pra burlar o RLS na atualização

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. O webhook do Mercado Pago tem vários tipos de ação, 
    // nos focaremos no action "payment.created" ou "subscription.authorized"
    if (body.type === 'payment' || body.action === 'payment.created') {
      const paymentId = body.data.id;
      
      // Busca dados completos do pagamento na API do MP
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      
      const paymentInfo = await mpResponse.json();
      
      if (paymentInfo.status === 'approved') {
        const barbeariaId = paymentInfo.external_reference; 
        
        if (barbeariaId) {
          console.log(`[Webhook] Pagamento aprovado para a Barbearia ID: ${barbeariaId}`);
          
          // Libera/Renova o acesso da barbearia no banco (SaaS Admin)
          const { error } = await supabaseAdmin
            .from('barbearias')
            .update({ 
              plano_ativo: 'PRO', 
              status_pagamento: 'Ativo',
              data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 dias
            })
            .eq('id', barbeariaId);
            
          if (error) {
            console.error('[Webhook] Erro ao atualizar barbearia:', error);
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error('Erro no Webhook do Mercado Pago:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
