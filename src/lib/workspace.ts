/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Google Workspace client-side API integrations

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export interface GoogleGmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

/**
 * Fetch the user's upcoming primary Google Calendar events.
 */
export async function fetchUpcomingEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${now}&maxResults=8`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch calendar events.');
    }

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('fetchUpcomingEvents error:', err);
    throw err;
  }
}

/**
 * Schedule a 1-hour preparation block event on Google Calendar.
 */
export async function scheduleCalendarEvent(
  accessToken: string,
  summary: string,
  description: string,
  startIsoString: string,
  endIsoString: string
): Promise<GoogleCalendarEvent> {
  try {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const body = {
      summary,
      description,
      start: {
        dateTime: startIsoString,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      },
      end: {
        dateTime: endIsoString,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      },
      reminders: {
        useDefault: true
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to schedule calendar event.');
    }

    return await res.json();
  } catch (err) {
    console.error('scheduleCalendarEvent error:', err);
    throw err;
  }
}

/**
 * Helper to build and send a MIME formatted email using Gmail API.
 */
export async function sendRecruitmentEmail(
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string }> {
  try {
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    
    // Construct standard mime email string
    const emailStr = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText
    ].join('\n');

    // Base64Url-encode standard
    const encodedEmail = btoa(unescape(encodeURIComponent(emailStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to send Gmail message.');
    }

    return await res.json();
  } catch (err) {
    console.error('sendRecruitmentEmail error:', err);
    throw err;
  }
}

/**
 * Fetch and list recent career or recruiter related emails from the inbox.
 */
export async function fetchRecruitmentEmails(accessToken: string): Promise<GoogleGmailMessage[]> {
  try {
    // Search query for placement or recruitment keywords
    const query = 'subject:(interview OR placement OR recruit OR offer OR job OR "placement preparation")';
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`;

    const res = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch Gmail message lists.');
    }

    const data = await res.json();
    const messages: { id: string; threadId: string }[] = data.messages || [];

    // Fetch individual snippets and headers
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;
          const detailRes = await fetch(detailUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId, snippet: 'Subject details restricted.' };
          
          const detailData = await detailRes.json();
          const headers: { name: string; value: string }[] = detailData.payload?.headers || [];
          const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
          const date = headers.find(h => h.name === 'Date')?.value || '';
          
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: detailData.snippet || '',
            subject,
            from,
            date
          };
        } catch {
          return { id: msg.id, threadId: msg.threadId, snippet: 'Error reading message details.' };
        }
      })
    );

    return detailedMessages;
  } catch (err) {
    console.error('fetchRecruitmentEmails error:', err);
    throw err;
  }
}
