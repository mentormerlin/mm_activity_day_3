// leaderboard.js

// This script fetches activity submissions from the Google Apps Script web app
// and renders them in a leaderboard format.  Each submission displays the
// participant's name, email, timestamp and a table showing their selected
// lifecycle stage, lead status and lead category for each lead.  The
// endpoint must return JSON with an array of submission objects.  Each
// submission object should have the following structure:
// {
//   name: string,
//   email: string,
//   timestamp: string,
//   rows: [
//     {
//       firstName: string,
//       email: string,
//       lifecycleStage: string,
//       leadStatus: string,
//       leadCategory: string,
//       engagementSummary: string
//     },
//     ...
//   ]
// }

document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('leaderboardStatus');
    const wrapper = document.getElementById('leaderboardWrapper');
    // Replace this URL with your own Google Apps Script endpoint if needed.
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBTo9jUCZstiFnTgjUHk2nCEI8C1pu5Ikg2K8UZy4HJJozS0Qu4NmwkYWzCtN18O8/exec';

    fetch(SCRIPT_URL)
        .then((resp) => {
            // Attempt to parse as JSON.  If the endpoint does not support CORS
            // properly, the browser may block the response and this code will
            // never run.  In that case the catch block below will show an error.
            return resp.json();
        })
        .then((data) => {
            statusEl.textContent = '';
            if (!Array.isArray(data) || data.length === 0) {
                statusEl.textContent = 'No submissions found.';
                return;
            }
            /*
             * Determine whether the returned data is already grouped by submission or
             * represents a flat list of answer rows.  A grouped object will have
             * a `rows` property containing an array of answers for that
             * submission.  If the first element does not contain `rows` we
             * assume the list is flat and group it by name/email/timestamp on
             * the client.  Grouping ensures the leader board displays one
             * card per submission with a table of answers matching the
             * original excel format.
             */
            if (data[0] && Object.prototype.hasOwnProperty.call(data[0], 'rows')) {
                // Data is already grouped – render directly
                renderSubmissions(data, wrapper);
            } else {
                // Flat list – group by submission key
                const grouped = groupRowsBySubmission(data);
                renderSubmissions(grouped, wrapper);
            }
        })
        .catch((err) => {
            console.error('Error loading leaderboard:', err);
            statusEl.textContent = 'Unable to load submissions.';
        });
});

/**
 * Render the list of submissions into the wrapper element.  Each submission is
 * displayed as a card with a heading and a table of answers.  If a
 * submission is missing the rows property or it is empty, the card will
 * display a message instead of the table.
 *
 * @param {Array<Object>} submissions - array of submission objects
 * @param {HTMLElement} wrapper - the element into which cards are appended
 */
function renderSubmissions(submissions, wrapper) {
    submissions.forEach((sub, idx) => {
        const card = document.createElement('div');
        card.className = 'leaderboard-card';
        const name = sub.name || 'Unknown';
        const email = sub.email || 'Unknown';
        const ts = sub.timestamp || '';
        const heading = document.createElement('h3');
        heading.textContent = `Submission ${idx + 1}: ${name}`;
        const meta = document.createElement('p');
        meta.innerHTML = `<strong>Email:</strong> ${email}<br/><strong>Timestamp:</strong> ${ts}`;
        card.appendChild(heading);
        card.appendChild(meta);
        // If rows exist, render a table
        if (Array.isArray(sub.rows) && sub.rows.length > 0) {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Email</th>
                    <th>Lifecycle Stage</th>
                    <th>Lead Status</th>
                    <th>Lead Category</th>
                    <th>Engagement Summary</th>
                </tr>
            `;
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            sub.rows.forEach((row, rIdx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rIdx + 1}</td>
                    <td>${row.firstName || ''}</td>
                    <td>${row.email || ''}</td>
                    <td>${row.lifecycleStage || ''}</td>
                    <td>${row.leadStatus || ''}</td>
                    <td>${row.leadCategory || ''}</td>
                    <td>${row.engagementSummary || ''}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            card.appendChild(table);
        } else {
            const msg = document.createElement('p');
            msg.textContent = 'No lead data available for this submission.';
            card.appendChild(msg);
        }
        wrapper.appendChild(card);
    });
}

/**
 * Render a flat array of answer rows into a single table.  This format
 * corresponds to an Apps Script that appends each answer row separately
 * into the spreadsheet.  Each entry in the array should have the following
 * properties: name, email, firstName, leadEmail, lifecycleStage, leadStatus,
 * leadCategory, engagementSummary and timestamp.  The function creates a
 * single table and appends it to the wrapper.
 *
 * @param {Array<Object>} rows - list of answer rows
 * @param {HTMLElement} wrapper - element where the table will be inserted
 */
function renderFlatTable(rows, wrapper) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>#</th>
            <th>Name</th>
            <th>User Email</th>
            <th>Lead First Name</th>
            <th>Lead Email</th>
            <th>Lifecycle Stage</th>
            <th>Lead Status</th>
            <th>Lead Category</th>
            <th>Engagement Summary</th>
            <th>Timestamp</th>
        </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${row.name || ''}</td>
            <td>${row.email || ''}</td>
            <td>${row.firstName || ''}</td>
            <td>${row.leadEmail || row.emailLead || ''}</td>
            <td>${row.lifecycleStage || ''}</td>
            <td>${row.leadStatus || ''}</td>
            <td>${row.leadCategory || ''}</td>
            <td>${row.engagementSummary || ''}</td>
            <td>${row.timestamp || ''}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
}

/**
 * Group a flat list of answer rows into submissions keyed by name, email
 * and timestamp.  The Google Apps Script for the activity stores each
 * answer as an individual row in the sheet.  This helper reconstructs
 * the original submission structure so that the leader board can display
 * one card per submission.  It returns an array of objects with the
 * properties: name, email, timestamp and rows.
 *
 * @param {Array<Object>} rows - flat list of answer rows from the sheet
 * @returns {Array<Object>} grouped submissions
 */
function groupRowsBySubmission(rows) {
    const map = new Map();
    rows.forEach((row) => {
        const name = row.name || '';
        const email = row.email || '';
        // some scripts may return timestamp as a Date object; convert to string
        const ts = row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp || '';
        const key = `${name}||${email}||${ts}`;
        if (!map.has(key)) {
            map.set(key, { name, email, timestamp: ts, rows: [] });
        }
        const submission = map.get(key);
        submission.rows.push({
            firstName: row.firstName || '',
            email: row.leadEmail || row.email || '',
            lifecycleStage: row.lifecycleStage || '',
            leadStatus: row.leadStatus || '',
            leadCategory: row.leadCategory || '',
            engagementSummary: row.engagementSummary || ''
        });
    });
    return Array.from(map.values());
}