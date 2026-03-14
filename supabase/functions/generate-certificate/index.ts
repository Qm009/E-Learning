import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')!
        if (!authHeader) throw new Error('Missing Authorization header')

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        const { certificate_id } = await req.json()

        // Fetch certificate with course and profile data
        const { data: cert, error: certError } = await supabase
            .from('certificates')
            .select(`
        *,
        courses:course_id (title, description),
        profiles:student_id (full_name, email)
      `)
            .eq('id', certificate_id)
            .eq('student_id', user.id)
            .single()

        if (certError || !cert) throw new Error('Certificat introuvable ou accès refusé')

        const studentName = cert.profiles?.full_name || cert.profiles?.email || 'Étudiant EduFlow'
        const courseTitle = cert.courses?.title || 'Cours'
        const issuedDate = new Date(cert.issued_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        const score = cert.score_percentage
        const certCode = cert.certificate_code

        // Generate an HTML certificate that the client can print/save as PDF
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificat EduFlow - ${certCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 40px;
    }
    .certificate {
      width: 900px;
      background: white;
      border: 12px solid #6366f1;
      padding: 60px 80px;
      text-align: center;
      position: relative;
      box-shadow: 0 25px 60px rgba(99,102,241,0.15);
    }
    .certificate::before, .certificate::after {
      content: '';
      position: absolute;
      top: 10px; left: 10px; right: 10px; bottom: 10px;
      border: 2px solid #c7d2fe;
      pointer-events: none;
    }
    .badge {
      width: 80px; height: 80px;
      background: linear-gradient(135deg, #6366f1, #818cf8);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
    }
    .badge-icon { font-size: 40px; }
    .subtitle {
      font-size: 11px; font-weight: 700; letter-spacing: 4px;
      color: #6366f1; text-transform: uppercase; margin-bottom: 16px;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 52px; font-weight: 700;
      color: #0f172a; margin-bottom: 24px;
      line-height: 1.1;
    }
    .presented-to {
      font-size: 14px; color: #64748b; margin-bottom: 8px;
      font-style: italic;
    }
    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 38px; color: #6366f1; font-weight: 700;
      margin-bottom: 24px; font-style: italic;
    }
    .description {
      font-size: 16px; color: #475569; line-height: 1.7;
      margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto;
    }
    .course-name {
      font-weight: 700; color: #0f172a;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, transparent, #c7d2fe, transparent);
      margin: 40px 0;
    }
    .meta-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 24px; margin-bottom: 40px;
    }
    .meta-item { text-align: center; }
    .meta-label {
      font-size: 10px; font-weight: 700; letter-spacing: 2px;
      color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px;
    }
    .meta-value {
      font-size: 18px; font-weight: 700; color: #0f172a;
    }
    .footer {
      display: flex; justify-content: space-between; align-items: flex-end;
    }
    .signature-block { text-align: center; }
    .signature-line {
      width: 180px; height: 1px;
      background: #e2e8f0; margin: 0 auto 8px;
    }
    .signature-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .signature-role { font-size: 11px; color: #94a3b8; }
    .qr-placeholder {
      width: 80px; height: 80px;
      border: 2px solid #e2e8f0; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #94a3b8; text-align: center;
    }
    .watermark {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 120px; font-weight: 900;
      font-family: 'Playfair Display', serif;
      color: rgba(99,102,241,0.03);
      pointer-events: none; white-space: nowrap;
    }
    @media print {
      body { background: white; padding: 0; }
      .certificate { box-shadow: none; border-width: 8px; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">EduFlow</div>
    
    <div class="badge"><div class="badge-icon">🏆</div></div>
    
    <div class="subtitle">Certificat de Réussite</div>
    
    <h1>EduFlow</h1>
    
    <p class="presented-to">Décerné avec honneur à</p>
    <div class="student-name">${studentName}</div>
    
    <p class="description">
      Pour avoir validé avec succès la formation<br>
      <span class="course-name">« ${courseTitle} »</span><br>
      avec un score exceptionnel de <strong>${score}%</strong>
    </p>

    <div class="divider"></div>

    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Score Obtenu</span>
        <div class="meta-value">${score}%</div>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date d'Obtention</span>
        <div class="meta-value">${issuedDate}</div>
      </div>
      <div class="meta-item">
        <span class="meta-label">Code Unique</span>
        <div class="meta-value" style="font-size:13px;letter-spacing:1px;">${certCode}</div>
      </div>
    </div>

    <div class="footer">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">Directeur Pédagogique</div>
        <div class="signature-role">EduFlow Academy</div>
      </div>
      <div class="qr-placeholder">
        Vérifier à<br>eduflow.app
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">Responsable Certification</div>
        <div class="signature-role">EduFlow Academy</div>
      </div>
    </div>
  </div>
</body>
</html>`

        return new Response(html, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/html; charset=utf-8',
            },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
