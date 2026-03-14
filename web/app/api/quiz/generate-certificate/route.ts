import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { certificate_id } = body;

        // Extract the user token from the authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }
        const token = authHeader.replace('Bearer ', '');

        // Initialize Supabase Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });

        // 1. Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized', details: userError }, { status: 401 });
        }

        // 2. Fetch the certificate details along with student and course data
        const { data: certificate, error: certError } = await supabase
            .from('certificates')
            .select(`
                *,
                courses (title),
                profiles (full_name, email)
            `)
            .eq('id', certificate_id)
            .single();

        if (certError || !certificate) {
            console.error("Certificate not found:", certError);
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        // Verify ownership (or could be admin)
        if (certificate.student_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Generate HTML Content for the Certificate
        const studentName = certificate.profiles?.full_name || certificate.profiles?.email || 'Étudiant';
        const courseTitle = certificate.courses?.title || 'Cours inconnu';
        const score = certificate.score_percentage || certificate.score || 100;
        const issueDate = new Date(certificate.issued_at).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const certificateCode = certificate.certificate_code;

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Certificat de Réussite - ${studentName}</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Arial', sans-serif;
                    background-color: #f3f4f6;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .certificate {
                    width: 1000px;
                    height: 700px;
                    background-color: white;
                    padding: 40px;
                    box-sizing: border-box;
                    position: relative;
                    border: 20px solid #4f46e5;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    text-align: center;
                    background-image: radial-gradient(circle at center, #ffffff 0%, #f5f3ff 100%);
                }
                .certificate::before {
                    content: '';
                    position: absolute;
                    top: 10px; left: 10px; right: 10px; bottom: 10px;
                    border: 2px solid #c7d2fe;
                    border-radius: 5px;
                    pointer-events: none;
                }
                .header {
                    margin-bottom: 40px;
                    margin-top: 30px;
                }
                .title {
                    font-size: 50px;
                    color: #312e81;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    margin: 0 0 10px 0;
                }
                .subtitle {
                    font-size: 20px;
                    color: #4f46e5;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .content {
                    margin-bottom: 40px;
                }
                .presented-to {
                    font-size: 18px;
                    color: #6b7280;
                    margin-bottom: 15px;
                }
                .student-name {
                    font-size: 45px;
                    color: #111827;
                    font-weight: bold;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #e5e7eb;
                    display: inline-block;
                    padding-bottom: 10px;
                    min-width: 400px;
                }
                .course-info {
                    font-size: 18px;
                    color: #6b7280;
                    line-height: 1.6;
                }
                .course-name {
                    font-size: 24px;
                    color: #4f46e5;
                    font-weight: bold;
                    display: block;
                    margin: 15px 0;
                }
                .score {
                    font-size: 20px;
                    color: #059669;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    position: absolute;
                    bottom: 50px;
                    left: 80px;
                    right: 80px;
                }
                .signature-block {
                    text-align: center;
                    width: 250px;
                }
                .signature-line {
                    border-top: 2px solid #111827;
                    margin-bottom: 10px;
                }
                .signature-text {
                    font-size: 14px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .seal {
                    position: absolute;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 100px;
                    background-color: #f59e0b;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    border: 4px dashed #fff;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    text-align: center;
                }
                .meta {
                    position: absolute;
                    bottom: 15px;
                    left: 0;
                    right: 0;
                    font-size: 10px;
                    color: #9ca3af;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="header">
                    <h1 class="title">Certificat</h1>
                    <div class="subtitle">d'accomplissement</div>
                </div>
                
                <div class="content">
                    <div class="presented-to">Ce certificat est fièrement décerné à</div>
                    <div class="student-name">${studentName}</div>
                    
                    <div class="course-info">
                        Pour avoir complété avec succès le cours :
                        <span class="course-name">${courseTitle}</span>
                    </div>
                    
                    <div class="score">Score de réussite : ${score}%</div>
                </div>
                
                <div class="seal">
                    ÉDU<br>FLOW<br>VERIFIÉ
                </div>
                
                <div class="footer">
                    <div class="signature-block">
                        <div class="signature-line" style="margin-top: 40px;"></div>
                        <div class="signature-text">Plateforme EduFlow</div>
                    </div>
                    <div class="signature-block">
                        <div class="signature-line" style="margin-top: 40px;"></div>
                        <div class="signature-text">Date d'édition : ${issueDate}</div>
                    </div>
                </div>
                
                <div class="meta">
                    Code d'Authentification : ${certificateCode}
                </div>
            </div>
        </body>
        </html>
        `;

        return new NextResponse(htmlContent, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error: any) {
        console.error('Server error in generate-certificate API:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
