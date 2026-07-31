export function buildEmailLayout({
  title,
  heading,
  content,
  buttonText,
  buttonUrl,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>

<body style="
    margin:0;
    padding:40px 20px;
    background:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 8px 24px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:#0f172a;
padding:32px;
text-align:center;
">

<h1
style="
margin:0;
color:#ffffff;
font-size:28px;
font-weight:bold;
">
Matrix Structural Analysis
</h1>

<p
style="
margin-top:8px;
color:#cbd5e1;
font-size:14px;
">
Engineering Knowledge Platform
</p>

</td>
</tr>

<tr>
<td style="padding:40px;">

<h2
style="
margin-top:0;
color:#111827;
font-size:28px;
">
${heading}
</h2>

<div
style="
font-size:16px;
line-height:1.8;
color:#374151;
">
${content}
</div>

${
  buttonText && buttonUrl
    ? `
<div style="margin:40px 0;text-align:center;">

<a
href="${buttonUrl}"
style="
display:inline-block;
background:#2563eb;
color:#ffffff;
padding:14px 28px;
text-decoration:none;
border-radius:8px;
font-weight:bold;
font-size:16px;
">
${buttonText}
</a>

</div>
`
    : ""
}

<hr
style="
border:none;
border-top:1px solid #e5e7eb;
margin:40px 0;
">

<p
style="
font-size:13px;
color:#6b7280;
text-align:center;
line-height:1.6;
">

Need help?<br>

Contact us at
<a href="mailto:support@matrixstructuralanalysis.com">
support@matrixstructuralanalysis.com
</a>

</p>

</td>
</tr>

<tr>
<td
style="
background:#f9fafb;
padding:20px;
text-align:center;
font-size:12px;
color:#6b7280;
">

© ${new Date().getFullYear()} Matrix Structural Analysis

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}
