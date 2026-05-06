<!--- sprenew_mailr.cfm - Support renewal email template --->
<!---
  Generates renewal email HTML for a single customer record.
  Called from sprenew.cfm after the renewal query has run.

  Expected variables (set by caller):
    CustID, CustName, CustEmail, ExpiryDate, runMonth
    RENEWALAMT, SUPPORTAMT
    SUPPORTPLUSAMT  (optional - only present when customer has Support Plus tier)
--->

<!--- Ensure optional amounts default to 0 when not supplied by caller --->
<cfparam name="SUPPORTPLUSAMT" default="0">
<cfparam name="RENEWALAMT"     default="0">
<cfparam name="SUPPORTAMT"     default="0">

<!--- Derived display values --->
<cfset TOTALAMT        = RENEWALAMT + SUPPORTAMT + SUPPORTPLUSAMT>
<cfset FORMATTEDEXPIRY = DateFormat(ExpiryDate, "dd mmmm yyyy")>
<cfset DISPLAYNAME     = Trim(CustName)>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RecXpress Support Renewal Notice</title>
  <style>
    body        { margin:0; padding:0; background:#f0f0f0; font-family:Arial,sans-serif; }
    .wrapper    { max-width:620px; margin:30px auto; background:#ffffff; border-radius:6px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.12); }
    .header     { background:#1b2126; padding:28px 36px; }
    .header h1  { margin:0; font-size:20px; color:#ffffff; font-weight:700; }
    .header p   { margin:6px 0 0; font-size:13px; color:#b0b8c1; }
    .body       { padding:32px 36px; color:#333333; font-size:14px; line-height:1.65; }
    .body p     { margin:0 0 14px; }
    .accent     { color:#e63329; font-weight:700; }
    .table-wrap { margin:20px 0; border:1px solid #e0e0e0; border-radius:5px; overflow:hidden; }
    table       { width:100%; border-collapse:collapse; font-size:13px; }
    th          { background:#1b2126; color:#ffffff; padding:9px 14px; text-align:left; font-weight:600; }
    td          { padding:9px 14px; border-bottom:1px solid #eeeeee; }
    tr:last-child td { border-bottom:none; }
    tr.alt td   { background:#f9f9f9; }
    .total td   { background:#f5f5f5; font-weight:700; border-top:2px solid #cccccc; }
    .highlight  { background:#fff8e1; border-left:4px solid #e63329; padding:12px 16px; border-radius:4px; margin:18px 0; font-size:13px; }
    .btn        { display:inline-block; background:#e63329; color:#ffffff; text-decoration:none; padding:11px 26px; border-radius:5px; font-weight:700; font-size:14px; margin:8px 0; }
    .footer     { background:#f5f5f5; padding:18px 36px; font-size:11px; color:#888888; border-top:1px solid #e0e0e0; }
    .footer a   { color:#e63329; text-decoration:none; }
  </style>
</head>
<body>
<div class="wrapper">

  <!--- ── Header ─────────────────────────────────────────────────────────── --->
  <div class="header">
    <h1>Peresoft &mdash; RecXpress</h1>
    <p>Support &amp; Maintenance Renewal Notice</p>
  </div>

  <!--- ── Body ──────────────────────────────────────────────────────────── --->
  <div class="body">

    <p>Dear <strong>#HTMLEditFormat(DISPLAYNAME)#</strong>,</p>

    <p>
      Your RecXpress support &amp; maintenance agreement is due for renewal.
      Please review the details below and arrange payment before the expiry date
      to avoid any interruption to your support coverage.
    </p>

    <div class="highlight">
      Your current agreement expires on <span class="accent">#FORMATTEDEXPIRY#</span>.
      Renewing promptly ensures continued access to software updates, telephone
      support, and the RecXpress customer portal.
    </div>

    <!--- ── Renewal amount table ──────────────────────────────────────────── --->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right;width:130px;">Amount (excl. GST)</th>
          </tr>
        </thead>
        <tbody>

          <!--- Base renewal --->
          <cfif RENEWALAMT GT 0>
            <tr>
              <td>RecXpress Annual Renewal</td>
              <td style="text-align:right;">#DollarFormat(RENEWALAMT)#</td>
            </tr>
          </cfif>

          <!--- Standard support --->
          <cfif SUPPORTAMT GT 0>
            <tr class="alt">
              <td>Support &amp; Maintenance</td>
              <td style="text-align:right;">#DollarFormat(SUPPORTAMT)#</td>
            </tr>
          </cfif>

          <!---
            Support Plus tier — SUPPORTPLUSAMT is set only for customers on the
            premium support plan.  The cfparam at the top of this template ensures
            the variable exists even when the caller does not supply it, preventing
            the "Variable SUPPORTPLUSAMT is undefined" error (line 345 in the
            previous build).
          --->
          <cfif SUPPORTPLUSAMT GT 0>
            <tr>
              <td>Support Plus</td>
              <td style="text-align:right;">#DollarFormat(SUPPORTPLUSAMT)#</td>
            </tr>
          </cfif>

          <!--- Total row --->
          <tr class="total">
            <td>Total Due</td>
            <td style="text-align:right;">#DollarFormat(TOTALAMT)#</td>
          </tr>

        </tbody>
      </table>
    </div>

    <p>
      All amounts are in Australian dollars and exclude GST.
      A tax invoice will be issued upon receipt of payment.
    </p>

    <p>To renew online, click the button below:</p>

    <p>
      <a href="https://www.peresoft.com/sprenew.cfm?CustList=#URLEncodedFormat(CustID)#&ExpiryDate=#URLEncodedFormat(ExpiryDate)#&runMonth=#Val(runMonth)#" class="btn">
        Renew Now
      </a>
    </p>

    <p>
      Alternatively, contact our accounts team at
      <a href="mailto:accounts@peresoft.com" style="color:#e63329;">accounts@peresoft.com</a>
      or call <strong>(03) 9xxx xxxx</strong> to arrange payment by EFT or cheque.
    </p>

    <p>
      If you believe you have received this notice in error, or if you have already
      renewed, please disregard this email or contact us so we can update our records.
    </p>

    <p>Thank you for your continued support.</p>

    <p>
      Kind regards,<br />
      <strong>Peresoft Accounts Team</strong><br />
      <a href="https://www.peresoft.com" style="color:#e63329;">www.peresoft.com</a>
    </p>

  </div>

  <!--- ── Footer ─────────────────────────────────────────────────────────── --->
  <div class="footer">
    <p>
      This email was sent to the Finance contact on record for account
      <strong>#HTMLEditFormat(CustID)#</strong>.
      If you no longer wish to receive renewal reminders, please contact
      <a href="mailto:support@peresoft.com">support@peresoft.com</a>.
    </p>
    <p style="margin-top:6px;">
      &copy; #Year(Now())# Peresoft Pty Ltd &mdash; ABN xx xxx xxx xxx
    </p>
  </div>

</div>
</body>
</html>
