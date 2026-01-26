/**
 * Script de Verificação de Produção
 * 
 * Verifica se todas as configurações necessárias estão presentes
 * antes de fazer deploy em produção.
 * 
 * Uso: node scripts/verify-production.js
 */

const requiredEnvVars = {
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': 'URL do Supabase',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Chave pública do Supabase',
  'DATABASE_URL': 'Connection string do banco',
  
  // Stripe (produção)
  'STRIPE_SECRET_KEY': 'Chave secreta do Stripe (deve começar com sk_live_)',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Chave pública do Stripe (deve começar com pk_live_)',
  'STRIPE_WEBHOOK_SECRET': 'Secret do webhook do Stripe',
  
  // Gemini AI
  'GEMINI_API_KEY': 'Chave da API Gemini',
  
  // App
  'NEXT_PUBLIC_APP_URL': 'URL da aplicação em produção',
};

console.log('🔍 Verificando configurações de produção...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar variáveis obrigatórias
Object.entries(requiredEnvVars).forEach(([key, description]) => {
  const value = process.env[key];
  
  if (!value) {
    console.error(`❌ ${key} não está configurada (${description})`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key} configurada`);
    
    // Validações específicas
    if (key === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_live_')) {
      console.warn(`⚠️  ${key} não é uma chave de produção (deveria começar com sk_live_)`);
      hasWarnings = true;
    }
    
    if (key === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' && !value.startsWith('pk_live_')) {
      console.warn(`⚠️  ${key} não é uma chave de produção (deveria começar com pk_live_)`);
      hasWarnings = true;
    }
    
    if (key === 'NEXT_PUBLIC_APP_URL' && value.includes('localhost')) {
      console.warn(`⚠️  ${key} ainda aponta para localhost`);
      hasWarnings = true;
    }
    
    if (key === 'DATABASE_URL' && !value.includes('sslmode=require')) {
      console.warn(`⚠️  ${key} deveria incluir ?sslmode=require para produção`);
      hasWarnings = true;
    }
  }
});

console.log('\n---\n');

if (hasErrors) {
  console.error('❌ Há variáveis obrigatórias faltando. Configure-as antes de fazer deploy.');
  process.exit(1);
}

if (hasWarnings) {
  console.warn('⚠️  Há avisos. Revise as configurações antes de fazer deploy em produção.');
  process.exit(0);
}

console.log('✅ Todas as configurações estão OK para produção!');
process.exit(0);
