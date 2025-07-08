import { google } from 'googleapis';

const sheets = google.sheets('v4');

export default async function handler(req, res) {
  console.log('[DEBUG] ENV:', process.env.GOOGLE_SHEETS_CREDENTIALS?.slice(0, 30) || 'undefined');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
      throw new Error('GOOGLE_SHEETS_CREDENTIALS not defined');
    }

    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      console.log('Parsed credentials client_email:', credentials.client_email); // Debug
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SHEETS_CREDENTIALS:', parseError.message);
      return res.status(500).json({ error: `Invalid GOOGLE_SHEETS_CREDENTIALS: ${parseError.message}` });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const spreadsheetId = '1FouAChacathAvCV2JoNZKSxZdYFd90FQ4CKmhOkeeF4'; // Your Google Sheet ID
    const data = req.body; // Express parses JSON body

    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [
          [
            data.amount || '0.00',
            data.createdAt || 'N/A',
            data.date || 'N/A',
            data.name || 'N/A',
            data.website || 'N/A',
            data.paymentType || 'N/A',
            data.status || 'N/A',
            data.transactionId || 'N/A',
            data.type || 'N/A',
            data.url || 'N/A',
            data.durationMs || 0,
          ],
        ],
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return res.status(500).json({ error: error.message });
  }
}