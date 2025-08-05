/*
 * activity.js
 *
 * This script powers the HubSpot lead categorisation activity.  It replaces
 * the previous drag‑and‑drop flow with an excel‑style table where
 * participants review engagement summaries and select the appropriate
 * lifecycle stage, lead status and lead category for each lead.  Upon
 * submission the results are posted to a Google Apps Script endpoint for
 * storage in a connected Google Sheet.  The user must enter their name
 * and email before beginning the activity.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // Data: the initial set of leads pulled from the HubSpot Activity Excel file
    // Each entry has a firstName, email, summary and blank fields for
    // lifecycleStage, leadStatus and leadCategory.  Participants are expected
    // to fill in these blanks based on the engagement summary.  The lead
    // records are hard‑coded here to avoid the need for a client‑side Excel
    // parser library.
    const leadData = [
        {
            firstName: "Viji",
            email: "vijaysha1926@gmail.com",
            summary: "Live chat: Candidate attended our OET webinar and asked for a sample study plan- we sent follow-up materials and candidate said candidate will review them.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Puspaveni",
            email: "k.puspaveni@gmail.com",
            summary: "Form: Candidate filled out our CBT inquiry form but hasn't yet replied to the introductory message we sent.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Neelam Rani",
            email: "neelani1993@gmail.com",
            summary: "Email: Candidate downloaded our OSCE free materials and responded with questions about exam centers- still evaluating training options.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Kirti",
            email: "kirtivijaysalaskar@gmail.com",
            summary: "WhatsApp call: Candidate asked for OET class schedule and fees and discussed her timeline for taking the test this quarter.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Deepu",
            email: "dittudeepu@gmail.com",
            summary: "Chatwoot: Having just cleared OET, candidate requested details about our CBT prep course and plans to enroll this week.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Vimal",
            email: "vimmrana0@gmail.com",
            summary: "3CX call: Candidate cleared CBT last month and accepted our OSCE training proposal- reviewing the payment plan we sent him.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Mezaz",
            email: "khailzkie25@yahoo.com",
            summary: "Chatwoot: Candidate is in the UK and purchased our MGS package- candidate has just started her NMC application and will attend orientation next week.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Sita",
            email: "seetamgr1234@gmail.com",
            summary: "WhatsApp: A returning candidate who previously completed OET training with us is now ready to enrol for the CBT course- we sent the payment link.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Sathish",
            email: "samdasathish27@gmail.com",
            summary: "3CX call: Candidate has already cleared both OET and CBT through our programs and now wants to join our OSCE training- we scheduled his orientation.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Jaimini",
            email: "jayminiashu1990@gmail.com",
            summary: "Live chat: After clearing the OSCE, candidate thanked us and mentioned recommending our programs to two colleagues- candidate is happy to share her testimonial.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Anusha Anu",
            email: "anushapk717@gmail.com",
            summary: "Facebook inquiry: Candidate is a mental health nurse asking about MHN OSCE requirements- we sent her details and are awaiting her reply.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "sirjana Shreesh",
            email: "elizamgr9@gmail.com",
            summary: "WhatsApp voice note: Candidate from India wants to take the OSCE via a visitor visa and asked about placement options and costs- we explained the process and candidate said candidate'll discuss with her family.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Lea",
            email: "leadevenecia@ymail.com",
            summary: "Email: Candidate completed the NMC second stage and reached out for help with visa sponsorship and COS documentation- we shared a checklist and scheduled a follow-up.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "margi",
            email: "dmargi6199@gmail.com",
            summary: "Chatwoot: Candidate inquired about nursing job placements in the UK- we sent the application form and are waiting for her to submit it.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Beverly Ann Briones",
            email: "bevzbriones@gmail.com",
            summary: "3CX call: Candidate thanked us for helping her clear the OET and confirmed candidate doesn't need additional training at the moment- candidate may refer friends.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Rupinder",
            email: "kaurpinder0111@gmail.com",
            summary: "WhatsApp: After clearing both CBT and OSCE, candidate is now seeking guidance on visa sponsorship- candidate asked about COS procedures and next steps.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Sandra",
            email: "nafbryant2707@gmail.com",
            summary: "Email follow-up: Candidate attended our OET orientation call last month but has not replied to recent messages despite multiple follow-ups.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Julaka",
            email: "julakabegum08@gmail.com",
            summary: "WhatsApp: Candidate turned out to be an allied health professional rather than a nurse, so we informed her that our programs don't fit her profession.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "JohnPatrick",
            email: "thugline25@gmail.com",
            summary: "Webinar follow-up: Candidate attended our CBT info session but hasn't responded to any messages since- our last reminder was sent last week.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        },
        {
            firstName: "Liji",
            email: "lijibennyfe@gmail.com",
            summary: "Chatwoot: Candidate recently cleared CBT and requested a quote for OSCE training- we sent her pricing and schedule and are waiting for her decision.",
            lifecycleStage: "",
            leadStatus: "",
            leadCategory: ""
        }
    ];

    // -------------------------------------------------------------------------
    // Define the allowed option lists for each property.  These values come
    // from the DOCC.docx reference document provided by the user.  Having
    // them centrally defined makes it easy to adjust the allowed values
    // without touching the rendering or submission logic.
    const lifecycleOptions = [
        "Subscriber",
        "Lead",
        "MQL – Marketing Qualified Lead",
        "SQL – Sales Qualified Lead",
        "Opportunity",
        "Open Deal",
        "Customer",
        "Second time Customer",
        "Third time Customer",
        "Evangelist",
        "Other"
    ];
    const leadStatusOptions = [
        "New Candidate",
        "Awaiting First Response",
        "Connected",
        "NMC Application Started",
        "NMC First Stage Completed",
        "ATT mail received",
        "OET Cleared",
        "CBT Cleared",
        "OSCE Cleared",
        "CBT & OSCE Cleared",
        "OET & CBT Cleared",
        "NMC Second Stage Completed",
        "ID Check Done",
        "PIN Received",
        "No Active Response",
        "Lost Communication",
        "Unqualified",
        "Unqualified – At Present",
        "Others"
    ];
    const leadCategoryOptions = [
        "CBT",
        "OET",
        "OSCE",
        "MHN OSCE",
        "VC OSCE",
        "MGS",
        "Other Registration",
        "Visa",
        "Recruitment"
    ];

    // -------------------------------------------------------------------------
    // Grab references to DOM elements
    const startSection = document.getElementById('activity-start');
    const contentSection = document.getElementById('activity-content');
    const startBtn = document.getElementById('startActivityBtn');
    const submitBtn = document.getElementById('submitActivity');
    const nameInput = document.getElementById('activityName');
    const emailInput = document.getElementById('activityEmail');
    const tableBody = document.getElementById('activityTableBody');
    const resultEl = document.getElementById('activityResult');

    /**
     * Helper to build a <select> element's HTML for a given list of options.  An
     * empty option is included at the top of each list to allow the user to
     * leave the field blank.  If a current value is provided it will be
     * pre‑selected.
     *
     * @param {Array<string>} options - the list of option values
     * @param {string} value - the currently selected value
     * @param {number} index - the row index to embed in the data-index attribute
     * @param {string} cls - additional CSS class to add to the select element
     * @returns {string} the HTML string for the select element
     */
    function buildSelect(options, value, index, cls) {
        let html = `<select class="${cls}" data-index="${index}">`;
        html += '<option value=""></option>';
        options.forEach((opt) => {
            const selected = value === opt ? ' selected' : '';
            html += `<option value="${opt}"${selected}>${opt}</option>`;
        });
        html += '</select>';
        return html;
    }

    /**
     * Render the data table.  For each lead create a table row with read‑only
     * cells for the name, email and summary, and select dropdowns for the three
     * fields participants must complete.  The data-index attribute maps each
     * input back to the corresponding lead in the leadData array.
     */
    function renderTable() {
        // clear any existing rows
        tableBody.innerHTML = '';
        leadData.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const lifecycleSel = buildSelect(lifecycleOptions, row.lifecycleStage, idx, 'lifecycle-select');
            const statusSel = buildSelect(leadStatusOptions, row.leadStatus, idx, 'leadstatus-select');
            const categorySel = buildSelect(leadCategoryOptions, row.leadCategory, idx, 'leadcategory-select');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${row.firstName}</td>
                <td>${row.email}</td>
                <td>${lifecycleSel}</td>
                <td>${statusSel}</td>
                <td>${categorySel}</td>
                <td>${row.summary}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Replace this URL with your own Apps Script web app endpoint.  The same
    // endpoint is used for both saving submissions (via POST) and fetching
    // existing records for the leaderboard (via GET).
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBTo9jUCZstiFnTgjUHk2nCEI8C1pu5Ikg2K8UZy4HJJozS0Qu4NmwkYWzCtN18O8/exec';

    // Start button handler: validate inputs, store in sessionStorage and show table
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const nameVal = nameInput.value.trim();
            const emailVal = emailInput.value.trim().toLowerCase();
            if (!nameVal || !emailVal) {
                alert('Please enter your name and email to start the activity.');
                return;
            }
            sessionStorage.setItem('activity_userName', nameVal);
            sessionStorage.setItem('activity_userEmail', emailVal);
            startSection.classList.add('hidden');
            contentSection.classList.remove('hidden');
            renderTable();
        });
    }

    // Submit button handler: gather completed rows and send to Google Sheet
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            // Build array of updated rows
            const updatedRows = leadData.map((row, idx) => {
                const lifecycle = document.querySelector(`select.lifecycle-select[data-index='${idx}']`).value.trim();
                const status = document.querySelector(`select.leadstatus-select[data-index='${idx}']`).value.trim();
                const category = document.querySelector(`select.leadcategory-select[data-index='${idx}']`).value.trim();
                return {
                    firstName: row.firstName,
                    email: row.email,
                    lifecycleStage: lifecycle,
                    leadStatus: status,
                    leadCategory: category,
                    engagementSummary: row.summary
                };
            });
            const userName = sessionStorage.getItem('activity_userName') || '';
            const userEmail = sessionStorage.getItem('activity_userEmail') || '';
            const timestamp = new Date().toISOString();
            const payload = {
                name: userName,
                email: userEmail,
                rows: updatedRows,
                timestamp
            };
            // Post the results to the Google Apps Script web app.  Replace the
            // URL below with your own deployed Apps Script endpoint if needed.
            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch((err) => {
                console.error('Error sending activity data to Google Sheet:', err);
            });
            // Provide immediate feedback to the participant
            resultEl.textContent = 'Your responses have been submitted. Thank you!';
            resultEl.className = 'activity-result success';
        });
    }
});